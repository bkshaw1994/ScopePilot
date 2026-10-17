# ScopePilot - Database Architecture & Schema Specification

**Version:** 1.0.0  
**Database Engine:** PostgreSQL 15+ (Supabase Managed)  
**Schema Definition Language:** PostgreSQL DDL with Supabase Row Level Security (RLS)  
**Last Updated:** October 2026  

---

## 1. Entity-Relationship Overview

```
auth.users (Supabase Managed)
    | 1:1
    v
profiles (id, email, full_name, company_name, currency, plan_tier)
    | 1:N
    +------------------------------------------+
    |                                          |
    v                                          v
projects (id, user_id, name, client...)     usage_records (id, user_id, tokens...)
    | 1:N                                      
    +-------------------+-------------------+-------------------+
    |                   |                   |                   |
    v                   v                   v                   v
source_documents   requirements         proposals        scope_versions (IMMUTABLE)
                        |                                       | 1:N
                        |                                       v
                        |                                scope_approvals
                        v                                       |
                   scope_comparison_findings <------------------+
                                ^ (1:N)                         |
                                |                               |
                        scope_comparisons ----------------------+
                                |
                                v
                        audit_events (id, project_id, user_id, event_type, metadata)
```

---

## 2. Table Specifications & DDL

### 2.1 Table: `profiles`
Stores extended user profile, tenant preferences, and billing tier.

```sql
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    company_name TEXT,
    default_currency TEXT NOT NULL DEFAULT 'INR', -- 'INR', 'USD', 'EUR', 'GBP'
    plan_tier TEXT NOT NULL DEFAULT 'free', -- 'free', 'pro', 'agency'
    monthly_ai_limit_tokens INTEGER NOT NULL DEFAULT 500000,
    monthly_ai_used_tokens INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_profiles_email ON public.profiles(email);
```

### 2.2 Table: `projects`
Core project container. Enforces soft archival.

```sql
CREATE TYPE project_status AS ENUM ('draft', 'active', 'completed', 'archived');

CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (char_length(trim(name)) > 0),
    description TEXT,
    client_name TEXT NOT NULL,
    client_email TEXT,
    currency TEXT NOT NULL DEFAULT 'INR',
    status project_status NOT NULL DEFAULT 'draft',
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_status ON public.projects(status) WHERE is_archived = FALSE;
```

### 2.3 Table: `source_documents`
Tracks uploaded requirement documents and PDFs.

```sql
CREATE TYPE document_status AS ENUM ('uploaded', 'processing', 'parsed', 'failed');

CREATE TABLE public.source_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_size_bytes INTEGER NOT NULL CHECK (file_size_bytes > 0 AND file_size_bytes <= 10485760), -- max 10MB
    mime_type TEXT NOT NULL,
    sha256_hash TEXT NOT NULL,
    extracted_text TEXT,
    status document_status NOT NULL DEFAULT 'uploaded',
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_source_documents_project_id ON public.source_documents(project_id);
```

### 2.4 Table: `requirements`
Individual, structured requirements. Can be manually created or AI-extracted.

```sql
CREATE TYPE requirement_category AS ENUM (
    'functional',
    'non_functional',
    'integration',
    'ui_ux',
    'security',
    'exclusion',
    'other'
);

CREATE TYPE requirement_priority AS ENUM ('must_have', 'should_have', 'could_have', 'nice_to_have', 'unknown');

CREATE TABLE public.requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    req_code TEXT NOT NULL, -- e.g. 'REQ-001'
    title TEXT NOT NULL CHECK (char_length(trim(title)) > 0),
    description TEXT NOT NULL,
    category requirement_category NOT NULL DEFAULT 'functional',
    priority requirement_priority NOT NULL DEFAULT 'must_have',
    acceptance_criteria JSONB NOT NULL DEFAULT '[]'::jsonb, -- array of strings
    dependencies JSONB NOT NULL DEFAULT '[]'::jsonb,        -- array of strings or req codes
    assumptions JSONB NOT NULL DEFAULT '[]'::jsonb,         -- array of strings
    exclusions JSONB NOT NULL DEFAULT '[]'::jsonb,          -- array of strings
    unresolved_questions JSONB NOT NULL DEFAULT '[]'::jsonb,-- array of strings
    confidence_score NUMERIC(3,2) CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    source_document_id UUID REFERENCES public.source_documents(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_project_req_code UNIQUE (project_id, req_code)
);

CREATE INDEX idx_requirements_project_id ON public.requirements(project_id) WHERE is_active = TRUE;
```

