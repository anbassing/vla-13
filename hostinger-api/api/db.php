<?php
declare(strict_types=1);

function vl_config(): array {
    static $cfg;
    if (!$cfg) {
        $local = __DIR__ . '/config.local.php';
        $cfg = file_exists($local) ? require $local : require __DIR__ . '/config.php';
    }
    return $cfg;
}

function vl_pdo(): PDO {
    static $pdo;
    if ($pdo instanceof PDO) return $pdo;
    $c = vl_config()['db'];
    $dsn = "mysql:host={$c['host']};dbname={$c['name']};charset={$c['charset']}";
    $pdo = new PDO($dsn, $c['user'], $c['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    return $pdo;
}
