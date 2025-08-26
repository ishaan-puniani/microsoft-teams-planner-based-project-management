import * as yup from 'yup';
import { fileSchema } from './fileSchema';
import { tenantUserSchema } from './tenantUserSchema';

export const userSchema = yup.object({
  fullName: yup.string().max(255).optional(),
  firstName: yup.string().max(80).optional(),
  lastName: yup.string().max(175).optional(),
  phoneNumber: yup.string().max(24).optional(),
  provider: yup.string().max(255).optional(),
  providerId: yup.string().max(255).optional(),
  email: yup.string().max(255).email().required(),
  password: yup.string().max(255).optional(),
  emailVerified: yup.boolean().default(false),
  emailVerificationToken: yup.string().max(255).optional(),
  emailVerificationTokenExpiresAt: yup.date().optional(),
  passwordResetToken: yup.string().max(255).optional(),
  passwordResetTokenExpiresAt: yup.date().optional(),
  avatars: yup.array().of(fileSchema).optional(),
  tenants: yup.array().of(tenantUserSchema).optional(),
  jwtTokenInvalidBefore: yup.date().optional(),
  createdBy: yup.string().optional(),
  updatedBy: yup.string().optional(),
  importHash: yup.string().max(255).optional(),
});

export const userCreateSchema = userSchema.omit(['createdBy', 'updatedBy', 'importHash']);
export const userUpdateSchema = userSchema.partial().omit(['createdBy', 'updatedBy', 'importHash']);
export const userFilterSchema = yup.object({
  fullName: yup.string().optional(),
  firstName: yup.string().optional(),
  lastName: yup.string().optional(),
  email: yup.string().optional(),
  emailVerified: yup.boolean().optional(),
  provider: yup.string().optional(),
  importHash: yup.string().optional(),
});