### 2.5 Table: `proposals`
AI-drafted and human-refined proposal drafts.

```sql
CREATE TYPE proposal_status AS ENUM ('draft', 'reviewed', 'approved', 'superseded');

CREATE TABLE public.proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL DEFAULT 1,
    title TEXT NOT NULL,
    overview TEXT NOT NULL,
    objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
    deliverables JSONB NOT NULL DEFAULT '[]'::jsonb,
    scope_summary TEXT NOT NULL,
    exclusions JSONB NOT NULL DEFAULT '[]'::jsonb,
    assumptions JSONB NOT NULL DEFAULT '[]'::jsonb,
    milestones JSONB NOT NULL DEFAULT '[]'::jsonb,
    risks JSONB NOT NULL DEFAULT '[]'::jsonb,
    estimated_hours_min NUMERIC(6,1),
    estimated_hours_max NUMERIC(6,1),
    status proposal_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_project_proposal_version UNIQUE (project_id, version_number)
);

CREATE INDEX idx_proposals_project_id ON public.proposals(project_id);
```

### 2.6 Table: `scope_versions` (STRICT IMMUTABILITY)
Stores immutable baseline snapshots of project scope.

```sql
CREATE TABLE public.scope_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    version_label TEXT NOT NULL, -- e.g. 'v1.0 - Initial Baseline'
    is_baseline BOOLEAN NOT NULL DEFAULT FALSE,
    content_hash TEXT NOT NULL, -- SHA-256 of canonical JSON requirements snapshot
    requirements_snapshot JSONB NOT NULL, -- Full frozen snapshot of requirements array
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_project_scope_version UNIQUE (project_id, version_number)
);

CREATE INDEX idx_scope_versions_project ON public.scope_versions(project_id, is_baseline);
```

### 2.7 Table: `scope_approvals`
Tracks who formally approved each scope version and baseline.

```sql
CREATE TABLE public.scope_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scope_version_id UUID NOT NULL REFERENCES public.scope_versions(id) ON DELETE RESTRICT,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    approver_name TEXT NOT NULL,
    approval_notes TEXT,
    content_hash_verified BOOLEAN NOT NULL DEFAULT TRUE,
    approved_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_scope_approvals_version ON public.scope_approvals(scope_version_id);
```

### 2.8 Table: `scope_comparisons`
Parent record of a scope comparison run against an immutable baseline.

```sql
CREATE TYPE comparison_status AS ENUM ('in_progress', 'completed', 'failed');

CREATE TABLE public.scope_comparisons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    baseline_scope_version_id UUID NOT NULL REFERENCES public.scope_versions(id) ON DELETE RESTRICT,
    input_text TEXT NOT NULL,
    source_document_id UUID REFERENCES public.source_documents(id) ON DELETE SET NULL,
    summary_overview TEXT,
    total_findings INTEGER NOT NULL DEFAULT 0,
    additions_count INTEGER NOT NULL DEFAULT 0,
    modifications_count INTEGER NOT NULL DEFAULT 0,
    removals_count INTEGER NOT NULL DEFAULT 0,
    ambiguous_count INTEGER NOT NULL DEFAULT 0,
    status comparison_status NOT NULL DEFAULT 'completed',
    ai_metadata JSONB DEFAULT '{}'::jsonb, -- model, latency_ms, tokens
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_scope_comparisons_project ON public.scope_comparisons(project_id, created_at DESC);
```

### 2.9 Table: `scope_comparison_findings`
Detailed findings categorized by the engine, with human-in-the-loop decisions.

