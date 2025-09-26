import { z } from 'zod';

export const StudentEmailSchema = z
  .string()
  .email()
  .refine(
    (email) => email.endsWith('@st.ug.edu.gh'),
    {
      message: 'Email must be a valid University of Ghana student email (@st.ug.edu.gh)',
    }
  );

export const UsernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be at most 30 characters')
  .regex(
    /^[a-zA-Z0-9_]+$/,
    'Username can only contain letters, numbers, and underscores'
  );

export const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one lowercase letter, one uppercase letter, and one number'
  );

export const CreateUserSchema = z.object({
  email: StudentEmailSchema,
  username: UsernameSchema,
  password: PasswordSchema,
  displayName: z.string().min(1).max(100).optional(),
});

export const UpdateUserSchema = z.object({
  username: UsernameSchema.optional(),
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  profileImageUrl: z.string().url().optional(),
});

export const LoginSchema = z.object({
  email: StudentEmailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const ForgotPasswordSchema = z.object({
  email: StudentEmailSchema,
});

export const ResetPasswordSchema = z.object({
  token: z.string(),
  password: PasswordSchema,
});