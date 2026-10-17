export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProjectStatus = 'draft' | 'active' | 'completed' | 'archived';

export type RequirementCategory =
  | 'functional'
  | 'non_functional'
  | 'integration'
  | 'ui_ux'
  | 'security'
  | 'exclusion'
  | 'other';

export type RequirementPriority =
  | 'must_have'
  | 'should_have'
  | 'could_have'
  | 'nice_to_have'
  | 'unknown';

export type DocumentStatus = 'uploaded' | 'processing' | 'parsed' | 'failed';

export type ProposalStatus = 'draft' | 'reviewed' | 'approved' | 'superseded';

export type ComparisonStatus = 'in_progress' | 'completed' | 'failed';

export type FindingCategory =
  | 'matched_requirement'
  | 'new_requirement'
  | 'modified_requirement'
  | 'removed_requirement'
  | 'ambiguous_request';

export type DecisionStatus =
  | 'pending_review'
  | 'included_in_scope'
  | 'additional_work'
  | 'clarification_required'
  | 'declined'
  | 'accepted_as_new_version';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          company_name: string | null;
          default_currency: string;
          plan_tier: string;
          monthly_ai_limit_tokens: number;
          monthly_ai_used_tokens: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          company_name?: string | null;
          default_currency?: string;
          plan_tier?: string;
          monthly_ai_limit_tokens?: number;
          monthly_ai_used_tokens?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          company_name?: string | null;
          default_currency?: string;
          plan_tier?: string;
          monthly_ai_limit_tokens?: number;
          monthly_ai_used_tokens?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          client_name: string;
          client_email: string | null;
          currency: string;
          status: ProjectStatus;
          is_archived: boolean;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          client_name: string;
          client_email?: string | null;
          currency?: string;
          status?: ProjectStatus;
          is_archived?: boolean;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          client_name?: string;
          client_email?: string | null;
          currency?: string;
          status?: ProjectStatus;
          is_archived?: boolean;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      source_documents: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          file_name: string;
          storage_path: string;
          file_size_bytes: number;
          mime_type: string;
          sha256_hash: string;
          extracted_text: string | null;
          status: DocumentStatus;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          file_name: string;
          storage_path: string;
          file_size_bytes: number;
          mime_type: string;
          sha256_hash: string;
          extracted_text?: string | null;
          status?: DocumentStatus;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          file_name?: string;
          storage_path?: string;
          file_size_bytes?: number;
          mime_type?: string;
          sha256_hash?: string;
          extracted_text?: string | null;
          status?: DocumentStatus;
          error_message?: string | null;
          created_at?: string;
        };
      };
      requirements: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          req_code: string;
          title: string;
          description: string;
          category: RequirementCategory;
          priority: RequirementPriority;
          acceptance_criteria: Json;
          dependencies: Json;
          assumptions: Json;
          exclusions: Json;
          unresolved_questions: Json;
          confidence_score: number | null;
          source_document_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          req_code: string;
          title: string;
          description: string;
          category?: RequirementCategory;
          priority?: RequirementPriority;
          acceptance_criteria?: Json;
          dependencies?: Json;
          assumptions?: Json;
          exclusions?: Json;
          unresolved_questions?: Json;
          confidence_score?: number | null;
          source_document_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          req_code?: string;
          title?: string;
          description?: string;
          category?: RequirementCategory;
          priority?: RequirementPriority;
          acceptance_criteria?: Json;
          dependencies?: Json;
          assumptions?: Json;
          exclusions?: Json;
          unresolved_questions?: Json;
          confidence_score?: number | null;
          source_document_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      proposals: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          version_number: number;
          title: string;
          overview: string;
          objectives: Json;
          deliverables: Json;
          scope_summary: string;
          exclusions: Json;
          assumptions: Json;
          milestones: Json;
          risks: Json;
          estimated_hours_min: number | null;
          estimated_hours_max: number | null;
          status: ProposalStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          version_number?: number;
          title: string;
          overview: string;
          objectives?: Json;
          deliverables?: Json;
          scope_summary: string;
          exclusions?: Json;
          assumptions?: Json;
          milestones?: Json;
          risks?: Json;
          estimated_hours_min?: number | null;
          estimated_hours_max?: number | null;
          status?: ProposalStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          version_number?: number;
          title?: string;
          overview?: string;
          objectives?: Json;
          deliverables?: Json;
          scope_summary?: string;
          exclusions?: Json;
          assumptions?: Json;
          milestones?: Json;
          risks?: Json;
          estimated_hours_min?: number | null;
          estimated_hours_max?: number | null;
          status?: ProposalStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      scope_versions: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          version_number: number;
          version_label: string;
          is_baseline: boolean;
          content_hash: string;
          requirements_snapshot: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          version_number: number;
          version_label: string;
          is_baseline?: boolean;
          content_hash: string;
          requirements_snapshot: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          version_number?: number;
          version_label?: string;
          is_baseline?: boolean;
          content_hash?: string;
          requirements_snapshot?: Json;
          created_at?: string;
        };
      };
      scope_approvals: {
        Row: {
          id: string;
          scope_version_id: string;
          project_id: string;
          user_id: string;
          approver_name: string;
          approval_notes: string | null;
          content_hash_verified: boolean;
          approved_at: string;
        };
        Insert: {
          id?: string;
          scope_version_id: string;
          project_id: string;
          user_id: string;
          approver_name: string;
          approval_notes?: string | null;
          content_hash_verified?: boolean;
          approved_at?: string;
        };
        Update: {
          id?: string;
          scope_version_id?: string;
          project_id?: string;
          user_id?: string;
          approver_name?: string;
          approval_notes?: string | null;
          content_hash_verified?: boolean;
          approved_at?: string;
        };
      };
      scope_comparisons: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          baseline_scope_version_id: string;
          input_text: string;
          source_document_id: string | null;
          summary_overview: string | null;
          total_findings: number;
          additions_count: number;
          modifications_count: number;
          removals_count: number;
          ambiguous_count: number;
          status: ComparisonStatus;
          ai_metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          baseline_scope_version_id: string;
          input_text: string;
          source_document_id?: string | null;
          summary_overview?: string | null;
          total_findings?: number;
          additions_count?: number;
          modifications_count?: number;
          removals_count?: number;
          ambiguous_count?: number;
          status?: ComparisonStatus;
          ai_metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          baseline_scope_version_id?: string;
          input_text?: string;
          source_document_id?: string | null;
          summary_overview?: string | null;
          total_findings?: number;
          additions_count?: number;
          modifications_count?: number;
          removals_count?: number;
          ambiguous_count?: number;
          status?: ComparisonStatus;
          ai_metadata?: Json;
          created_at?: string;
        };
      };
      scope_comparison_findings: {
        Row: {
          id: string;
          comparison_id: string;
          project_id: string;
          user_id: string;
          requirement_id: string | null;
          finding_type: FindingCategory;
          title: string;
          description: string;
          difference_explanation: string;
          evidence_quote: string;
          confidence_level: 'high' | 'medium' | 'low';
          dependencies_affected: Json;
          acceptance_criteria_changes: Json;
          suggested_clarification_questions: Json;
          suggested_action: string | null;
          user_decision: DecisionStatus;
          user_decision_notes: string | null;
          decided_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          comparison_id: string;
          project_id: string;
          user_id: string;
          requirement_id?: string | null;
          finding_type: FindingCategory;
          title: string;
          description: string;
          difference_explanation: string;
          evidence_quote: string;
          confidence_level: 'high' | 'medium' | 'low';
          dependencies_affected?: Json;
          acceptance_criteria_changes?: Json;
          suggested_clarification_questions?: Json;
          suggested_action?: string | null;
          user_decision?: DecisionStatus;
          user_decision_notes?: string | null;
          decided_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          comparison_id?: string;
          project_id?: string;
          user_id?: string;
          requirement_id?: string | null;
          finding_type?: FindingCategory;
          title?: string;
          description?: string;
          difference_explanation?: string;
          evidence_quote?: string;
          confidence_level?: 'high' | 'medium' | 'low';
          dependencies_affected?: Json;
          acceptance_criteria_changes?: Json;
          suggested_clarification_questions?: Json;
          suggested_action?: string | null;
          user_decision?: DecisionStatus;
          user_decision_notes?: string | null;
          decided_at?: string | null;
          created_at?: string;
        };
      };
      audit_events: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          event_type: string;
          entity_name: string;
          entity_id: string | null;
          metadata: Json;
          ip_hash: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id?: string | null;
          event_type: string;
          entity_name: string;
          entity_id?: string | null;
          metadata?: Json;
          ip_hash?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string | null;
          event_type?: string;
          entity_name?: string;
          entity_id?: string | null;
          metadata?: Json;
          ip_hash?: string | null;
          created_at?: string;
        };
      };
      usage_records: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          feature_type: string;
          model_name: string;
          prompt_tokens: number;
          completion_tokens: number;
          total_tokens: number;
          estimated_cost_usd: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id?: string | null;
          feature_type: string;
          model_name: string;
          prompt_tokens: number;
          completion_tokens: number;
          total_tokens: number;
          estimated_cost_usd?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string | null;
          feature_type?: string;
          model_name?: string;
          prompt_tokens?: number;
          completion_tokens?: number;
          total_tokens?: number;
          estimated_cost_usd?: number;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      project_status: ProjectStatus;
      requirement_category: RequirementCategory;
      requirement_priority: RequirementPriority;
      document_status: DocumentStatus;
      proposal_status: ProposalStatus;
      comparison_status: ComparisonStatus;
      finding_category: FindingCategory;
      decision_status: DecisionStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
