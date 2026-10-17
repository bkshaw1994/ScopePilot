# ScopePilot - Environment Variables Specification

**Version:** 1.0.0  
**Security Level:** Internal Configuration  
**Last Updated:** October 2026  

---

## 1. Overview & Security Rules

1. **Client vs. Server Boundary:**
   - Any variable prefixed with `NEXT_PUBLIC_` is baked into the JavaScript bundle sent to the client browser.
   - **NEVER** prefix API keys, service role keys, or database passwords with `NEXT_PUBLIC_`.
2. **Commit Policy:** Real credentials must **never** be committed to version control. Maintain only `.env.example` with sanitized placeholder values.
3. **Environment Separation:** Maintain distinct keys for Local (`.env.local`), Preview/Staging (`.env.preview`), and Production (`.env.production`).

---

## 2. Environment Variables Catalog

| Variable Name | Environment | Required | Description | Example / Placeholder |
|---|---|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Client & Server | Yes | Base canonical URL of the application | `http://localhost:3000` (Local) / `https://scopepilot.app` (Prod) |
| `NEXT_PUBLIC_SUPABASE_URL` | Client & Server | Yes | Supabase Project REST/Auth endpoint URL | `https://xyzproject.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client & Server | Yes | Supabase anonymous public key (safe for browser; governed by RLS) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server Only** | Yes (Backend) | Privileged admin key for running migrations, seeds, or system tasks. Bypasses RLS. | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_DB_URL` | **Server Only** | Yes (Migrations) | Direct PostgreSQL connection string for Prisma or Supabase CLI migrations | `postgresql://postgres:password@db.xyz.supabase.co:5432/postgres` |
| `AI_PROVIDER` | **Server Only** | Yes | Active AI model provider (`gemini` or `openai`) | `gemini` |
| `GEMINI_API_KEY` | **Server Only** | Conditional | Google Gemini API key (required if `AI_PROVIDER=gemini`) | `AIzaSy...` |
| `GEMINI_MODEL` | **Server Only** | No | Model name override | `gemini-1.5-flash` or `gemini-2.0-flash` |
| `OPENAI_API_KEY` | **Server Only** | Conditional | OpenAI API key (required if `AI_PROVIDER=openai` or fallback) | `sk-proj-...` |
| `OPENAI_MODEL` | **Server Only** | No | Model name override | `gpt-4o-mini` |
| `RATE_LIMIT_MAX_COMPARISONS_PER_HOUR` | **Server Only** | No | Leaky-bucket limit for AI comparison calls | `10` |
| `NEXT_TELEMETRY_DISABLED` | Server | No | Disables Next.js build telemetry | `1` |

---

## 3. Local Environment Template (`.env.example`)

```bash
# Application Canonical URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Supabase Public Keys (Browser Safe)
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Supabase Privileged Key (Server Only - NEVER expose to browser)
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Direct Postgres Database Connection (For CLI migrations)
SUPABASE_DB_URL="postgresql://postgres:your-db-password@db.your-project-id.supabase.co:5432/postgres"

# AI Provider Configuration (Server Only)
AI_PROVIDER="gemini"
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-1.5-flash"

# Fallback AI Provider (Optional)
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4o-mini"

# Security & Rate Limiting Controls
RATE_LIMIT_MAX_COMPARISONS_PER_HOUR="10"
NEXT_TELEMETRY_DISABLED="1"
```
