<?php
// GET /ads.php -> JSON consumed by AdService (same shape as example/ads.json)
require __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=300'); // app + CDN may cache 5 min

try {
    $pdo = db();
    $s = [];
    foreach ($pdo->query('SELECT k, v FROM ad_settings') as $r) $s[$r['k']] = $r['v'];

    $rows = $pdo->query(
        "SELECT * FROM ads WHERE active = 1
           AND (start_at IS NULL OR start_at <= UTC_TIMESTAMP())
           AND (end_at   IS NULL OR end_at   >= UTC_TIMESTAMP())"
    )->fetchAll();

    $ads = array_map(function ($r) {
        $iso = fn($d) => $d ? gmdate('Y-m-d\TH:i:s\Z', strtotime($d . ' UTC')) : null;
        return array_filter([
            'id'          => $r['id'],
            'format'      => $r['format'],
            'placements'  => $r['placements'] === '' ? [] : array_map('trim', explode(',', $r['placements'])),
            'network'     => $r['network'],
            'title'       => $r['title'],
            'description' => $r['description'],
            'cta'         => $r['cta'],
            'imageUrl'    => $r['image_url'],
            'targetUrl'   => $r['target_url'],
            'weight'      => (int)$r['weight'],
            'dailyCap'    => (int)$r['daily_cap'],
            'start'       => $iso($r['start_at']),
            'end'         => $iso($r['end_at']),
        ], fn($v) => $v !== null);
    }, $rows);

    echo json_encode([
        'enabled' => ($s['enabled'] ?? '1') === '1',
        'interstitialCooldownSecs'   => (int)($s['interstitialCooldownSecs'] ?? 180),
        'interstitialCloseDelaySecs' => (int)($s['interstitialCloseDelaySecs'] ?? 3),
        'ads' => $ads,
    ], JSON_UNESCAPED_SLASHES);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'server']);
}
