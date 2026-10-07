import 'package:flutter/material.dart';
import 'package:visibility_detector/visibility_detector.dart';

import 'ad_banner.dart' show AdLabel;
import 'ad_model.dart';
import 'ad_service.dart';

/// Card that looks like list content. Put it between list items:
///   `NativeAdCard(placement: 'feed')`
class NativeAdCard extends StatefulWidget {
  final String placement;
  const NativeAdCard({super.key, required this.placement});

  @override
  State<NativeAdCard> createState() => _NativeAdCardState();
}

class _NativeAdCardState extends State<NativeAdCard> {
  Ad? _ad;
  bool _counted = false;

  @override
  void initState() {
    super.initState();
    _ad = AdService.instance.pick(AdFormat.native, widget.placement);
  }

  @override
  Widget build(BuildContext context) {
    final ad = _ad;
    if (ad == null) return const SizedBox.shrink();
    return VisibilityDetector(
      key: Key('native_${ad.id}_${widget.placement}'),
      onVisibilityChanged: (i) {
        if (!_counted && i.visibleFraction >= 0.5) {
          _counted = true;
          AdService.instance.trackImpression(ad, widget.placement);
        }
      },
      child: Card(
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: () => AdService.instance.trackClick(ad, widget.placement),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            if (ad.imageUrl != null)
              Stack(children: [
                Image.network(ad.imageUrl!,
                    height: 160,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => const SizedBox(height: 0)),
                const Positioned(top: 8, left: 8, child: AdLabel()),
              ]),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(ad.title, style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 4),
                Text(ad.description),
                const SizedBox(height: 8),
                FilledButton(
                  onPressed: () => AdService.instance.trackClick(ad, widget.placement),
                  child: Text(ad.cta),
                ),
              ]),
            ),
          ]),
        ),
      ),
    );
  }
}
