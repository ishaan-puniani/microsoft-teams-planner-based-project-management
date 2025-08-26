import * as yup from 'yup';

export const fileSchema = yup.object({
  name: yup.string().max(21845).required(),
  sizeInBytes: yup.number().optional(),
  privateUrl: yup.string().max(21845).optional(),
  publicUrl: yup.string().max(21845).optional(),
  tenant: yup.string().optional(),
});

export const fileCreateSchema = fileSchema;
export const fileUpdateSchema = fileSchema.partial();
export const fileFilterSchema = yup.object({
  name: yup.string().optional(),
  tenant: yup.string().optional(),
});
