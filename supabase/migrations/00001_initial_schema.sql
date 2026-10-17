-- ScopePilot: 00001_initial_schema.sql
-- Creates core enums, tables, and indexes for ScopePilot SaaS

-- 1. Custom Types & Enums
CREATE TYPE project_status AS ENUM ('draft', 'active', 'completed', 'archived');

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

CREATE TYPE document_status AS ENUM ('uploaded', 'processing', 'parsed', 'failed');

CREATE TYPE proposal_status AS ENUM ('draft', 'reviewed', 'approved', 'superseded');

CREATE TYPE comparison_status AS ENUM ('in_progress', 'completed', 'failed');

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

-- 2. Profiles Table (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    company_name TEXT,
    default_currency TEXT NOT NULL DEFAULT 'INR',
    plan_tier TEXT NOT NULL DEFAULT 'free',
    monthly_ai_limit_tokens INTEGER NOT NULL DEFAULT 500000,
    monthly_ai_used_tokens INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 3. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
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

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status) WHERE is_archived = FALSE;

-- 4. Source Documents Table
CREATE TABLE IF NOT EXISTS public.source_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_size_bytes INTEGER NOT NULL CHECK (file_size_bytes > 0 AND file_size_bytes <= 10485760),
    mime_type TEXT NOT NULL,
    sha256_hash TEXT NOT NULL,
    extracted_text TEXT,
    status document_status NOT NULL DEFAULT 'uploaded',
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_source_documents_project_id ON public.source_documents(project_id);

-- 5. Requirements Table
CREATE TABLE IF NOT EXISTS public.requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    req_code TEXT NOT NULL,
    title TEXT NOT NULL CHECK (char_length(trim(title)) > 0),
    description TEXT NOT NULL,
    category requirement_category NOT NULL DEFAULT 'functional',
    priority requirement_priority NOT NULL DEFAULT 'must_have',
    acceptance_criteria JSONB NOT NULL DEFAULT '[]'::jsonb,
    dependencies JSONB NOT NULL DEFAULT '[]'::jsonb,
    assumptions JSONB NOT NULL DEFAULT '[]'::jsonb,
    exclusions JSONB NOT NULL DEFAULT '[]'::jsonb,
    unresolved_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    confidence_score NUMERIC(3,2) CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    source_document_id UUID REFERENCES public.source_documents(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_project_req_code UNIQUE (project_id, req_code)
);

CREATE INDEX IF NOT EXISTS idx_requirements_project_id ON public.requirements(project_id) WHERE is_active = TRUE;

-- 6. Proposals Table
CREATE TABLE IF NOT EXISTS public.proposals (
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

CREATE INDEX IF NOT EXISTS idx_proposals_project_id ON public.proposals(project_id);

-- 7. Scope Versions Table (Immutable Baseline Snapshots)
CREATE TABLE IF NOT EXISTS public.scope_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    version_label TEXT NOT NULL,
    is_baseline BOOLEAN NOT NULL DEFAULT FALSE,
    content_hash TEXT NOT NULL,
    requirements_snapshot JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_project_scope_version UNIQUE (project_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_scope_versions_project ON public.scope_versions(project_id, is_baseline);

-- 8. Scope Approvals Table
CREATE TABLE IF NOT EXISTS public.scope_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scope_version_id UUID NOT NULL REFERENCES public.scope_versions(id) ON DELETE RESTRICT,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    approver_name TEXT NOT NULL,
    approval_notes TEXT,
    content_hash_verified BOOLEAN NOT NULL DEFAULT TRUE,
    approved_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_scope_approvals_version ON public.scope_approvals(scope_version_id);

-- 9. Scope Comparisons Table
CREATE TABLE IF NOT EXISTS public.scope_comparisons (
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
    ai_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_scope_comparisons_project ON public.scope_comparisons(project_id, created_at DESC);

-- 10. Scope Comparison Findings Table
CREATE TABLE IF NOT EXISTS public.scope_comparison_findings (
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

CREATE INDEX IF NOT EXISTS idx_findings_comparison_id ON public.scope_comparison_findings(comparison_id);
CREATE INDEX IF NOT EXISTS idx_findings_decision ON public.scope_comparison_findings(user_decision);

-- 11. Audit Events Table
CREATE TABLE IF NOT EXISTS public.audit_events (
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

CREATE INDEX IF NOT EXISTS idx_audit_events_project ON public.audit_events(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_user ON public.audit_events(user_id, created_at DESC);

-- 12. Usage Records Table
CREATE TABLE IF NOT EXISTS public.usage_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    feature_type TEXT NOT NULL,
    model_name TEXT NOT NULL,
    prompt_tokens INTEGER NOT NULL,
    completion_tokens INTEGER NOT NULL,
    total_tokens INTEGER NOT NULL,
    estimated_cost_usd NUMERIC(8,6) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_usage_records_user ON public.usage_records(user_id, created_at DESC);
