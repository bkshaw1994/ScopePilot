# ScopePilot - Product Requirements Document (PRD)

**Version:** 1.0.0  
**Status:** Approved for Implementation (Phase 0)  
**Author:** Principal Software Architect & Product Lead  
**Last Updated:** October 2026  

---

## 1. Executive Summary & Problem Statement

### 1.1 The Problem
Freelance web/software developers and boutique software agencies routinely suffer from **uncontrolled scope creep** and **unpaid revisions**. Client requirements are typically delivered across fragmented channels (email threads, messy Google Docs, Slack messages, voice notes, and annotated PDFs). Key failure points include:
1. **Ambiguous Initial Scope:** Initial proposals omit explicit non-functional assumptions, technical exclusions, and measurable acceptance criteria.
2. **Loss of Baseline:** Once work begins, subsequent client requests blur the boundary between what was originally agreed upon and what constitutes new, billable work.
3. **Conflict & Unpaid Work:** Developers hesitate to push back without clear, objective evidence, resulting in profit erosion, project delays, and strained client relationships.

### 1.2 The Solution: ScopePilot
ScopePilot is a focused B2B SaaS engineered to **Define the scope, Document the agreement, and Detect changes before they become unpaid work**.

It is not an all-in-one project management tool (Jira/Trello), an invoicing platform, or a generic conversational chatbot. Its core differentiator is an **explainable, deterministic-backed scope change detection engine** that compares new client requests against an immutable, cryptographically hashed baseline scope.

---

## 2. Target Persona & Market

### 2.1 Primary Personas
- **Freelance Web & Full-Stack Developers:** Solo developers building React/Next.js/Node.js web applications, e-commerce storefronts, and custom APIs. Typically charge fixed-price or milestone-based rates.
- **Independent Technical Consultants:** Senior contractors managing client architecture and direct stakeholder requirements.
- **Boutique Software Agencies (2–10 engineers):** Small agencies needing standardized proposal generation, client scope sign-offs, and clear change-order documentation.

### 2.2 Geographic Focus
- **Launch Market:** India (freelancers, tech contractors, export agencies working with domestic and international clients).
- **International Readiness:** Multi-currency support (INR `₹`, USD `$`, EUR `€`, GBP `£`), UTC timestamping with localized formatting, and compliance readiness for India DPDP (Digital Personal Data Protection Act) and EU GDPR.

---

## 3. Product Vision & Non-Goals

### 3.1 Core Principles
1. **Explainable AI:** AI proposes; human decides. The system provides quotes, original references, difference explanations, and confidence scores. It never automatically rejects or commits changes.
2. **Strict Immutability:** Once a scope baseline is approved, it cannot be modified. Any revision constitutes a distinct, versioned baseline with an audit trail.
3. **Data Privacy & Security First:** Untrusted client documents are processed with strict isolation. Customer data is never used to train public foundation models. Multi-tenant data isolation is enforced at the database layer via Row Level Security (RLS).
4. **Lean & High Performance:** Minimal operational overhead, instant dashboard loading, sub-second route changes, and sub-15s AI scope comparisons.

### 3.2 Explicit Non-Goals (Phase 1 Deferred)
- No Kanban boards, sprint planners, or task assignees.
- No real-time chat widgets or autonomous client email replies.
- No automated invoicing or payment gateway processing (deferred until core value is validated).
- No Git repository or GitHub issue synchronization.
- No multi-agent autonomous negotiation.

---

## 4. User Journey & Core Workflows

### 4.1 Workflow 1: Project Setup & Requirement Intake
1. User creates a project with details: Title, Client Name, Client Reference/Email, Currency, Description.
2. User provides raw requirements via:
   - Direct text paste (email snippets, chat transcripts).
   - Document upload (PDF, TXT, Markdown; up to 10MB).
3. The system validates MIME types, scans for suspicious payloads, and extracts text.
4. AI extracts structured requirements categorized into:
   - Functional Requirements
   - Non-Functional Requirements
   - Explicit Exclusions (out of scope)
   - Assumptions & Dependencies
   - Unresolved Questions / Ambiguities
