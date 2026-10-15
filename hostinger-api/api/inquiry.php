<?php
declare(strict_types=1);
require_once __DIR__ . '/bootstrap.php';

$data=vl_input();
$details=is_array($data['details'] ?? null) ? $data['details'] : [];
$visitor=is_array($data['visitor'] ?? null) ? $data['visitor'] : [];

if (!empty($details['website']) || !empty($data['website'])) vl_json(true,'Received.');
$type=vl_str($data['inquiry_type'] ?? 'general_inquiry',80) ?: 'general_inquiry';
$name=vl_str($visitor['full_name'] ?? null,160);
$email=vl_email($visitor['email'] ?? null);
$phone=vl_str($visitor['phone'] ?? null,80);
$message=vl_str($details['message'] ?? null, (int)vl_config()['max_message_length']);

if (!$name) vl_json(false,'Please provide your full name.',[],422);
if (!$email && !$phone) vl_json(false,'Please provide an email address or WhatsApp number.',[],422);
if (in_array($type,['experience_booking','custom_journey','custom_experience','general_inquiry'],true) && !$message && empty($data['content_title'])) {
    vl_json(false,'Please provide a short description of your request.',[],422);
}

$pdo=vl_pdo();
if(!vl_rate_ok($pdo)) vl_json(false,'Too many requests. Please try again later.',[],429);

$ipHash=hash('sha256',vl_client_ip());
$ua=mb_substr($_SERVER['HTTP_USER_AGENT'] ?? '',0,500);
$subject='Visit Locals — '.str_replace('_',' ',ucwords($type));

$stmt=$pdo->prepare('INSERT INTO inquiries (inquiry_type,source_page,content_type,content_id,content_title,service_id,service_title,destination,full_name,email,phone,company,message,payload_json,status,ip_hash,user_agent) VALUES (:inquiry_type,:source_page,:content_type,:content_id,:content_title,:service_id,:service_title,:destination,:full_name,:email,:phone,:company,:message,:payload_json,"new",:ip_hash,:user_agent)');
$stmt->execute([
 'inquiry_type'=>$type,
 'source_page'=>vl_str($data['source_page'] ?? $data['page'] ?? '',120),
 'content_type'=>vl_str($data['content_type'] ?? null,80),
 'content_id'=>vl_str($data['content_id'] ?? null,120),
 'content_title'=>vl_str($data['content_title'] ?? null,255),
 'service_id'=>vl_str($data['service_id'] ?? null,120),
 'service_title'=>vl_str($data['service_title'] ?? null,255),
 'destination'=>vl_str($data['destination'] ?? null,160),
 'full_name'=>$name,'email'=>$email,'phone'=>$phone,
 'company'=>vl_str($visitor['company'] ?? null,255),
 'message'=>$message,
 'payload_json'=>json_encode($data,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES),
 'ip_hash'=>$ipHash,'user_agent'=>$ua
]);

vl_mail_notification($subject,$data);
vl_json(true,'Inquiry received successfully.',['inquiry_id'=>(int)$pdo->lastInsertId()]);
