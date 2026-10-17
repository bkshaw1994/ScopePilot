import { z } from 'zod';

export const SignUpSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(100, 'Password must not exceed 100 characters'),
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100),
  companyName: z.string().trim().max(100).optional(),
  defaultCurrency: z.enum(['INR', 'USD', 'EUR', 'GBP']).default('INR'),
});

export const SignInSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
});

export const ResetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters long').max(100),
});

export type SignUpInput = z.infer<typeof SignUpSchema>;
export type SignInInput = z.infer<typeof SignInSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
