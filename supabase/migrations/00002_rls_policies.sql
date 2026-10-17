-- ScopePilot: 00002_rls_policies.sql
-- Enforces Row Level Security (RLS) on all tenant-specific tables

-- 1. Enable RLS
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

-- 2. Profiles Policies
CREATE POLICY "Users can view and update their own profile"
ON public.profiles FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. Projects Policies
CREATE POLICY "Users can manage their own projects"
ON public.projects FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Source Documents Policies
CREATE POLICY "Users can manage their own project documents"
ON public.source_documents FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. Requirements Policies
CREATE POLICY "Users can manage requirements for their projects"
ON public.requirements FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. Proposals Policies
CREATE POLICY "Users can manage proposals for their projects"
ON public.proposals FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 7. Scope Versions Policies (SELECT & INSERT only)
CREATE POLICY "Users can view scope versions of their projects"
ON public.scope_versions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create scope versions for their projects"
ON public.scope_versions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 8. Scope Approvals Policies (SELECT & INSERT only)
CREATE POLICY "Users can view approvals of their projects"
ON public.scope_approvals FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can record approvals for their projects"
ON public.scope_approvals FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 9. Scope Comparisons Policies
CREATE POLICY "Users can manage comparisons of their projects"
ON public.scope_comparisons FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 10. Scope Comparison Findings Policies
CREATE POLICY "Users can manage findings of their projects"
ON public.scope_comparison_findings FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 11. Audit Events Policies (Append-only)
CREATE POLICY "Users can view audit events for their account"
ON public.audit_events FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can record audit events for their account"
ON public.audit_events FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 12. Usage Records Policies (Read-only for user)
CREATE POLICY "Users can view their usage records"
ON public.usage_records FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "System can record usage records"
ON public.usage_records FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
