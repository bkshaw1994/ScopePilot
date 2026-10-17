import { z } from 'zod';

export const MilestoneSchema = z.object({
  name: z.string(),
  deliverables: z.array(z.string()),
  estimatedWeeks: z.number().optional(),
});

export const RiskItemSchema = z.object({
  risk: z.string(),
  mitigation: z.string(),
});

export const ProposalSchema = z.object({
  id: z.string().uuid().optional(),
  projectId: z.string().uuid(),
  versionNumber: z.number().int().positive().default(1),
  title: z.string().min(1),
  overview: z.string().min(1),
  objectives: z.array(z.string()).default([]),
  deliverables: z.array(z.string()).default([]),
  scopeSummary: z.string().min(1),
  exclusions: z.array(z.string()).default([]),
  assumptions: z.array(z.string()).default([]),
  milestones: z.array(MilestoneSchema).default([]),
  risks: z.array(RiskItemSchema).default([]),
  estimatedHoursMin: z.number().positive().nullable().optional(),
  estimatedHoursMax: z.number().positive().nullable().optional(),
  status: z.enum(['draft', 'reviewed', 'approved', 'superseded']).default('draft'),
});

export const GenerateProposalOutputSchema = z.object({
  title: z.string(),
  overview: z.string(),
  objectives: z.array(z.string()),
  deliverables: z.array(z.string()),
  scopeSummary: z.string(),
  exclusions: z.array(z.string()),
  assumptions: z.array(z.string()),
  milestones: z.array(MilestoneSchema),
  risks: z.array(RiskItemSchema),
  estimatedHoursMin: z.number().positive().nullable().optional(),
  estimatedHoursMax: z.number().positive().nullable().optional(),
});

export type ProposalData = z.infer<typeof ProposalSchema>;
export type GenerateProposalOutput = z.infer<typeof GenerateProposalOutputSchema>;
