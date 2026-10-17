# ScopePilot - Production Deployment & Operations Guide

**Version:** 1.0.0  
**Target Platform:** Vercel (Edge Routing & Serverless Route Handlers) + Supabase Cloud (PostgreSQL 15+)  
**Last Updated:** October 2026  

---

## 1. Prerequisites Checklist

Before executing a production deployment, ensure the following resources are provisioned:
- [ ] Active Vercel account with project connected to GitHub repository.
- [ ] Supabase Cloud organization & project created in your target region (e.g. `ap-south-1` Mumbai for India or closest to users).
- [ ] Google AI Studio API key (`GEMINI_API_KEY`) with billing enabled.
- [ ] Custom domain DNS access (e.g., `scopepilot.app`).

---

## 2. Database Migration Execution Sequence

Migrations must always be executed **before** deploying new application code to ensure schema backward-compatibility.

### Step 1: Connect to Supabase via CLI or SQL Editor
Using the Supabase Dashboard SQL Editor or CLI:

```bash
# Link local project to remote Supabase project
npx supabase link --project-ref your-project-id

# Apply migrations in sequential order
npx supabase db push
```

Or apply migrations sequentially from `supabase/migrations/`:
1. `00001_initial_schema.sql` (Creates enums, tables, check constraints, foreign keys, indexes)
2. `00002_rls_policies.sql` (Enables Row Level Security on all tables and applies tenant-isolation policies)
3. `00003_baseline_triggers.sql` (Enforces PostgreSQL baseline immutability trigger and audit log protection)

### Step 2: Configure Supabase Storage Bucket
In the Supabase Storage dashboard:
1. Create a new bucket named `project-documents`.
2. Ensure the bucket is set to **Private** (public URL access disabled).
3. Set file size limit to `10MB` (10,485,760 bytes).
4. Restrict allowed MIME types: `application/pdf`, `text/plain`, `text/markdown`.

---

## 3. Production Environment Variables Configuration

Set these environment variables in the Vercel Project Settings (Production environment):

```bash
# Application Domain
NEXT_PUBLIC_APP_URL="https://scopepilot.app"

# Supabase Public Keys (Safe for browser client)
NEXT_PUBLIC_SUPABASE_URL="https://xyzproject.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGci..."

# Supabase Service Role Key (SERVER ONLY - NEVER expose to browser)
SUPABASE_SERVICE_ROLE_KEY="eyJhbGci..."

# Direct Postgres DB URL (For administrative migrations)
SUPABASE_DB_URL="postgresql://postgres:secret@db.xyzproject.supabase.co:5432/postgres"

# AI Provider Configuration (SERVER ONLY)
AI_PROVIDER="gemini"
GEMINI_API_KEY="AIzaSy..."
GEMINI_MODEL="gemini-1.5-flash"

# Fallback AI Provider (Optional)
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4o-mini"

# Security & Rate Limiting
RATE_LIMIT_MAX_COMPARISONS_PER_HOUR="10"
NEXT_TELEMETRY_DISABLED="1"
```

---

## 4. Production Release Verification (Smoke Testing)

Immediately following deployment to `https://scopepilot.app`, execute the smoke test runbook:
1. **Health Check:** `curl -I https://scopepilot.app` -> Assert `HTTP/2 200 OK`.
2. **Security Headers Verification:**
   - `X-Frame-Options: DENY`
   - `X-Content-Type-Options: nosniff`
   - `Referrer-Policy: strict-origin-when-cross-origin`
3. **Authentication Smoke Test:** Register a new user, log out, sign in, and verify session persistence.
4. **Project Creation & Baseline Lock:** Create a test project, define 2 requirements, approve baseline, and verify the cryptographic SHA-256 badge.
5. **Scope Change Detection Smoke Test:** Paste a test client message and verify the 5-category detection output.
6. **PDF Export Smoke Test:** Trigger PDF/HTML report download and verify valid document stream.
