# 📋 Data Scraper BaaS — Project Planning

> **Last Updated**: 2026-04-16  
> **Status**: Planning Phase — Awaiting Approval  
> **Methodology**: Phased Development (RAD) — MVP First

---

## 🎯 Project Overview

Layanan Backend-as-a-Service (BaaS) untuk ekstraksi data e-commerce Indonesia.  
Target: Dijual sebagai produk SaaS siap pakai untuk dropshipper, analis data, dan developer.

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js + TypeScript | 20 LTS / 5.x |
| Monorepo | pnpm + Turborepo | Latest |
| Backend API | Fastify | 5.x |
| Scraping | Playwright + playwright-extra (stealth) | Latest |
| Database | PostgreSQL + Prisma ORM | 16 / 5.x |
| Cache & Queue | Redis + BullMQ | 7.x / Latest |
| Frontend | Next.js + React | 15 / 19 |
| UI Kit | shadcn/ui + Recharts | Latest |
| Auth | JWT + API Key | Custom |
| Payment | Midtrans (primary), Xendit (fallback) | Latest SDK |
| DevOps | Docker + Docker Compose | Latest |
| API Docs | @fastify/swagger (OpenAPI) | Latest |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       CLIENT LAYER                          │
│  ┌──────────────┐              ┌──────────────────────┐     │
│  │  3rd Party    │──REST API──▶│  Fastify API Gateway │     │
│  │  Developer    │  (API Key)  │                      │     │
│  └──────────────┘              └──────┬───────────────┘     │
│  ┌──────────────┐              ┌──────▼───────────────┐     │
│  │  Dashboard    │──Browser───▶│  Next.js Frontend    │     │
│  │  User         │  (JWT)      │                      │     │
│  └──────────────┘              └──────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                        │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  Fastify API Server                   │   │
│  │  • Route validation (Zod)                             │   │
│  │  • API Key auth middleware                            │   │
│  │  • Quota enforcement                                  │   │
│  │  • Rate limiting                                      │   │
│  │  • Cache check (Redis) → if miss, enqueue to BullMQ  │   │
│  └──────────────┬──────────────────────┬────────────────┘   │
│                 │                      │                     │
│          ┌──────▼──────┐       ┌───────▼───────┐            │
│          │  Redis 7    │       │ PostgreSQL 16 │            │
│          │  • Cache    │       │  • Products   │            │
│          │  • Sessions │       │  • Users      │            │
│          │  • Queue    │       │  • Billing    │            │
│          └──────┬──────┘       │  • Audit Logs │            │
│                 │              └───────────────┘            │
│          ┌──────▼──────┐                                    │
│          │  BullMQ     │                                    │
│          │  Job Queue  │                                    │
│          └──────┬──────┘                                    │
└─────────────────┼───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                      WORKER LAYER                           │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Scraping Worker Pool                     │   │
│  │                                                       │   │
│  │  BaseScraper (Abstract OOP)                           │   │
│  │    ├── TokopediaScraper                               │   │
│  │    ├── ShopeeScraper                                  │   │
│  │    └── [Future: Bukalapak, Lazada, Blibli]            │   │
│  │                                                       │   │
│  │  • Playwright + Stealth Plugin                        │   │
│  │  • Proxy Rotation (residential)                       │   │
│  │  • User-Agent Rotation                                │   │
│  │  • Human-like behavior (delays, scrolling)            │   │
│  │  • Data normalization pipeline                        │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 Monorepo Structure

```
Data-Scrapper/
├── apps/
│   ├── api/              # Fastify REST API
│   ├── worker/           # Scraping workers (BullMQ consumers)
│   └── web/              # Next.js dashboard + landing page
├── packages/
│   ├── db/               # Prisma schema + client
│   ├── shared-types/     # TypeScript interfaces
│   └── config/           # Shared env validation + plan config 
├── docker/               # Dockerfiles + docker-compose
├── docs/                 # API docs, deployment guide
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.base.json
```

---

## 📅 Development Phases

### Phase 1 — MVP Core (Week 1-3) ✅ SELESAI
> Scraping Engine + API Gateway + Database

