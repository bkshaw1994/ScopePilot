# ScopePilot - Architecture Specification

**Version:** 1.0.0  
**Status:** Approved for Implementation (Phase 0)  
**Author:** Principal Software Architect  
**Last Updated:** October 2026  

---

## 1. Architectural Philosophy & Strategy

### 1.1 The Solo-Founder / Lean-Team Reality
A solo founder or lean engineering team cannot afford the operational overhead of fragmented microservices, Kubernetes clusters, custom Redis cache tiers, or separate backend API services. Every moving part introduces deployment friction, security vulnerabilities, monitoring debt, and failure modes.

### 1.2 The Unified Next.js + Supabase Stack
ScopePilot adopts a **clean, modular monolith architecture** built with Next.js App Router (React + TypeScript) backed by Supabase (PostgreSQL, Auth, Storage, and Row Level Security) deployed on Vercel:

```
+-----------------------------------------------------------------------+
|                             USER BROWSER                              |
|           Next.js App Router (React Server & Client Components)       |
|                Tailwind CSS + Accessible UI Components                |
+-----------------------------------+-----------------------------------+
                                    | HTTPS / TLS 1.3
                                    v
+-----------------------------------------------------------------------+
|                      NEXT.JS APPLICATION LAYER                        |
|  +---------------------------+  +----------------------------------+  |
|  |     Server Components     |  |    Server Actions & Route Handlers|  |
|  +---------------------------+  +-----------------+----------------+  |
|                                                   |                   |
|  +------------------------------------------------v----------------+  |
|  |                        SERVICE LAYER                            |  |
|  |  [ProjectService] [RequirementService] [ScopeEngine] [PdfService]  |
|  +----------------+-------------------------------+----------------+  |
|                   |                               |                   |
|  +----------------v----------------+  +-----------v----------------+  |
|  |       AI PROVIDER ADAPTER       |  |     ZOD VALIDATION LAYER   |  |
|  |  (Gemini / OpenAI / Anthropic)  |  |  (Input, Output & AI Schemas)|  |
|  +---------------------------------+  +----------------------------+  |
+-------------------+-------------------------------+-------------------+
                    |                               |
       SQL / PostgREST (RLS)          Signed URLs / S3 API
                    v                               v
+------------------------------------+ +--------------------------------+
|       SUPABASE POSTGRESQL          | |        SUPABASE STORAGE        |
|  - Multi-tenant Row Level Security | |  - Private Documents Bucket    |
|  - Baseline Immutability Triggers  | |  - Signed temporary URLs       |
|  - Audit Events & Usage Records    | |  - Strict MIME validation      |
+------------------------------------+ +--------------------------------+
```

### 1.3 Key Architectural Advantages
1. **Single Language & Type Safety:** End-to-end TypeScript from database schemas to frontend UI components. Schema updates in Postgres map directly to generated types (`supabase gen types`).
2. **Deterministic Business Logic vs. Probabilistic AI:** All authorization, state transitions, baseline locking, and audits are handled deterministically in PostgreSQL and TypeScript. AI is isolated strictly to natural-language understanding, feature extraction, and proposal drafting.
3. **Defense-in-Depth at DB Layer:** Every database query is governed by PostgreSQL Row Level Security (RLS) based on `auth.uid()`. Even if an application bug bypasses a code check, the database engine enforces tenant boundaries.
4. **Zero-Maintenance Infrastructure:** Serverless autoscaling handles traffic spikes without server provisioning, OS patching, or database maintenance windows.

---

## 2. Directory Structure & Modular Boundaries

The codebase follows a domain-driven, modular organization under `src/`:

