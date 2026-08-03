# User Taste Preferences
- Communicates in Malay (Bahasa Melayu) mixed with English technical terms. Confidence: 0.95
- Gives brief, direct instructions with exact structure/requirements up front. Confidence: 0.85
- Prefers layered architecture with clear separation: Controllers (thin HTTP boundary) → Services (business logic) → Repositories (DB queries) → Models (typed row shapes/DTOs). Confidence: 0.9
- Likes Laravel-style directory conventions (Controllers/, Services/, Repositories/, Models/, Middleware/, Requests/, Exceptions/) applied to non-PHP projects. Confidence: 0.9
- Prefers Controllers to stay thin — parse/validate input, delegate to Service, return response — no business logic in controllers. Confidence: 0.9
- Uses Hono + TypeScript + Drizzle ORM + Cloudflare Workers/D1. Confidence: 0.85
- Prefers Zod for request validation (mirrors Laravel FormRequest pattern). Confidence: 0.85
- Uses Vitest for testing. Confidence: 0.8
