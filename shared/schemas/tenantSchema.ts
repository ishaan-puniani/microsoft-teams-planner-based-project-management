import * as yup from 'yup';

export const tenantSchema = yup.object({
  name: yup.string().max(255).required(),
  url: yup.string().max(1024).optional(),
  ssoAuthProvider: yup.string().oneOf(['none', 'microsoft']).optional().default('none'),
  plan: yup.string().oneOf(['free', 'growth', 'enterprise']).required().default('free'),
  planStatus: yup.string().oneOf(['active', 'cancel_at_period_end', 'error']).required().default('active'),
  planStripeCustomerId: yup.string().optional(),
  planUserId: yup.string().optional(),
  createdBy: yup.string().optional(),
  updatedBy: yup.string().optional(),
  importHash: yup.string().max(255).optional(),
});

export const tenantCreateSchema = tenantSchema.omit(['createdBy', 'updatedBy', 'importHash']);
export const tenantUpdateSchema = tenantSchema.partial().omit(['createdBy', 'updatedBy', 'importHash']);
export const tenantFilterSchema = yup.object({
  name: yup.string().optional(),
  url: yup.string().optional(),
  ssoAuthProvider: yup.string().oneOf(['none', 'microsoft']).optional(),
  plan: yup.string().oneOf(['free', 'growth', 'enterprise']).optional(),
  planStatus: yup.string().oneOf(['active', 'cancel_at_period_end', 'error']).optional(),
  importHash: yup.string().optional(),
});