```sql
CREATE TYPE finding_category AS ENUM (
    'matched_requirement',
    'new_requirement',
    'modified_requirement',
    'removed_requirement',
    'ambiguous_request'
);

CREATE TYPE decision_status AS ENUM (
    'pending_review',
    'included_in_scope',
    'additional_work',
    'clarification_required',
    'declined',
    'accepted_as_new_version'
);

CREATE TABLE public.scope_comparison_findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comparison_id UUID NOT NULL REFERENCES public.scope_comparisons(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    requirement_id UUID REFERENCES public.requirements(id) ON DELETE SET NULL,
    finding_type finding_category NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difference_explanation TEXT NOT NULL,
    evidence_quote TEXT NOT NULL,
    confidence_level TEXT NOT NULL CHECK (confidence_level IN ('high', 'medium', 'low')),
    dependencies_affected JSONB NOT NULL DEFAULT '[]'::jsonb,
    acceptance_criteria_changes JSONB NOT NULL DEFAULT '[]'::jsonb,
    suggested_clarification_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    suggested_action TEXT,
    user_decision decision_status NOT NULL DEFAULT 'pending_review',
    user_decision_notes TEXT,
    decided_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_findings_comparison_id ON public.scope_comparison_findings(comparison_id);
CREATE INDEX idx_findings_decision ON public.scope_comparison_findings(user_decision);
```

### 2.10 Table: `audit_events`
Immutable activity and security audit trail.

```sql
CREATE TABLE public.audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    entity_id UUID,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_audit_events_project ON public.audit_events(project_id, created_at DESC);
CREATE INDEX idx_audit_events_user ON public.audit_events(user_id, created_at DESC);
```

### 2.11 Table: `usage_records`
Fine-grained AI token and billing consumption logs.

```sql
CREATE TABLE public.usage_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    feature_type TEXT NOT NULL, -- 'ai_extraction', 'ai_proposal', 'ai_comparison'
    model_name TEXT NOT NULL,
    prompt_tokens INTEGER NOT NULL,
    completion_tokens INTEGER NOT NULL,
    total_tokens INTEGER NOT NULL,
    estimated_cost_usd NUMERIC(8,6) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_usage_records_user ON public.usage_records(user_id, created_at DESC);
```

---

## 3. Database Triggers & Invariants

### 3.1 Strict Baseline Immutability Trigger
No software bug or SQL update is permitted to tamper with an approved baseline:

```sql
CREATE OR REPLACE FUNCTION public.enforce_scope_version_immutability()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.is_baseline = TRUE THEN
        RAISE EXCEPTION 'Database Integrity Violation: Approved scope baselines are strictly immutable and cannot be updated or deleted. Create a new version instead.';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_protect_scope_baseline
BEFORE UPDATE OR DELETE ON public.scope_versions
FOR EACH ROW
EXECUTE FUNCTION public.enforce_scope_version_immutability();
```

### 3.2 Audit Log Immutability Trigger
Audit events cannot be altered or deleted once written:

```sql
CREATE OR REPLACE FUNCTION public.prevent_audit_tampering()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit Violation: Audit events are immutable append-only records.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_protect_audit_events
BEFORE UPDATE OR DELETE ON public.audit_events
FOR EACH ROW
EXECUTE FUNCTION public.prevent_audit_tampering();
```

---

## 4. Row Level Security (RLS) Policies

All tables have RLS enabled by default. Policies verify that the authenticated user owns the parent tenant:

```sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scope_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scope_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scope_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scope_comparison_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policy
CREATE POLICY "Users can view and update their own profile"
ON public.profiles FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 2. Projects Policy
CREATE POLICY "Users can manage their own projects"
ON public.projects FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Requirements Policy
CREATE POLICY "Users can manage requirements of their own projects"
ON public.requirements FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Scope Versions Policy (SELECT and INSERT only)
CREATE POLICY "Users can view scope versions of their projects"
ON public.scope_versions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create scope versions for their projects"
ON public.scope_versions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 5. Scope Comparisons Policy
CREATE POLICY "Users can manage comparisons of their projects"
ON public.scope_comparisons FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. Findings Policy
CREATE POLICY "Users can manage findings of their projects"
ON public.scope_comparison_findings FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 7. Audit Events Policy (SELECT and INSERT only)
CREATE POLICY "Users can view and record audit events for their account"
ON public.audit_events FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert audit events for their account"
ON public.audit_events FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

---

## 5. Storage Buckets & Policies

- **Bucket Name:** `project-documents` (Private)
- **Allowed MIME Types:** `application/pdf`, `text/plain`, `text/markdown`
- **Max File Size:** 10MB (10485760 bytes)
- **Storage Policy:**
  ```sql
  CREATE POLICY "Users can upload documents to their own project folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'project-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

  CREATE POLICY "Users can read their own project documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'project-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
  ```
