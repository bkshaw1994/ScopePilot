# ScopePilot - Automated Testing Strategy & Quality Gates

**Version:** 1.0.0  
**Test Frameworks:** Vitest (Unit & Integration), Playwright (End-to-End)  
**Last Updated:** October 2026  

---

## 1. Testing Pyramid & Core Philosophy

No code is considered complete without automated verification. ScopePilot enforces a strict three-tier test pyramid:

```
          / \
         /   \       E2E Tests (Playwright)
        / E2E \      Critical user journeys & cross-browser flows
       /-------\
      / Integr. \    Integration Tests (Vitest + Supabase Test DB)
     /   Tests   \   API Routes, RLS Multi-tenant Isolation, DB Triggers
    /-------------\
   /  Unit Tests   \  Unit Tests (Vitest)
  /                 \ Pure domain logic, hashing, normalizers, Zod schemas
 /-------------------\
```

---

## 2. Unit Testing Strategy

Unit tests run in sub-second time without external database or network dependencies.

### 2.1 Test Targets
- **Requirement Normalization (`src/lib/domain/normalizer.test.ts`):** Deduplication, markdown parsing, req-code sequence generation.
- **SHA-256 Hashing & Verification (`src/lib/domain/hash.test.ts`):** Canonical JSON serialization, hash stability across object key permutations.
- **Zod Schema Validations (`src/lib/validators/*.test.ts`):** Boundary testing on all request, response, and AI output schemas.
- **Rate Limiting Algorithm (`src/lib/security/rate-limit.test.ts`):** Token bucket calculation and window resets.
- **PDF Template Assembly (`src/lib/pdf/*.test.ts`):** Data formatting, currency symbol rendering, edge cases (empty descriptions, unicode).

---

## 3. Integration Testing Strategy

Integration tests run against a local Supabase PostgreSQL container (`supabase start`) or dedicated staging database.

### 3.1 Test Targets
- **Row Level Security (RLS) Tenant Isolation:**
  - Create User A and User B.
  - User A creates Project Alpha.
  - Assert User B receives `403 Forbidden` / 0 rows when attempting to `SELECT`, `UPDATE`, or `DELETE` Project Alpha or its requirements.
- **Scope Baseline Immutability Trigger:**
  - Create and approve baseline version v1.0.
  - Attempt direct SQL `UPDATE scope_versions SET version_label = 'tampered' WHERE id = ...`.
  - Assert PostgreSQL trigger throws exception and update is rolled back.
- **Cascade Deletion & Account Deletion:**
  - Verify deleting user profile cleanly purges projects, documents, baselines, and storage objects without orphaned foreign key errors.
- **AI Schema Failure & Retry:**
  - Mock AI provider returning malformed JSON.
  - Assert retry logic triggers repair prompt, and graceful degradation error is returned if repair fails.

---

## 4. End-to-End (E2E) Critical Journey Test

Playwright automates the complete 10-step mission-critical user flow:

1. **Register & Authenticate:** Create account, confirm session.
2. **Create Project:** Fill project wizard with client details and currency (INR/USD).
3. **Requirement Intake:** Paste messy client email; verify AI extraction displays structured requirements.
4. **Edit Requirements:** Modify a title, add an explicit exclusion, save changes.
5. **Generate Proposal:** Trigger proposal drafting; verify generated markdown preview.
6. **Approve Baseline:** Submit formal approval; verify baseline locked status and cryptographic hash badge.
7. **Submit Scope Change:** Submit new client request (e.g., adding dark mode and Bluetooth sync).
8. **Review Comparison:** Inspect 5-category findings; verify evidence quotes and difference explanations.
9. **Record Human Decision:** Mark Bluetooth sync as "Additional Work" and dark mode as "Included".
10. **Export PDF Report:** Trigger PDF download and verify 200 OK with `application/pdf` binary stream.

---

## 5. Quality Gates & CI Enforcement

The GitHub Actions CI pipeline (`.github/workflows/ci.yml`) runs on every pull request and blocks merges unless all gates pass:

| Gate | Command | Description | Pass Criteria |
|---|---|---|---|
| **Gate 1** | `npm run lint` | ESLint + Prettier check | 0 warnings, 0 errors |
| **Gate 2** | `npm run typecheck` | Strict TypeScript compiler (`tsc --noEmit`) | 0 type errors |
| **Gate 3** | `npm run test:unit` | Vitest Unit Tests | 100% pass |
| **Gate 4** | `npm run test:integration` | Vitest Integration Tests (RLS & DB) | 100% pass |
| **Gate 5** | `npm run test:eval` | AI Benchmark Evaluation (10 scenarios) | $\ge 90\%$ accuracy |
| **Gate 6** | `npm run build` | Next.js Production Build | Clean production bundle |
