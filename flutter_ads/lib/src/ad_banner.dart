import 'package:flutter/material.dart';
import 'package:visibility_detector/visibility_detector.dart';

import 'ad_model.dart';
import 'ad_service.dart';

/// Small "Ad" label required for transparency (and by most affiliate/app-store rules).
class AdLabel extends StatelessWidget {
  const AdLabel({super.key});
  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
        decoration: BoxDecoration(
          color: Colors.black54,
          borderRadius: BorderRadius.circular(3),
        ),
        child: const Text('Ad', style: TextStyle(color: Colors.white, fontSize: 10)),
      );
}

/// Standard banner. Drop into any layout:
///   `AdBanner(placement: 'home_bottom')`
/// Renders nothing (zero height) when no ad is available.
class AdBanner extends StatefulWidget {
  final String placement;
  final double height;
  const AdBanner({super.key, required this.placement, this.height = 60});

  @override
  State<AdBanner> createState() => _AdBannerState();
}

class _AdBannerState extends State<AdBanner> {
  Ad? _ad;
  bool _counted = false;

  @override
  void initState() {
    super.initState();
    _ad = AdService.instance.pick(AdFormat.banner, widget.placement);
  }

  @override
  Widget build(BuildContext context) {
    final ad = _ad;
    if (ad == null) return const SizedBox.shrink();
    return VisibilityDetector(
      key: Key('ad_${ad.id}_${widget.placement}'),
      onVisibilityChanged: (info) {
        // Count an impression once, when >=50% is on screen.
        if (!_counted && info.visibleFraction >= 0.5) {
          _counted = true;
          AdService.instance.trackImpression(ad, widget.placement);
        }
      },
      child: GestureDetector(
        onTap: () => AdService.instance.trackClick(ad, widget.placement),
        child: SizedBox(
          height: widget.height,
          width: double.infinity,
          child: Stack(children: [
            Positioned.fill(
              child: ad.imageUrl != null
                  ? Image.network(ad.imageUrl!, fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => _textFallback(ad))
                  : _textFallback(ad),
            ),
            const Positioned(top: 2, left: 2, child: AdLabel()),
          ]),
        ),
      ),
    );
  }

  Widget _textFallback(Ad ad) => Container(
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
        alignment: Alignment.center,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        child: Text('${ad.title} — ${ad.cta}',
            maxLines: 2, overflow: TextOverflow.ellipsis),
      );
}
