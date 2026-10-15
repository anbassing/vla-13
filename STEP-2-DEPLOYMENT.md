# Visit Locals Alpha — Step 2 Deployment

## What changed

The visual website is preserved. The forms now share one reusable inquiry layer.

### Form sources

- Home general inquiry → `general_inquiry`
- Home / Explore experience booking → `experience_booking`
- Explore quick request → `custom_experience`
- Experience planner → `custom_journey`
- Business advisory → `business_advisory`
- Partner registration → `partner_application`
- Insight newsletter → `newsletter_subscription`

All inquiry types use the same `inquiries` table, with context fields identifying the originating experience/service.

## Hostinger deployment

1. Create the `cms.visitindonesia.co.id` subdomain.
2. Create a MySQL database and user in hPanel.
3. Import `hostinger-api/database/schema.sql` through phpMyAdmin.
4. Upload `hostinger-api` contents into the subdomain document root.
5. Copy `hostinger-api/api/config.local.php.example` to `hostinger-api/api/config.local.php`.
6. Put the real MySQL credentials and notification mailbox in `config.local.php`.
7. Ensure SSL is active for `cms.visitindonesia.co.id`.
8. Open the VLA site and submit a test form.
9. Verify the row appears in `inquiries` and the notification email arrives.

## Important

The frontend is already configured for:

`https://cms.visitindonesia.co.id/api`

So the backend must be deployed there for live submissions from the current Vercel mockup.

Until the API is deployed, the forms will not pretend to succeed: they will show an error instead. This is intentional so no lead disappears silently.
