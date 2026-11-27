# Content Authoring Guide

Users with `CONTENT_AUTHOR`, `ORG_ADMIN`, or `SUPER_ADMIN` roles can manage training content in `/author` or via `/api/v1/scenarios`, `/api/v1/questions`, and `/api/v1/scam-of-the-week`.

- **Tenant Scoping**: Organization authors create scenarios scoped to their `organizationId` and can publish/unpublish or delete them without affecting the global AdaptSec library (`organizationId = null`).
- **JSON Import / Export**: Use `GET /api/v1/scenarios/export` and `POST /api/v1/scenarios/import` to back up or migrate custom scenario packs.
- **Safety Rule**: All simulated links, domains, and payment handles must use clearly fictional brands (e.g., Meridian Systems, Apex FinTech, Northgate College) and never target real external brands or live infrastructure.
