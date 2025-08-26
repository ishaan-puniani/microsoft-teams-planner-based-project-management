import * as yup from 'yup';

export const tenantUserSchema = yup.object({
  tenant: yup.string().required(),
  roles: yup.array().of(yup.string().max(255)).optional(),
  invitationToken: yup.string().max(255).optional(),
  status: yup.string().oneOf(['active', 'invited']).required(),
});

export const tenantUserCreateSchema = tenantUserSchema;
export const tenantUserUpdateSchema = tenantUserSchema.partial();
export const tenantUserFilterSchema = yup.object({
  tenant: yup.string().optional(),
  status: yup.string().oneOf(['active', 'invited']).optional(),
});
