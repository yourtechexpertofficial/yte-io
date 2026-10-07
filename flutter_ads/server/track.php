<?php
// POST /track.php {event, adId, placement, deviceId}  (sent by AdService)
require __DIR__ . '/db.php';
header('Content-Type: application/json');

$cfg = require __DIR__ . '/config.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST'
    || !hash_equals($cfg['track_key'], $_SERVER['HTTP_X_ADS_KEY'] ?? '')) {
    http_response_code(403); exit('{"ok":false}');
}

$b = json_decode(file_get_contents('php://input'), true) ?: [];
$event = $b['event'] ?? '';
$adId  = substr((string)($b['adId'] ?? ''), 0, 64);
if (!in_array($event, ['impression', 'click'], true) || $adId === '') {
    http_response_code(400); exit('{"ok":false}');
}

try {
    // Only accept events for ads that exist (blocks junk rows).
    $st = db()->prepare(
        'INSERT INTO ad_events (ad_id, event, placement, device_id)
         SELECT id, ?, ?, ? FROM ads WHERE id = ?');
    $st->execute([
        $event,
        substr((string)($b['placement'] ?? ''), 0, 64),
        substr(preg_replace('/[^a-f0-9]/', '', (string)($b['deviceId'] ?? '')), 0, 32),
        $adId,
    ]);
    echo '{"ok":true}';
} catch (Throwable $e) {
    http_response_code(500); echo '{"ok":false}';
}
