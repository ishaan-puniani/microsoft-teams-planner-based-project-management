import * as yup from 'yup';

export const tagSchema = yup.object({
  title: yup.string().optional(),
  tenant: yup.string().required(),
  createdBy: yup.string().optional(),
  updatedBy: yup.string().optional(),
  importHash: yup.string().optional(),
});

export const tagCreateSchema = tagSchema.omit(['createdBy', 'updatedBy', 'importHash']);
export const tagUpdateSchema = tagSchema.partial().omit(['createdBy', 'updatedBy', 'importHash']);
export const tagFilterSchema = yup.object({
  title: yup.string().optional(),
  tenant: yup.string().optional(),
  importHash: yup.string().optional(),
});
