import { z } from 'zod';

export const RequirementCategorySchema = z.enum([
  'functional',
  'non_functional',
  'integration',
  'ui_ux',
  'security',
  'exclusion',
  'other',
]);

export const RequirementPrioritySchema = z.enum([
  'must_have',
  'should_have',
  'could_have',
  'nice_to_have',
  'unknown',
]);

export const RequirementSchema = z.object({
  id: z.string().uuid().optional(),
  reqCode: z.string().min(1),
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().min(1, 'Description is required'),
  category: RequirementCategorySchema.default('functional'),
  priority: RequirementPrioritySchema.default('must_have'),
  acceptanceCriteria: z.array(z.string()).default([]),
  dependencies: z.array(z.string()).default([]),
  assumptions: z.array(z.string()).default([]),
  exclusions: z.array(z.string()).default([]),
  unresolvedQuestions: z.array(z.string()).default([]),
  confidenceScore: z.number().min(0).max(1).optional().nullable(),
  sourceDocumentId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const CreateRequirementSchema = RequirementSchema.omit({
  id: true,
  confidenceScore: true,
  isActive: true,
});

export const UpdateRequirementSchema = CreateRequirementSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// AI Requirement Extraction Output Schema
export const ExtractedRequirementItemSchema = z.object({
  reqCode: z.string(),
  title: z.string(),
  description: z.string(),
  category: RequirementCategorySchema,
  priority: RequirementPrioritySchema,
  acceptanceCriteria: z.array(z.string()),
  dependencies: z.array(z.string()),
  assumptions: z.array(z.string()),
  exclusions: z.array(z.string()),
  unresolvedQuestions: z.array(z.string()),
  confidenceScore: z.number().min(0).max(1),
});

export const ExtractRequirementsResultSchema = z.object({
  projectOverview: z.string(),
  requirements: z.array(ExtractedRequirementItemSchema),
  extractedExclusions: z.array(z.string()),
  openClarifications: z.array(z.string()),
});

export type RequirementInput = z.infer<typeof RequirementSchema>;
export type CreateRequirementInput = z.infer<typeof CreateRequirementSchema>;
export type UpdateRequirementInput = z.infer<typeof UpdateRequirementSchema>;
export type ExtractedRequirementItem = z.infer<typeof ExtractedRequirementItemSchema>;
export type ExtractRequirementsResult = z.infer<typeof ExtractRequirementsResultSchema>;
