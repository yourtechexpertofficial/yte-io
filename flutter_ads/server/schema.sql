CREATE TABLE ads (
  id            VARCHAR(64)  NOT NULL PRIMARY KEY,           -- e.g. 'hosting-deal-banner'
  format        ENUM('banner','native','interstitial') NOT NULL,
  placements    VARCHAR(255) NOT NULL DEFAULT '',            -- comma separated, empty = any
  network       VARCHAR(64)  NOT NULL DEFAULT '',
  title         VARCHAR(160) NOT NULL DEFAULT '',
  description   VARCHAR(500) NOT NULL DEFAULT '',
  cta           VARCHAR(40)  NOT NULL DEFAULT 'Learn more',
  image_url     VARCHAR(500) NULL,
  target_url    VARCHAR(1000) NOT NULL,                      -- affiliate link, may contain {ad_id} {placement} {device_id}
  weight        INT UNSIGNED NOT NULL DEFAULT 1,
  daily_cap     INT UNSIGNED NOT NULL DEFAULT 0,
  start_at      DATETIME NULL,                               -- UTC
  end_at        DATETIME NULL,                               -- UTC
  active        TINYINT(1) NOT NULL DEFAULT 1,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE ad_settings (
  k VARCHAR(64) NOT NULL PRIMARY KEY,
  v VARCHAR(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO ad_settings (k, v) VALUES
  ('enabled', '1'),
  ('interstitialCooldownSecs', '180'),
  ('interstitialCloseDelaySecs', '3');

CREATE TABLE ad_events (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ad_id      VARCHAR(64) NOT NULL,
  event      ENUM('impression','click') NOT NULL,
  placement  VARCHAR(64) NOT NULL DEFAULT '',
  device_id  VARCHAR(32) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX (ad_id, event, created_at),
  INDEX (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Example ad
INSERT INTO ads (id, format, placements, network, title, cta, image_url, target_url, weight, daily_cap)
VALUES ('hosting-deal-banner', 'banner', 'home_bottom', 'my-affiliate-network', '50% off hosting', 'Get deal',
        'https://example.com/banners/hosting-320x60.png',
        'https://affiliate.example.com/click?offer=123&sub1={ad_id}&sub2={placement}&sub3={device_id}', 3, 10);

-- Report: performance per ad
-- SELECT ad_id,
--   SUM(event='impression') AS impressions, SUM(event='click') AS clicks,
--   ROUND(100*SUM(event='click')/NULLIF(SUM(event='impression'),0),2) AS ctr_pct
-- FROM ad_events GROUP BY ad_id ORDER BY clicks DESC;
