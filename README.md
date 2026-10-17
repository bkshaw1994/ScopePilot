# ScopePilot

> **Define the scope. Document the agreement. Detect changes before they become unpaid work.**

ScopePilot is an AI-powered scope management SaaS built for freelance web developers, software consultants, and boutique agencies. It transforms messy client requirements into structured, reviewable agreements and reliably detects scope creep against an immutable, cryptographically verified baseline.

---

## 🚀 Key Differentiators

- **Explainable Scope-Change Detection:** Evaluates new client requests against an approved baseline, classifying findings into 5 distinct categories: Matched/Existing Scope, New Requirement (Potential Creep), Modified Requirement, Removed Item, or Ambiguous.
- **Cryptographic Baseline Immutability:** Approved scope versions are locked with SHA-256 hashes and protected at the database engine level by PostgreSQL triggers.
- **Human-in-the-Loop Governance:** AI proposes; human decides. Every finding allows the developer to record an explicit decision (Included in Scope, Additional Work / Change Order, Clarification Required, Declined, Accepted as New Version).
- **Client-Ready Reports:** Professional PDF/HTML exports for proposals, scope baseline agreements, and change-order audit reports.
- **Zero-Trust Multi-Tenant Architecture:** Strict Supabase Row Level Security (RLS) policies and prompt-injection-hardened AI pipelines.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router, Server Components, Route Handlers) |
| **Frontend** | React 18, TypeScript (Strict), Tailwind CSS, Lucide Icons |
| **Backend & DB** | Supabase Managed PostgreSQL 15+ with Row Level Security (RLS) |
| **Authentication** | Supabase Auth (Secure HTTP-Only Cookie Sessions) |
| **Storage** | Supabase Storage (Private document bucket with signed URLs) |
| **AI Integration** | Provider abstraction (Google Gemini 1.5/2.0 primary, OpenAI fallback) with Zod validation |
| **PDF Generation** | In-memory serverless printable PDF/HTML generator |
| **Testing** | Vitest (Unit, Integration, and 10-Scenario AI Benchmark Evaluation) |
| **Deployment** | Vercel (Edge routing, serverless execution) |

---

## 📚 Complete Project Documentation

The repository includes comprehensive production-grade documentation across all disciplines:

- [Product Requirements Document (PRD.md)](./PRD.md)
- [System Architecture (ARCHITECTURE.md)](./ARCHITECTURE.md)
- [Database Schema & RLS Specification (DATABASE.md)](./DATABASE.md)
- [API Contracts & Zod Schemas (API.md)](./API.md)
- [Application Security Architecture (SECURITY.md)](./SECURITY.md)
- [Threat Model (STRIDE) (THREAT_MODEL.md)](./THREAT_MODEL.md)
- [AI Reliability & 10-Scenario Benchmark (AI_EVALUATION.md)](./AI_EVALUATION.md)
- [Testing Strategy & Quality Gates (TESTING.md)](./TESTING.md)
- [Production Deployment Guide (DEPLOYMENT.md)](./DEPLOYMENT.md)
- [SRE Incident & Rollback Runbook (RUNBOOK.md)](./RUNBOOK.md)
- [Environment Variables Catalog (ENVIRONMENT_VARIABLES.md)](./ENVIRONMENT_VARIABLES.md)
- [Product Changelog (CHANGELOG.md)](./CHANGELOG.md)

---

## ⚡ Quickstart & Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and add your Supabase and Gemini credentials:
```bash
cp .env.example .env.local
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the landing page and developer dashboard.

### 4. Execute Automated Test Suites
```bash
# Run all automated tests (Unit, Integration, and AI Evaluation Benchmark)
npm run test

# Run unit tests only
npm run test:unit

# Run the 10-scenario AI Scope Engine Evaluation benchmark
npm run test:eval
```

### 5. Verify Production Build & Types
```bash
npm run typecheck
npm run lint
npm run build
```

---

## 🚦 Implementation Checklist (Production Readiness)

- [x] **Phase 0: Discovery & Planning** (Architecture, PRD, DB schema, API contracts, threat model, evaluation suite)
- [x] **Phase 1: Repository & Foundation** (Next.js App Router, Tailwind, Supabase Auth/DB/RLS, CI pipeline)
- [x] **Phase 2: Core Product** (Projects, structured requirements editor, proposal generator, baseline locking)
- [x] **Phase 3: AI Workflows** (Provider abstraction, Gemini/OpenAI integration, 5-category scope comparison engine, 10-case evaluation suite)
- [x] **Phase 4: Documents & UX** (PDF export, audit activity log, account deletion, responsive UI)
- [x] **Phase 5: Hardening & Testing** (RLS isolation tests, prompt injection tests, evaluation suite pass)
- [x] **Phase 6: Deployment Readiness** (Staging verification, production checklist, runbook, rollback procedures)

---

## 📄 License
Commercial SaaS product. All rights reserved.
