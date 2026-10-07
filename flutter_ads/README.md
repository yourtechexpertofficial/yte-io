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
3. Backend on your shared hosting (MySQL + PHP, see below) — or just host `example/ads.json` statically.
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

## Backend: MySQL on shared hosting
The app never talks to MySQL directly (credentials would be extractable from the APK).
`server/` is a tiny PHP API that sits in front of your database:

1. cPanel → MySQL Databases: create a DB + user. phpMyAdmin → import `server/schema.sql`.
2. Upload `server/` to e.g. `public_html/ads-api/`. Copy `config.sample.php` → `config.php`, fill in DB creds and a random `track_key`.
3. Test: `https://yourdomain.com/ads-api/ads.php` should return JSON. Use HTTPS only.
4. In the app: `configUrl: '.../ads.php'`, `trackingUrl: '.../track.php'`, `trackingKey: '<track_key>'`.
5. Manage ads by editing the `ads` table in phpMyAdmin (set `active=0` to pause; `ad_settings` holds cooldown/kill switch). Times are UTC.
6. Stats: run the report query at the bottom of `schema.sql`.

Notes: `ads.php` is cached 5 min, so DB changes appear within ~5 min. The DB user only needs
SELECT on `ads`/`ad_settings` and INSERT on `ad_events`. Prune old events occasionally
(`DELETE FROM ad_events WHERE created_at < NOW() - INTERVAL 90 DAY`).
