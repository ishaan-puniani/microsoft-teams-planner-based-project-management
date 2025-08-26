import * as yup from 'yup';

export const statusSchema = yup.object({
  name: yup.string().optional(),
  tenant: yup.string().required(),
  createdBy: yup.string().optional(),
  updatedBy: yup.string().optional(),
  importHash: yup.string().optional(),
});

export const statusCreateSchema = statusSchema.omit(['createdBy', 'updatedBy', 'importHash']);
export const statusUpdateSchema = statusSchema.partial().omit(['createdBy', 'updatedBy', 'importHash']);
export const statusFilterSchema = yup.object({
  name: yup.string().optional(),
  tenant: yup.string().optional(),
  importHash: yup.string().optional(),
});
