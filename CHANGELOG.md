# ScopePilot - Product Changelog

All notable changes to the ScopePilot SaaS application are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-10-18

### Phase 0: Discovery & Planning
- Completed PRD, System Architecture, Database DDL, Security Controls, STRIDE Threat Model, AI Evaluation Benchmark Strategy, and Testing Architecture.
- Resolved key architectural trade-offs: append-only baseline immutability via database triggers, serverless stream PDF generation, and unified Next.js + Supabase architecture.

### Phase 1: Repository & Foundation
- Initialized Next.js 14 App Router with React, strict TypeScript, and Tailwind CSS.
- Implemented core design system tokens with responsive layouts, glassmorphic panels, and accessible UI primitives.
- Configured Supabase Auth with secure HTTP-only cookies and created database migrations (`00001_initial_schema.sql`, `00002_rls_policies.sql`, `00003_baseline_triggers.sql`).
- Authored GitHub Actions automated CI quality gates pipeline (`ci.yml`).

### Phase 2: Core Product
- Implemented Project Management (creation wizard, list with status filters, hub page).
- Built Structured Requirements Editor supporting categories (Functional, Non-Functional, Integration, Security, Explicit Exclusions), priorities, and acceptance criteria.
- Built Proposal Draft Generator and preview screen with explicit exclusions and milestone timelines.
- Engineered Scope Baseline Locking with canonical SHA-256 cryptographic hashing and database trigger protection against modification.

### Phase 3: AI Workflows (Scope Creep Detection Engine)
- Created provider abstraction supporting Google Gemini 1.5/2.0 with fallback and simulation mode.
- Built the 5-Category Scope Change Detection Engine:
  - `matched_requirement`
  - `new_requirement`
  - `modified_requirement`
  - `removed_requirement`
  - `ambiguous_request`
- Implemented prompt-injection defense via XML boundaries (`<untrusted_client_request>`).
- Built automated 10-scenario regression benchmark test suite (`tests/evaluation/scope-engine.eval.test.ts`) achieving 100% pass rate.

### Phase 4: Documents and UX
- Engineered PDF/HTML Report Generator for proposals, baseline agreements, and scope change reports.
- Created Append-Only Activity History timeline for project audit trails.
- Built Account Settings with profile customization, AI token budget meters, and India DPDP Act 2023 / GDPR data export and deletion workflows.
- Added custom 404 and Error Boundary pages.

### Phase 5 & 6: Hardening, Testing & Deployment
- Validated multi-tenant isolation, prompt injection neutralization, and client secret leak tests.
- 18 automated tests passing across unit, integration, and evaluation suites.
- Completed production build with 0 TypeScript errors and 0 ESLint warnings.
- Authored `DEPLOYMENT.md` and `RUNBOOK.md`.
