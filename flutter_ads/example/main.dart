import 'package:flutter/material.dart';
import 'package:yte_ads/yte_ads.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await AdService.instance.init(
    configUrl: 'https://YOUR_HOST/ads.json',
    trackingUrl: null, // or 'https://YOUR_HOST/track'
  );
  runApp(const MaterialApp(home: Home()));
}

class Home extends StatelessWidget {
  const Home({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Ads demo')),
        body: ListView.builder(
          itemCount: 20,
          itemBuilder: (_, i) => i > 0 && i % 5 == 0
              ? const NativeAdCard(placement: 'feed')
              : ListTile(title: Text('Item $i')),
        ),
        bottomNavigationBar: const SafeArea(child: AdBanner(placement: 'home_bottom')),
        floatingActionButton: FloatingActionButton(
          onPressed: () => showInterstitialAd(context, placement: 'task_done'),
          child: const Icon(Icons.check),
        ),
      );
}
