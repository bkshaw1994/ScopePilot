# ScopePilot

> **Define the scope. Document the agreement. Detect changes before they become unpaid work.**

ScopePilot is an AI-powered scope management SaaS built for freelance web developers, software consultants, and boutique agencies. It transforms messy client requirements into structured, reviewable agreements and reliably detects scope creep against an immutable, cryptographically verified baseline.

---

## 🚀 Key Differentiators

- **Explainable Scope-Change Detection:** Evaluates new client requests against an approved baseline, classifying findings into 5 distinct categories: Matched/Existing, New Requirement, Modified Requirement, Removed Requirement, or Ambiguous.
- **Cryptographic Baseline Immutability:** Approved scope versions are locked with SHA-256 hashes and protected at the database engine level by PostgreSQL triggers.
- **Human-in-the-Loop Governance:** AI proposes; human decides. Every finding allows the developer to record an explicit decision (Included, Additional Work, Clarification Required, Declined, Accepted as New Version).
- **Client-Ready Reports:** Professional PDF exports for proposals, scope baseline agreements, and change-order reports.
- **Zero-Trust Multi-Tenant Architecture:** Strict Supabase Row Level Security (RLS) policies and prompt-injection-hardened AI pipelines.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14/15 (App Router, Server Components, Route Handlers) |
| **Frontend** | React, TypeScript (Strict), Tailwind CSS, Lucide Icons |
| **Backend & DB** | Supabase Managed PostgreSQL 15+ with Row Level Security (RLS) |
| **Authentication** | Supabase Auth (Secure HTTP-Only Cookies) |
| **Storage** | Supabase Storage (Private document bucket with signed URLs) |
| **AI Integration** | Provider abstraction (Google Gemini primary, OpenAI fallback) with Zod validation |
| **PDF Generation** | In-memory serverless PDF generation |
| **Testing** | Vitest (Unit & Integration), Playwright (E2E), 10-Scenario AI Benchmark |
| **Deployment** | Vercel (Edge routing, serverless execution) |

---

## 📚 Architectural & Technical Documentation

The project includes production-grade documentation across all disciplines:

- [Product Requirements Document (PRD.md)](./PRD.md)
- [System Architecture (ARCHITECTURE.md)](./ARCHITECTURE.md)
- [Database Schema & RLS Specification (DATABASE.md)](./DATABASE.md)
- [API Contracts & Zod Schemas (API.md)](./API.md)
- [Application Security Architecture (SECURITY.md)](./SECURITY.md)
- [Threat Model (STRIDE) (THREAT_MODEL.md)](./THREAT_MODEL.md)
- [AI Reliability & 10-Scenario Benchmark (AI_EVALUATION.md)](./AI_EVALUATION.md)
- [Testing Strategy & Quality Gates (TESTING.md)](./TESTING.md)
- [Environment Variables Catalog (ENVIRONMENT_VARIABLES.md)](./ENVIRONMENT_VARIABLES.md)

---

## 🚦 Phased Implementation Roadmap

- [x] **Phase 0: Discovery & Planning** (Architecture, PRD, DB schema, API contracts, threat model, evaluation suite)
- [ ] **Phase 1: Repository & Foundation** (Next.js App Router, Tailwind, Supabase Auth/DB/RLS, CI pipeline)
- [ ] **Phase 2: Core Product** (Projects, structured requirements editor, proposal generator, baseline locking)
- [ ] **Phase 3: AI Workflows** (Provider abstraction, Gemini/OpenAI integration, 5-category scope comparison engine)
- [ ] **Phase 4: Documents & UX** (PDF export, audit activity log, account deletion, responsive UI)
- [ ] **Phase 5: Hardening & Testing** (RLS isolation tests, prompt injection tests, E2E journey, benchmark validation)
- [ ] **Phase 6: Deployment Readiness** (Staging verification, production checklist, runbook, rollback procedures)

---

## 📄 License
Commercial SaaS product. All rights reserved.
