import * as yup from 'yup';

export const requirementSchema = yup.object({
  title: yup.string().optional(),
  background: yup.string().optional(),
  acceptanceCriteria: yup.string().optional(),
  tenant: yup.string().required(),
  createdBy: yup.string().optional(),
  updatedBy: yup.string().optional(),
  importHash: yup.string().optional(),
});

export const requirementCreateSchema = requirementSchema.omit(['createdBy', 'updatedBy', 'importHash']);
export const requirementUpdateSchema = requirementSchema.partial().omit(['createdBy', 'updatedBy', 'importHash']);
export const requirementFilterSchema = yup.object({
  title: yup.string().optional(),
  tenant: yup.string().optional(),
  importHash: yup.string().optional(),
});