```
/Users/2327738/Desktop/Study/Start-Up/Plan A/
├── .github/
│   └── workflows/
│       └── ci.yml                     # Automated CI: Lint, Typecheck, Tests, Build
├── docs/                              # Living design & spec documentation
├── public/                            # Static assets, icons, brand marks
├── src/
│   ├── app/                           # Next.js App Router routes & layouts
│   │   ├── (auth)/                    # Auth route group (login, register, forgot-password)
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   ├── (dashboard)/               # Authenticated workspace route group
│   │   │   ├── layout.tsx             # Dashboard shell, navigation, user menu
│   │   │   ├── page.tsx               # Analytics & Project Overview Dashboard
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx           # Projects list & filters
│   │   │   │   ├── new/page.tsx       # Project creation wizard
│   │   │   │   └── [projectId]/
│   │   │   │       ├── page.tsx       # Project summary & status
│   │   │   │       ├── requirements/  # Intake & structured requirements editor
│   │   │   │       ├── proposal/      # Proposal generation & markdown editor
│   │   │   │       ├── baseline/      # Baseline approval & version history
│   │   │   │       ├── compare/       # Scope change comparison tool
│   │   │   │       └── history/       # Audit log & past comparisons
│   │   │   └── settings/              # Profile, usage, data export, account deletion
│   │   ├── api/                       # Route Handlers
│   │   │   ├── ai/
│   │   │   │   ├── extract/route.ts   # Requirement extraction endpoint
│   │   │   │   ├── proposal/route.ts  # Proposal draft generation
│   │   │   │   └── compare/route.ts   # Scope change comparison engine
│   │   │   ├── documents/             # Upload & signed URL generator
│   │   │   ├── export/                # PDF generation endpoint
│   │   │   └── health/route.ts        # System health & readiness probe
│   │   ├── layout.tsx                 # Root layout with fonts, theme, meta
│   │   └── page.tsx                   # Public marketing landing page & pricing
│   ├── components/                    # Reusable UI & presentation components
│   │   ├── ui/                        # Low-level primitives (Button, Modal, Card, Input)
│   │   ├── forms/                     # Form components with React Hook Form + Zod
│   │   ├── layout/                    # Header, Sidebar, Footer, Breadcrumbs
│   │   ├── projects/                  # Project-specific UI widgets
│   │   ├── scope/                     # Scope comparison card, finding badge, decision selector
│   │   └── feedback/                  # Toast notifications, empty states, error boundaries
│   ├── lib/                           # Core business logic & utility modules
│   │   ├── ai/                        # AI Provider abstraction & prompts
│   │   │   ├── provider.ts            # LLM interface definition (generateStructured)
│   │   │   ├── gemini.ts              # Google Gemini implementation
│   │   │   ├── openai.ts              # OpenAI fallback implementation
│   │   │   ├── prompts/               # Secure, delimited prompt templates
│   │   │   └── token-counter.ts       # Token & usage estimation
│   │   ├── db/                        # Supabase client configurations
│   │   │   ├── client.ts              # Browser Supabase client
│   │   │   ├── server.ts              # Server-side Supabase client (cookies)
│   │   │   └── admin.ts               # Privileged service-role client (scripts/migrations only)
│   │   ├── domain/                    # Pure domain models and algorithms
│   │   │   ├── scope-engine.ts        # Comparison & classification logic
│   │   │   ├── hash.ts                # Cryptographic hashing (SHA-256 baseline verification)
│   │   │   └── normalizer.ts          # Requirement normalization & deduplication
│   │   ├── pdf/                       # PDF generation engine
│   │   │   ├── proposal-template.tsx
│   │   │   ├── baseline-template.tsx
│   │   │   └── scope-change-template.tsx
│   │   ├── security/                  # Security helpers, rate limiting & sanitization
│   │   │   ├── rate-limit.ts          # In-memory / Postgres rate limiter
│   │   │   ├── sanitize.ts            # Content sanitization
│   │   │   └── guards.ts              # Auth & project ownership assertions
│   │   └── validators/                # Strict Zod schemas
│   │       ├── auth.ts
│   │       ├── project.ts
│   │       ├── requirement.ts
│   │       ├── proposal.ts
│   │       └── scope-comparison.ts
│   └── types/                         # TypeScript interfaces and database types
│       ├── database.types.ts          # Auto-generated Supabase schema types
│       └── domain.ts                  # Application domain types
├── supabase/
│   ├── migrations/                    # SQL migrations version-controlled
│   │   ├── 00001_initial_schema.sql
│   │   ├── 00002_rls_policies.sql
│   │   └── 00003_baseline_triggers.sql
│   └── seed.sql                       # Synthetic test data for local development
└── tests/                             # Automated test suites
    ├── unit/                          # Pure logic unit tests
    ├── integration/                   # API, DB, and RLS integration tests
    ├── evaluation/                    # 10-scenario AI scope comparison benchmark
    └── e2e/                           # Playwright end-to-end critical journey
```

