# yte_ads — your own ads in Flutter

Show affiliate offers as banner / native / interstitial ads, with no Google
AdMob account needed. Ads are defined in a JSON file you host, so you can
change them without releasing a new app version.

## Setup
1. Copy `flutter_ads/` into your app (or `path:` dependency in pubspec):
   ```yaml
   dependencies:
     yte_ads:
       path: ../flutter_ads
   ```
2. Android: add to `AndroidManifest.xml` (outside `<application>`) so links can open:
   ```xml
   <queries><intent><action android:name="android.intent.action.VIEW"/><data android:scheme="https"/></intent></queries>
   ```
   iOS: add `https` to `LSApplicationQueriesSchemes` if needed.
3. Host `example/ads.json` (GitHub Pages / Firebase Hosting / S3) and replace the
   example offers with your affiliate links.
4. `await AdService.instance.init(configUrl: '...')` in `main()`.
5. Place widgets: `AdBanner`, `NativeAdCard`, `showInterstitialAd(...)` — see `example/main.dart`.

## Link macros
`{ad_id}`, `{placement}`, `{device_id}` in `targetUrl` are replaced at click time —
map them to your network's sub-ID params to see which ad/placement earns.

## Rules to stay safe on the stores
- Always keep the "Ad" label; only promote offers your network permits in apps.
- Interstitials only at natural breaks (not on launch, not on back-press); cooldown + delayed close are built in.
- No ads that look like system dialogs/buttons, no misleading close buttons.
- Disclose affiliate links in your privacy policy (and the Play "Data safety" form if you use `trackingUrl`).
- Don't show ads to children's/Designed-for-Families apps without checking policy.

## Moving to AdMob later
All ad placement goes through three widgets/functions. When approved, swap their
internals (or fall back to AdMob when `AdService.pick` returns null) — screens don't change.