- [x] Monorepo setup (pnpm + Turborepo + TypeScript)
- [x] Docker Compose (PostgreSQL + Redis)
- [x] Prisma schema + migrations
- [x] Shared types package
- [x] Fastify API server
  - [x] Plugin system (auth, redis, prisma, swagger, jwt)
  - [x] `GET /api/v1/search` endpoint
  - [x] `GET /api/v1/product/details` endpoint
  - [x] `GET /api/v1/task/status/:taskId` endpoint
  - [x] `GET /health` endpoint
- [x] BullMQ queue setup
  - [x] Search queue + processor
  - [x] Product detail queue + processor
- [x] Scraping engine
  - [x] `BaseScraper` abstract class
  - [x] `TokopediaScraper` implementation
  - [x] `ShopeeScraper` implementation
  - [x] Browser manager (singleton lifecycle)
  - [x] Context factory (stealth + fingerprint)
  - [x] Proxy rotator
- [x] Data normalizers (price, stock, review)
- [x] Cache service (Redis TTL 24-48h)
- [x] Audit logging

### Phase 2 — Dashboard & Auth (Week 4-5) ✅ SELESAI
> User Management + API Key CRUD + Usage Stats

- [x] Auth system (register, login, JWT refresh, /me)
- [x] API Key management (generate, revoke, rotate)
- [x] Rate limiting per API key (via @fastify/rate-limit)
- [x] Quota enforcement middleware (via auth plugin)
- [x] Next.js dashboard
  - [x] Login / Register pages
  - [x] Overview dashboard (stats cards, usage chart)
  - [x] API Key management page
  - [x] Interactive API docs (Swagger embed)
  - [x] Settings page

### Phase 3 — Monetization (Week 6-7) 🟢
> Payment Gateway + Billing + Subscriptions

- [ ] Plan definitions (Free/Starter/Pro/Enterprise)
- [ ] Midtrans integration (Snap payment)
- [ ] Webhook handler (payment confirmation)
- [ ] Top-up flow (UI → API → Midtrans → Webhook → Quota update)
- [ ] Transaction history page
- [ ] Billing dashboard

### Phase 4 — Polish & Launch (Week 8) 🔵
> Landing Page + Docker + Documentation

- [ ] Landing page (Hero, Features, Pricing, CTA)
- [ ] Docker multi-stage builds
- [ ] Full docker-compose stack
- [ ] README.md (comprehensive)
- [ ] API documentation
- [ ] Deployment guide
- [ ] Final testing & bug fixes


---

## 💰 Pricing Plans

| Plan | Harga/bulan | Quota Request | Rate Limit (req/min) |
|---|---|---|---|
| **Free** | Rp 0 | 100 | 10 |
| **Starter** | Rp 99.000 | 5.000 | 50 |
| **Pro** | Rp 299.000 | 25.000 | 200 |
| **Enterprise** | Rp 999.000 | 100.000 | 1.000 |

---

## 🔑 API Response Format

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "taskId": "550e8400-e29b-41d4-a716-446655440000",
    "cached": false,
    "marketplace": "tokopedia",
    "scrapedAt": "2026-04-16T03:00:00Z",
    "responseTime": 1250
  },
  "error": null,
  "pagination": {
    "page": 1,
    "perPage": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## ⚙️ Environment Variables

```env
# Server
NODE_ENV=development
API_PORT=3001
API_HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/datascraper

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Scraping
PROXY_LIST=proxy1:port,proxy2:port,proxy3:port
BROWSER_HEADLESS=true
MAX_CONCURRENT_JOBS=5
CACHE_TTL_HOURS=24

# Payment
MIDTRANS_SERVER_KEY=SB-Mid-server-xxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxx
MIDTRANS_IS_PRODUCTION=false

# Xendit (fallback)
XENDIT_SECRET_KEY=xnd_development_xxx
```

---

## 📝 Notes

- **OOP Pattern**: `BaseScraper` → `TokopediaScraper` / `ShopeeScraper` (Strategy + Template Method pattern)
- **Adding new marketplace**: Cukup buat class baru `extends BaseScraper` + tambah enum `Marketplace`
- **Scalability**: Workers bisa di-scale horizontal (multiple instances pointing to same Redis)
- **Anti-detection**: playwright-extra stealth + residential proxy + random delays + fingerprint rotation
