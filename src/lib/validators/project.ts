import { z } from 'zod';

export const CreateProjectSchema = z.object({
  name: z.string().trim().min(1, 'Project name is required').max(100),
  description: z.string().trim().max(1000).optional(),
  clientName: z.string().trim().min(1, 'Client name is required').max(100),
  clientEmail: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP']).default('INR'),
});

export const UpdateProjectSchema = CreateProjectSchema.partial().extend({
  status: z.enum(['draft', 'active', 'completed', 'archived']).optional(),
  isArchived: z.boolean().optional(),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
