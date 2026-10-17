# ScopePilot - Threat Model (STRIDE Methodology)

**Version:** 1.0.0  
**Scope:** ScopePilot Web Application, Supabase Backend, AI Provider Pipeline  
**Methodology:** Microsoft STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege)  
**Last Updated:** October 2026  

---

## 1. System Decomposition & Assets

### 1.1 Critical Assets
1. **Approved Scope Baselines:** Legal and contractual foundation for projects. Must remain untampered and immutable.
2. **Proprietary Client Requirement Documents:** Confidential software specifications, trade secrets, architecture diagrams, and client contact information.
3. **Audit Event Logs:** Append-only records of user actions, scope approvals, and comparison decisions.
4. **AI Provider API Keys:** High-value credentials (`GEMINI_API_KEY`, `OPENAI_API_KEY`).
5. **User Authentication Sessions:** JWT cookies granting access to project data.

---

## 2. STRIDE Threat Analysis & Mitigations

### 2.1 Spoofing (Identity & Authenticity)
- **Threat S1: Attacker impersonates legitimate developer via stolen JWT.**
  - *Impact:* Unauthorized access to all projects, documents, and client scopes.
  - *Mitigations:*
    - Supabase secure session cookies with `HttpOnly`, `Secure`, `SameSite=Lax`.
    - Cryptographic signature check on every request via `supabase.auth.getUser()`.
    - Revocation checks on password changes and account deletion.
- **Threat S2: Attacker crafts malicious webhook or callback purporting to be AI provider.**
  - *Impact:* Ingestion of corrupted requirement classifications.
  - *Mitigations:* Direct synchronous HTTPS request model; no unauthenticated inbound webhooks used for AI processing.

### 2.2 Tampering (Integrity)
- **Threat T1: Malicious developer or rogue script attempts to alter an approved scope baseline (`scope_versions`).**
  - *Impact:* Loss of historical truth, legal liability, corrupted change-order history.
  - *Mitigations:*
    - Database trigger `trg_protect_scope_baseline` unconditionally aborts any `UPDATE` or `DELETE` on rows where `is_baseline = TRUE`.
    - SHA-256 cryptographic hash stored at approval time to verify payload integrity.
- **Threat T2: Attacker embeds prompt injection payload in client PDF to manipulate classification.**
  - *Impact:* AI falsely categorizes a major new feature as "free within scope".
  - *Mitigations:*
    - Delimited input boundaries (`<untrusted_client_request>`).
    - Deterministic Zod schema validation.
    - Mandatory human-in-the-loop review; AI findings are recommendations, not automated approvals.

### 2.3 Repudiation (Accountability)
- **Threat R1: User claims they never approved a baseline or accepted a scope change.**
  - *Impact:* Dispute between team members or client, undermining platform trust.
  - *Mitigations:*
    - `scope_approvals` records user ID, timestamp, approver display name, and SHA-256 hash snapshot.
    - Append-only `audit_events` table protected against updates and deletions by PostgreSQL trigger.

### 2.4 Information Disclosure (Confidentiality)
- **Threat I1: Multi-tenant cross-talk (User A accesses User B's project documents or requirements).**
  - *Impact:* Severe data privacy breach, violation of NDA, DPDP/GDPR penalties.
  - *Mitigations:*
    - PostgreSQL Row Level Security (RLS) enforced across all project tables.
    - Storage bucket paths prefixed by `user_id` with strict storage RLS policies.
    - Automated integration tests verifying cross-tenant `403 Forbidden` responses.
- **Threat I2: API keys or confidential documents exposed in browser bundles or telemetry.**
  - *Impact:* Credential theft, unauthorized LLM usage on developer's credit card.
  - *Mitigations:*
    - Strict `server-only` imports on all AI client modules.
    - CI lint rule prohibiting client-side environment variable access to secrets.
    - Error boundaries sanitize internal error stacks before rendering to users.

### 2.5 Denial of Service (Availability & Cost Exhaustion)
- **Threat D1: Attacker sends giant document payloads or spams AI comparison endpoints.**
  - *Impact:* Huge LLM API bill, exhausted API quotas, application degradation.
  - *Mitigations:*
    - Max payload limit of 10MB for documents, 50,000 characters for raw text.
    - Leaky-bucket rate limiting (e.g. max 10 comparison runs per hour).
    - Monthly user-level token caps tracked in `usage_records`.
    - LLM request timeouts (25s) with bounded retries.

### 2.6 Elevation of Privilege (Authorization)
- **Threat E1: Standard user passes another project's UUID in `POST /api/ai/compare`.**
  - *Impact:* Running comparisons against unauthorized client data.
  - *Mitigations:*
    - `assertProjectAccess(projectId, userId)` guard queries `projects` where `user_id = auth.uid()`.
    - RLS policy blocks PostgREST reads even if guard were bypassed.
