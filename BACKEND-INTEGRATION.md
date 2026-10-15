# Visit Locals Backend Integration — Step 2

Implemented:

- Central reusable inquiry frontend bridge: `assets/js/vl-inquiry.js`
- Central Hostinger API scaffold: `hostinger-api/api/inquiry.php`
- Newsletter endpoint: `hostinger-api/api/subscribe.php`
- MySQL schema: `hostinger-api/database/schema.sql`
- Context-aware routing for experience, explore, business, journey planner, partner and general inquiries
- CORS allowlist, prepared statements, server validation, honeypot and basic rate limiting

The current VLA visual design is intentionally preserved. This layer changes form behavior/data routing rather than redesigning the site.
