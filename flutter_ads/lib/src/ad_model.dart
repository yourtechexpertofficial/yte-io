enum AdFormat { banner, native, interstitial }

AdFormat _format(String? s) => AdFormat.values.firstWhere(
      (f) => f.name == s,
      orElse: () => AdFormat.banner,
    );

/// One affiliate ad. Parsed from the remote `ads.json`.
class Ad {
  final String id;
  final AdFormat format;

  /// Where it may appear, e.g. `home_bottom`, `article_inline`, `level_complete`.
  /// Empty = any placement of the matching format.
  final List<String> placements;
  final String title;
  final String description;
  final String? imageUrl;
  final String cta;

  /// Affiliate link. Supports macros: {ad_id}, {placement}, {device_id}.
  final String targetUrl;

  /// Affiliate network name, for your own reporting.
  final String network;

  /// Relative chance of being picked (higher = more often).
  final int weight;

  /// Max impressions per user per day (0 = unlimited).
  final int dailyCap;
  final DateTime? start;
  final DateTime? end;

  const Ad({
    required this.id,
    required this.format,
    required this.targetUrl,
    this.placements = const [],
    this.title = '',
    this.description = '',
    this.imageUrl,
    this.cta = 'Learn more',
    this.network = '',
    this.weight = 1,
    this.dailyCap = 0,
    this.start,
    this.end,
  });

  factory Ad.fromJson(Map<String, dynamic> j) => Ad(
        id: j['id'] as String,
        format: _format(j['format'] as String?),
        targetUrl: j['targetUrl'] as String,
        placements: List<String>.from(j['placements'] ?? const []),
        title: j['title'] ?? '',
        description: j['description'] ?? '',
        imageUrl: j['imageUrl'],
        cta: j['cta'] ?? 'Learn more',
        network: j['network'] ?? '',
        weight: (j['weight'] ?? 1) as int,
        dailyCap: (j['dailyCap'] ?? 0) as int,
        start: j['start'] != null ? DateTime.tryParse(j['start']) : null,
        end: j['end'] != null ? DateTime.tryParse(j['end']) : null,
      );

  bool isActive(DateTime now) =>
      (start == null || !now.isBefore(start!)) &&
      (end == null || !now.isAfter(end!));
}

class AdConfig {
  final bool enabled;

  /// Minimum seconds between two interstitials.
  final int interstitialCooldownSecs;

  /// Seconds before the close button appears on an interstitial.
  final int interstitialCloseDelaySecs;
  final List<Ad> ads;

  const AdConfig({
    this.enabled = true,
    this.interstitialCooldownSecs = 180,
    this.interstitialCloseDelaySecs = 3,
    this.ads = const [],
  });

  factory AdConfig.fromJson(Map<String, dynamic> j) => AdConfig(
        enabled: j['enabled'] ?? true,
        interstitialCooldownSecs: j['interstitialCooldownSecs'] ?? 180,
        interstitialCloseDelaySecs: j['interstitialCloseDelaySecs'] ?? 3,
        ads: [
          for (final a in (j['ads'] as List? ?? const []))
            Ad.fromJson(Map<String, dynamic>.from(a as Map))
        ],
      );
}
