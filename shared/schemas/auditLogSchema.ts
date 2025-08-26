import * as yup from 'yup';

export const auditLogSchema = yup.object({
  entityName: yup.string().max(255).required(),
  entityId: yup.string().max(255).required(),
  action: yup.string().max(255).required(),
  tenantId: yup.string().max(255).optional(),
  createdById: yup.string().max(255).optional(),
  createdByEmail: yup.string().max(255).optional(),
  timestamp: yup.date().required(),
  values: yup.mixed().optional(),
});

export const auditLogCreateSchema = auditLogSchema;
export const auditLogUpdateSchema = auditLogSchema.partial();
export const auditLogFilterSchema = yup.object({
  entityName: yup.string().optional(),
  entityId: yup.string().optional(),
  action: yup.string().optional(),
  tenantId: yup.string().optional(),
  createdById: yup.string().optional(),
  createdByEmail: yup.string().optional(),
  timestampFrom: yup.date().optional(),
  timestampTo: yup.date().optional(),
});
