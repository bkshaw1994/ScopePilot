# ScopePilot - Site Reliability Engineering Runbook

**Version:** 1.0.0  
**Discipline:** DevOps / SRE / Incident Management  
**Last Updated:** October 2026  

---

## 1. Incident Severity Definitions

- **SEV-1 (Critical Outage):** Production application down, database inaccessible, or baseline immutability failure. Immediate 15-minute response.
- **SEV-2 (Major Feature Failure):** AI scope comparison engine failing or returning 500 errors; users cannot approve baselines. 1-hour response.
- **SEV-3 (Degraded Performance / Minor Issue):** PDF export slow, formatting glitch, non-critical UI issue. 4-hour response.

---

## 2. Emergency Rollback Procedures

### 2.1 Application Code Rollback (Vercel)
If a bad release causes runtime exceptions or broken user flows:
1. Log into the Vercel Dashboard -> **Deployments**.
2. Identify the last known-good deployment hash.
3. Click **Instant Rollback**.
4. Traffic is immediately redirected to the prior serverless build within 5 seconds.
5. Verify application restoration by visiting `https://scopepilot.app`.

### 2.2 Database Rollback & Recovery
> [!CAUTION]
> Database restore is a disaster recovery procedure that may cause data loss for records created between the backup snapshot and the current time. Never assume a code rollback reverses database mutations.

If a destructive migration or data corruption occurs:
1. **Point-in-Time Recovery (PITR):** In Supabase Dashboard -> **Database** -> **Backups**, initiate PITR to 5 minutes prior to the incident timestamp.
2. **Read-Only Maintenance Mode:** Temporarily deploy a maintenance banner page to prevent new user writes while restore completes.
3. **Trigger Validation:** Following restore, verify that `trg_protect_scope_baseline` and `trg_protect_audit_events` are intact:
   ```sql
   SELECT tgname, tgenabled FROM pg_trigger WHERE tgname IN ('trg_protect_scope_baseline', 'trg_protect_audit_events');
   ```

---

## 3. Handling AI Provider Outages & Quota Limits

### 3.1 AI API Outage (Google Gemini 503 / 429)
If Google Gemini experiences an API degradation:
1. Navigate to Vercel Environment Variables.
2. Update `AI_PROVIDER="openai"`.
3. Ensure `OPENAI_API_KEY` is configured.
4. Redeploy the application. The unified provider abstraction immediately redirects structured scope comparison calls to OpenAI (GPT-4o mini).

### 3.2 High Latency / Rate Limiting Mitigations
- If an individual tenant exhausts their hourly comparison limit (15 requests/hour), the API returns `429 Too Many Requests` with a clear user message.
- To temporarily increase a client's quota, update `profiles.monthly_ai_limit_tokens` in the database.

---

## 4. Disaster Recovery & Backup Plan

- **Automated Daily Backups:** Managed by Supabase Cloud with 7-day retention.
- **Offsite Backups:** Weekly pg_dump snapshots encrypted via GPG and stored in a secondary S3-compatible cold bucket.
- **Recovery Time Objective (RTO):** < 30 minutes.
- **Recovery Point Objective (RPO):** < 1 hour.
