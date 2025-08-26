import * as yup from 'yup';

export const moduleSchema = yup.object({
  title: yup.string().optional(),
  details: yup.string().optional(),
  tenant: yup.string().required(),
  createdBy: yup.string().optional(),
  updatedBy: yup.string().optional(),
  importHash: yup.string().optional(),
});

export const moduleCreateSchema = moduleSchema.omit(['createdBy', 'updatedBy', 'importHash']);
export const moduleUpdateSchema = moduleSchema.partial().omit(['createdBy', 'updatedBy', 'importHash']);
export const moduleFilterSchema = yup.object({
  title: yup.string().optional(),
  tenant: yup.string().optional(),
  importHash: yup.string().optional(),
});
