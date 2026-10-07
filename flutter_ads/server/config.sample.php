<?php
// Copy to config.php and fill in. Keep config.php OUT of public_html if you can,
// otherwise the .htaccess here blocks direct access.
return [
    'db_host' => 'localhost',
    'db_name' => 'cpuser_ads',
    'db_user' => 'cpuser_ads',
    'db_pass' => 'CHANGE_ME',
    // Shared secret sent by the app in the X-Ads-Key header on /track.php.
    // Not truly secret (it's inside the app) but stops casual spam.
    'track_key' => 'CHANGE_ME_RANDOM_STRING',
];
