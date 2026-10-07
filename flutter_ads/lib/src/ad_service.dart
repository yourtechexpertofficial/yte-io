import 'dart:convert';
import 'dart:math';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';

import 'ad_model.dart';

/// Singleton entry point. Call [AdService.init] once in `main()`.
///
/// Ads come from a JSON file you host anywhere (GitHub Pages, S3, Firebase
/// Hosting...), so you can add/remove/swap affiliate offers without shipping an
/// app update. The last good copy is cached locally for offline use.
class AdService {
  AdService._();
  static final AdService instance = AdService._();

  static const _cacheKey = 'yte_ads_config';
  static const _deviceKey = 'yte_ads_device_id';

  late SharedPreferences _prefs;
  late String _deviceId;
  String? _trackingUrl;
  AdConfig _config = const AdConfig();
  DateTime? _lastInterstitial;
  final _rng = Random();

  /// Set false to hide ads everywhere (e.g. premium users).
  bool adsEnabled = true;

  /// [configUrl]   URL of your hosted ads.json.
  /// [trackingUrl] optional endpoint; receives POST {event, adId, placement,
  ///               deviceId, network, ts} for impressions and clicks.
  /// [fallback]    ads bundled in the app, used on first launch if offline.
  Future<void> init({
    required String configUrl,
    String? trackingUrl,
    AdConfig fallback = const AdConfig(),
  }) async {
    _prefs = await SharedPreferences.getInstance();
    _trackingUrl = trackingUrl;
    _config = fallback;
    _deviceId = _prefs.getString(_deviceKey) ??
        (() {
          final id = List.generate(16, (_) => _rng.nextInt(16).toRadixString(16)).join();
          _prefs.setString(_deviceKey, id);
          return id;
        })();

    final cached = _prefs.getString(_cacheKey);
    if (cached != null) {
      try {
        _config = AdConfig.fromJson(jsonDecode(cached));
      } catch (_) {}
    }
    // Refresh in background; never block app start.
    _refresh(configUrl);
  }

  Future<void> _refresh(String url) async {
    try {
      final r = await http.get(Uri.parse(url)).timeout(const Duration(seconds: 8));
      if (r.statusCode == 200) {
        _config = AdConfig.fromJson(jsonDecode(r.body));
        await _prefs.setString(_cacheKey, r.body);
      }
    } catch (e) {
      debugPrint('AdService: config refresh failed: $e');
    }
  }

  /// Weighted-random pick of an eligible ad (date window + daily cap).
  Ad? pick(AdFormat format, String placement) {
    if (!adsEnabled || !_config.enabled) return null;
    final now = DateTime.now();
    final pool = _config.ads.where((a) =>
        a.format == format &&
        a.isActive(now) &&
        (a.placements.isEmpty || a.placements.contains(placement)) &&
        (a.dailyCap == 0 || _shownToday(a.id) < a.dailyCap)).toList();
    if (pool.isEmpty) return null;
    final total = pool.fold<int>(0, (s, a) => s + max(a.weight, 1));
    var roll = _rng.nextInt(total);
    for (final a in pool) {
      roll -= max(a.weight, 1);
      if (roll < 0) return a;
    }
    return pool.last;
  }

  // ---- interstitial pacing ------------------------------------------------
  bool get interstitialReady =>
      _lastInterstitial == null ||
      DateTime.now().difference(_lastInterstitial!).inSeconds >=
          _config.interstitialCooldownSecs;
  void markInterstitialShown() => _lastInterstitial = DateTime.now();
  int get interstitialCloseDelaySecs => _config.interstitialCloseDelaySecs;

  // ---- tracking -----------------------------------------------------------
  String _dayKey(String id) {
    final d = DateTime.now();
    return 'yte_ads_${id}_${d.year}${d.month}${d.day}';
  }

  int _shownToday(String id) => _prefs.getInt(_dayKey(id)) ?? 0;

  void trackImpression(Ad ad, String placement) {
    _prefs.setInt(_dayKey(ad.id), _shownToday(ad.id) + 1);
    _send('impression', ad, placement);
  }

  Future<void> trackClick(Ad ad, String placement) async {
    _send('click', ad, placement);
    final url = ad.targetUrl
        .replaceAll('{ad_id}', Uri.encodeComponent(ad.id))
        .replaceAll('{placement}', Uri.encodeComponent(placement))
        .replaceAll('{device_id}', _deviceId);
    await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
  }

  void _send(String event, Ad ad, String placement) {
    final url = _trackingUrl;
    if (url == null) return;
    http
        .post(Uri.parse(url),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({
              'event': event,
              'adId': ad.id,
              'network': ad.network,
              'placement': placement,
              'deviceId': _deviceId,
              'ts': DateTime.now().toUtc().toIso8601String(),
            }))
        .catchError((_) => http.Response('', 500)); // fire and forget
  }
}
