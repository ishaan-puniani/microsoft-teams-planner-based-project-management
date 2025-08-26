import * as yup from 'yup';
import { fileSchema } from './fileSchema';

export const settingsSchema = yup.object({
  theme: yup.string().required(),
  backgroundImages: yup.array().of(fileSchema).optional(),
  logos: yup.array().of(fileSchema).optional(),
  tenant: yup.string().required(),
  createdBy: yup.string().optional(),
  updatedBy: yup.string().optional(),
});

export const settingsCreateSchema = settingsSchema.omit(['createdBy', 'updatedBy']);
export const settingsUpdateSchema = settingsSchema.partial().omit(['createdBy', 'updatedBy']);
export const settingsFilterSchema = yup.object({
  theme: yup.string().optional(),
  tenant: yup.string().optional(),
});