---

## 3. Core Modules & Component Architecture

### 3.1 AI Provider Abstraction
To prevent vendor lock-in and ensure resilience against API outages or quota cuts, all AI calls flow through a unified interface:

```typescript
export interface AIStructuredOutputRequest<T> {
  systemPrompt: string;
  userPrompt: string;
  schema: z.ZodType<T>;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
}

export interface AIProvider {
  name: string;
  generateStructured<T>(req: AIStructuredOutputRequest<T>): Promise<{
    data: T;
    usage: { promptTokens: number; completionTokens: number };
    model: string;
    latencyMs: number;
  }>;
}
```

- Primary Provider: Google Gemini 1.5 / 2.0 (superior cost-performance, large context window).
- Fallback Provider: OpenAI (GPT-4o mini / GPT-4o).
- Bounded Retries: Exponential backoff with jitter (max 2 retries).
- Output Validation: Zod parses the JSON response. If validation fails, the error is logged and a structured repair prompt is triggered once before failing gracefully.

### 3.2 Immutability & Versioning Architecture
A critical requirement is that approved baselines must **never be overwritten**.
1. When a user approves a scope:
   - A snapshot of all active requirements for that project is serialized to JSON.
   - An SHA-256 cryptographic hash of the serialized snapshot is computed.
   - A row in `scope_versions` is inserted with `is_baseline = true` and `content_hash`.
   - A row in `scope_approvals` records the approver user ID, timestamp, and notes.
2. PostgreSQL Trigger Guard:
   - A database trigger `BEFORE UPDATE OR DELETE ON scope_versions` checks if `is_baseline = true`. If true, the database throws an uncatchable exception: `"Approved scope baselines are immutable and cannot be updated or deleted."`
3. Replacing a Baseline:
   - A user cannot edit an approved baseline directly.
   - To update, the user creates a **new** draft version, modifies it, and submits a distinct approval, establishing version `v2.0`. Version `v1.0` remains permanently preserved in the audit history.

### 3.3 Scope-Change Detection Architecture
When a new client requirement or request arrives:
1. **Extraction & Chunking:** Raw client input (text or PDF document) is parsed into candidate request items.
2. **Context Assembly:** The active baseline requirements snapshot is loaded from `scope_versions`.
3. **Structured Comparison Prompt:** The LLM receives:
   - System instructions with the 5-category taxonomy rules.
   - Active baseline items with their IDs, descriptions, and acceptance criteria.
   - Untrusted new request text enclosed within strict XML boundaries (`<client_input>`).
4. **Zod Parsing:** The response is validated against `ScopeComparisonResultSchema`.
5. **Database Persistence:**
   - A `scope_comparisons` record is created.
   - Each finding is inserted into `scope_comparison_findings` with status `pending_review`.
6. **Human-in-the-Loop:** The UI presents each finding. The user assigns a formal decision (`Included`, `Additional Work`, `Clarification Required`, `Declined`, `Accepted as New Version`).

---

## 4. Integration & Service Interfaces

### 4.1 Document Processing
- Text parsing for PDFs uses pure Node.js in-memory extraction (`pdf-parse`), avoiding headless browser dependencies.
- Maximum file size: 10MB.
- Files stored in a private Supabase Storage bucket (`project-documents`) accessible only via short-lived signed URLs generated on the server.

### 4.2 PDF Export Engine
- PDF generation uses `@react-pdf/renderer` or serverless HTML-to-PDF templates.
- Output streams directly to client with appropriate HTTP headers (`application/pdf`, `Content-Disposition: attachment; filename="..."`).
- Supports UTF-8 / multi-currency symbols (₹, $, €, £) and structured tables.

---

## 5. Deployment & Runtime Topology
- **Production Host:** Vercel (Edge routing, Serverless Node.js Route Handlers).
- **Database & Storage:** Supabase Cloud (Managed Postgres 15+, Supabase Auth, S3 Storage).
- **Environment Separation:** Strict isolation between Local (`.env.local`), Preview/Staging (`.env.preview`), and Production (`.env.production`).
