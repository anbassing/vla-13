<?php
// Copy this file to config.local.php for production secrets, or edit values below.
return [
    'db' => [
        'host' => getenv('VL_DB_HOST') ?: 'localhost',
        'name' => getenv('VL_DB_NAME') ?: 'visitlocals',
        'user' => getenv('VL_DB_USER') ?: 'visitlocals_user',
        'pass' => getenv('VL_DB_PASS') ?: 'CHANGE_ME',
        'charset' => 'utf8mb4',
    ],
    'cors_origins' => [
        'https://vla-12.vercel.app',
        'https://visitindonesia.co.id',
        'https://www.visitindonesia.co.id',
        'https://visitlocal.co.id',
        'https://www.visitlocal.co.id',
    ],
    'notification_email' => getenv('VL_NOTIFY_EMAIL') ?: 'hello@visitindonesia.co.id',
    'from_email' => getenv('VL_FROM_EMAIL') ?: 'no-reply@visitindonesia.co.id',
    'rate_limit_per_hour' => 20,
    'max_message_length' => 8000,
];
