# Visit Locals — Hostinger Inquiry Backend

This folder is a deployment-ready PHP + MySQL backend for the reusable Visit Locals inquiry system.

## Target subdomain

`cms.visitindonesia.co.id`

The frontend currently points to:

`https://cms.visitindonesia.co.id/api`

Hostinger supports PHP, MySQL, AJAX and CORS on its Web/Cloud hosting plans. See Hostinger's current documentation before deployment.

## 1. Create MySQL database

In hPanel → Databases → MySQL, create:

- Database name
- Database user
- Database password

Then open phpMyAdmin and import:

`database/schema.sql`

## 2. Upload backend

Create the subdomain `cms.visitindonesia.co.id` and point its document root to a dedicated folder. Upload the contents of this folder so that:

```text
public_html/cms.visitindonesia.co.id/
  api/
    bootstrap.php
    config.php
    config.local.php
    db.php
    inquiry.php
    subscribe.php
  database/schema.sql
  .htaccess
```

Recommended: keep `config.local.php` in the API directory and replace the placeholder database credentials. The included `.htaccess` blocks direct browser access to configuration files.

## 3. Configure secrets

Create `api/config.local.php`:

```php
<?php
return [
  'db' => [
    'host' => 'localhost',
    'name' => 'YOUR_DB_NAME',
    'user' => 'YOUR_DB_USER',
    'pass' => 'YOUR_DB_PASSWORD',
    'charset' => 'utf8mb4',
  ],
  'cors_origins' => [
    'https://vla-12.vercel.app',
    'https://visitindonesia.co.id',
    'https://www.visitindonesia.co.id',
  ],
  'notification_email' => 'hello@visitindonesia.co.id',
  'from_email' => 'no-reply@visitindonesia.co.id',
  'rate_limit_per_hour' => 20,
  'max_message_length' => 8000,
];
```

## 4. Test endpoints

Open these in a browser only to confirm the server responds; POST is required for actual submission:

- `https://cms.visitindonesia.co.id/api/inquiry.php`
- `https://cms.visitindonesia.co.id/api/subscribe.php`

A GET request should return HTTP 405. This is expected.

## 5. Frontend behavior

The website now uses one shared file:

`assets/js/vl-inquiry.js`

It sends all inquiry types to the same backend endpoint:

- `experience_booking`
- `custom_experience`
- `custom_journey`
- `business_advisory`
- `general_inquiry`
- `partner_application`

Newsletter subscriptions use `subscribe.php` and the `subscribers` table.

The important part is that each request carries context such as `content_id`, `content_title`, `service_id`, `source_page`, and `inquiry_type`. This means one backend inbox can tell exactly which experience or business service generated the inquiry.

## 6. Production hardening after first successful test

- Replace placeholder CORS origins with the final public site origins.
- Add Cloudflare Turnstile/hCaptcha if spam becomes material.
- Configure a real transactional SMTP provider or verified Hostinger mailbox for reliable notification delivery.
- Move secrets to environment variables where available.
- Add authentication before building the CMS admin UI.
- Add CRUD endpoints for experiences, destinations, business services and insights.
