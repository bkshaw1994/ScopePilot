import { z } from 'zod';

export const FindingCategorySchema = z.enum([
  'matched_requirement',
  'new_requirement',
  'modified_requirement',
  'removed_requirement',
  'ambiguous_request',
]);

export const DecisionStatusSchema = z.enum([
  'pending_review',
  'included_in_scope',
  'additional_work',
  'clarification_required',
  'declined',
  'accepted_as_new_version',
]);

export const ScopeComparisonFindingSchema = z.object({
  findingType: FindingCategorySchema,
  matchedReqCode: z.string().nullable(),
  title: z.string(),
  description: z.string(),
  differenceExplanation: z.string(),
  evidenceQuote: z.string(),
  confidenceLevel: z.enum(['high', 'medium', 'low']),
  dependenciesAffected: z.array(z.string()).default([]),
  acceptanceCriteriaChanges: z.array(z.string()).default([]),
  suggestedClarificationQuestions: z.array(z.string()).default([]),
  suggestedAction: z.string(),
});

export const ScopeComparisonResultSchema = z.object({
  summaryOverview: z.string(),
  totalFindings: z.number(),
  additionsCount: z.number(),
  modificationsCount: z.number(),
  removalsCount: z.number(),
  ambiguousCount: z.number(),
  findings: z.array(ScopeComparisonFindingSchema),
});

export const ScopeComparisonRequestSchema = z.object({
  projectId: z.string().uuid(),
  newRequestText: z.string().trim().min(5, 'Input text must contain at least 5 characters').max(50000),
  sourceDocumentId: z.string().uuid().optional(),
});

export const RecordDecisionSchema = z.object({
  decision: DecisionStatusSchema.refine((val) => val !== 'pending_review', {
    message: 'Must select a conclusive decision status',
  }),
  notes: z.string().trim().max(1000).optional(),
});

export type FindingCategory = z.infer<typeof FindingCategorySchema>;
export type DecisionStatus = z.infer<typeof DecisionStatusSchema>;
export type ScopeComparisonFinding = z.infer<typeof ScopeComparisonFindingSchema>;
export type ScopeComparisonResult = z.infer<typeof ScopeComparisonResultSchema>;
export type ScopeComparisonRequest = z.infer<typeof ScopeComparisonRequestSchema>;
export type RecordDecisionInput = z.infer<typeof RecordDecisionSchema>;
