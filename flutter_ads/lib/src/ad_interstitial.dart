import 'dart:async';

import 'package:flutter/material.dart';

import 'ad_banner.dart' show AdLabel;
import 'ad_model.dart';
import 'ad_service.dart';

/// Full-screen ad. Call at natural breaks only (level complete, after saving,
/// leaving a screen) — never on app launch or mid-action:
///
///   await showInterstitialAd(context, placement: 'level_complete');
///
/// Respects the cooldown from ads.json and shows nothing if no ad is eligible.
Future<void> showInterstitialAd(BuildContext context,
    {required String placement}) async {
  final svc = AdService.instance;
  if (!svc.interstitialReady) return;
  final ad = svc.pick(AdFormat.interstitial, placement);
  if (ad == null) return;
  svc.markInterstitialShown();
  svc.trackImpression(ad, placement);
  await Navigator.of(context, rootNavigator: true).push(MaterialPageRoute(
    fullscreenDialog: true,
    builder: (_) => _InterstitialPage(ad: ad, placement: placement),
  ));
}

class _InterstitialPage extends StatefulWidget {
  final Ad ad;
  final String placement;
  const _InterstitialPage({required this.ad, required this.placement});

  @override
  State<_InterstitialPage> createState() => _InterstitialPageState();
}

class _InterstitialPageState extends State<_InterstitialPage> {
  late int _left = AdService.instance.interstitialCloseDelaySecs;
  Timer? _t;

  @override
  void initState() {
    super.initState();
    if (_left > 0) {
      _t = Timer.periodic(const Duration(seconds: 1), (t) {
        setState(() => _left--);
        if (_left <= 0) t.cancel();
      });
    }
  }

  @override
  void dispose() {
    _t?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ad = widget.ad;
    return PopScope(
      canPop: _left <= 0,
      child: Scaffold(
        backgroundColor: Colors.black,
        body: SafeArea(
          child: Stack(children: [
            Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(mainAxisSize: MainAxisSize.min, children: [
                  if (ad.imageUrl != null)
                    Flexible(child: Image.network(ad.imageUrl!, fit: BoxFit.contain,
                        errorBuilder: (_, __, ___) => const SizedBox())),
                  const SizedBox(height: 16),
                  Text(ad.title,
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.white, fontSize: 22)),
                  const SizedBox(height: 8),
                  Text(ad.description,
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.white70)),
                  const SizedBox(height: 20),
                  FilledButton(
                    onPressed: () =>
                        AdService.instance.trackClick(ad, widget.placement),
                    child: Text(ad.cta),
                  ),
                ]),
              ),
            ),
            const Positioned(top: 12, left: 12, child: AdLabel()),
            Positioned(
              top: 4,
              right: 4,
              child: _left > 0
                  ? Padding(
                      padding: const EdgeInsets.all(12),
                      child: Text('$_left', style: const TextStyle(color: Colors.white70)))
                  : IconButton(
                      icon: const Icon(Icons.close, color: Colors.white),
                      onPressed: () => Navigator.of(context).pop(),
                    ),
            ),
          ]),
        ),
      ),
    );
  }
}