5. User reviews, edits, supplements, or deletes requirements.

### 4.2 Workflow 2: Proposal Generation & Baseline Approval
1. User triggers Proposal Generation from structured requirements.
2. AI drafts a formal proposal containing: Executive Summary, Scope Deliverables, Technical Assumptions, Explicit Exclusions, Suggested Milestones, Risk Matrix, and Acceptance Criteria.
3. User edits the proposal in a rich markdown editor.
4. User initiates **Scope Baseline Approval**:
   - The system displays a confirmation modal with baseline implications.
   - The user formally approves the baseline.
   - The system computes an SHA-256 hash of the requirement snapshot, freezes the records in `scope_versions` as immutable, and logs an audit event.

### 4.3 Workflow 3: Scope-Change Detection (The Core Differentiator)
1. Later in the project, client sends a new request (e.g., *"Can we also add Google Social Login and dark mode?"*).
2. User pastes the text or uploads the document into **Scope Comparison**.
3. ScopePilot compares the new request against the active immutable baseline.
4. Engine categorizes findings into five distinct buckets:
   - **Matched / Existing Scope:** Already covered in baseline.
   - **New Requirement (Potential Creep):** Genuinely new functionality not present in original scope.
   - **Modified Requirement:** Aligns with existing requirement but modifies complexity, acceptance criteria, or dependencies.
   - **Removed Requirement:** Client requests deprecation or omission of agreed deliverable.
   - **Ambiguous / Clarification Needed:** Insufficient detail to assess scope impact.
5. For each finding, ScopePilot displays:
   - Baseline requirement reference (ID & title).
   - Direct quote from new request.
   - Clear explanation of the difference.
   - Suggested clarifying question for the client.
   - Recommended action.
6. User reviews each finding and records a formal decision:
   - `Included in existing scope` (courtesy/minor)
   - `Additional work` (requires change order / extra fee)
   - `Clarification required` (send clarifying questions)
   - `Declined`
   - `Accepted as new baseline version`
7. User exports a professional **Scope Change Report (PDF)** or **Change Order Summary** to share with the client.

---

## 5. Functional Requirements Matrix

| ID | Feature | Priority | Phase |
|---|---|---|---|
| **FR-01** | User Registration, Email Auth, Password Recovery | P0 | Phase 1 |
| **FR-02** | Multi-tenant Project CRUD with Archival | P0 | Phase 1 |
| **FR-03** | Document Upload (PDF/TXT) with Secure Storage | P0 | Phase 1 |
| **FR-04** | Structured Requirement Extraction & Normalization | P0 | Phase 2 |
| **FR-05** | Requirements Editor & Category Management | P0 | Phase 2 |
| **FR-06** | Proposal Draft Generation & Markdown Editor | P0 | Phase 2 |
| **FR-07** | Immutable Baseline Versioning & Hash Verification | P0 | Phase 2 |
| **FR-08** | Scope-Change Comparison Engine with 5 Classifications | P0 | Phase 3 |
| **FR-09** | User Decision Recording for Comparison Findings | P0 | Phase 3 |
| **FR-10** | PDF Export (Proposal, Scope Baseline, Scope Change Report) | P0 | Phase 4 |
| **FR-11** | Audit Trail & Activity Log | P0 | Phase 4 |
| **FR-12** | Account Settings, Usage Metrics & Account Deletion | P0 | Phase 4 |
| **FR-13** | Multi-Currency Project Settings (INR, USD, EUR, GBP) | P1 | Phase 2 |
| **FR-14** | Rate Limiting & AI Token Budgeting | P0 | Phase 1 |

---

## 6. Success Metrics & Quality Targets
- **Accuracy Target:** Zero silent baseline overwrites (100% database-enforced immutability).
- **AI Classification Reliability:** >90% precision on distinguishing new scope from within-scope clarifications across benchmark evaluation dataset.
- **Latency Target:** Dashboard load < 300ms; PDF generation < 2s; AI comparison < 12s.
- **Security Standard:** OWASP Top 10 compliance; strict RLS multi-tenant isolation; zero leaked API secrets.
