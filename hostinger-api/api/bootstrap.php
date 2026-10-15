<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
header('Cache-Control: no-store');

require_once __DIR__ . '/db.php';

function vl_json(bool $success, string $message, array $extra = [], int $status = 200): never {
    http_response_code($status);
    echo json_encode(array_merge(['success'=>$success,'message'=>$message],$extra), JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
    exit;
}

function vl_origin_ok(): bool {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed = vl_config()['cors_origins'];
    if ($origin && in_array($origin, $allowed, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
        header('Access-Control-Allow-Credentials: false');
        return true;
    }
    if (!$origin) return true; // same-origin/server-to-server
    return false;
}

if (!vl_origin_ok()) vl_json(false, 'Origin not allowed.', [], 403);
header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Access-Control-Allow-Methods: POST, OPTIONS');
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') exit;
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') vl_json(false, 'POST required.', [], 405);

function vl_input(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw ?: '', true);
    if (!is_array($data)) vl_json(false, 'Invalid JSON payload.', [], 400);
    return $data;
}

function vl_str($value, int $max = 255): ?string {
    if ($value === null) return null;
    $s = trim((string)$value);
    if ($s === '') return null;
    return mb_substr($s, 0, $max);
}

function vl_email($value): ?string {
    $s = vl_str($value, 254);
    return $s && filter_var($s, FILTER_VALIDATE_EMAIL) ? $s : null;
}

function vl_client_ip(): string {
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

function vl_rate_ok(PDO $pdo): bool {
    $limit = (int)vl_config()['rate_limit_per_hour'];
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM inquiries WHERE ip_hash = :ip AND created_at >= (NOW() - INTERVAL 1 HOUR)');
    $stmt->execute(['ip'=>hash('sha256', vl_client_ip())]);
    return (int)$stmt->fetchColumn() < $limit;
}

function vl_mail_notification(string $subject, array $payload): void {
    $cfg=vl_config();
    $to=$cfg['notification_email'];
    $from=$cfg['from_email'];
    $visitor=$payload['visitor'] ?? [];
    $lines=[
        'New Visit Locals inquiry',
        'Type: '.($payload['inquiry_type'] ?? 'general_inquiry'),
        'Page: '.($payload['page'] ?? ''),
        'Content: '.($payload['content_title'] ?? $payload['service_title'] ?? ''),
        'Name: '.($visitor['full_name'] ?? ''),
        'Email: '.($visitor['email'] ?? ''),
        'Phone: '.($visitor['phone'] ?? ''),
        'Company: '.($visitor['company'] ?? ''),
        '',
        'Details:',
        json_encode($payload['details'] ?? [], JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES),
    ];
    @mail($to, $subject, implode("\n",$lines), "From: {$from}\r\nReply-To: ".($visitor['email'] ?? $from)."\r\nContent-Type: text/plain; charset=UTF-8\r\n");
}
