-- ScopePilot: 00003_baseline_triggers.sql
-- Enforces database-level immutability triggers for approved baselines and audit logs

-- 1. Baseline Immutability Trigger Function
CREATE OR REPLACE FUNCTION public.enforce_scope_version_immutability()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.is_baseline = TRUE THEN
        RAISE EXCEPTION 'Database Integrity Violation: Approved scope baselines are strictly immutable and cannot be modified or deleted. Create a new baseline version instead.';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Apply to scope_versions
DROP TRIGGER IF EXISTS trg_protect_scope_baseline ON public.scope_versions;
CREATE TRIGGER trg_protect_scope_baseline
BEFORE UPDATE OR DELETE ON public.scope_versions
FOR EACH ROW
EXECUTE FUNCTION public.enforce_scope_version_immutability();

-- 2. Audit Trail Tamper-Proofing Trigger Function
CREATE OR REPLACE FUNCTION public.prevent_audit_tampering()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit Violation: Audit events are immutable append-only records.';
END;
$$ LANGUAGE plpgsql;

-- Apply to audit_events
DROP TRIGGER IF EXISTS trg_protect_audit_events ON public.audit_events;
CREATE TRIGGER trg_protect_audit_events
BEFORE UPDATE OR DELETE ON public.audit_events
FOR EACH ROW
EXECUTE FUNCTION public.prevent_audit_tampering();

-- 3. Automatic Profile Creation on auth.users Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, default_currency, plan_tier)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'default_currency', 'INR'),
        'free'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
