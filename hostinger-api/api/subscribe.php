<?php
declare(strict_types=1);
require_once __DIR__ . '/bootstrap.php';
$data=vl_input();
if (!empty($data['website'])) vl_json(true,'Subscribed.');
$details=is_array($data['details'] ?? null) ? $data['details'] : [];
$email=vl_email(($data['visitor']['email'] ?? null) ?: ($details['email'] ?? null));
if(!$email) vl_json(false,'Please provide a valid email address.',[],422);
$pdo=vl_pdo();
$stmt=$pdo->prepare('INSERT INTO subscribers (email,source_page,status) VALUES (:email,:source_page,"active") ON DUPLICATE KEY UPDATE status="active",updated_at=CURRENT_TIMESTAMP');
$stmt->execute(['email'=>$email,'source_page'=>vl_str($data['source_page'] ?? $data['page'] ?? '',120)]);
vl_json(true,'Subscription received.');
