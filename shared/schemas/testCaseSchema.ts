import * as yup from 'yup';
import { fileSchema } from './fileSchema';

export const testCaseSchema = yup.object({
  title: yup.string().optional(),
  description: yup.string().optional(),
  steps: yup.mixed().optional(),
  attachment: yup.array().of(fileSchema).optional(),
  leadBy: yup.string().optional(),
  reviewedBy: yup.string().optional(),
  tenant: yup.string().required(),
  createdBy: yup.string().optional(),
  updatedBy: yup.string().optional(),
  importHash: yup.string().optional(),
});

export const testCaseCreateSchema = testCaseSchema.omit(['createdBy', 'updatedBy', 'importHash']);
export const testCaseUpdateSchema = testCaseSchema.partial().omit(['createdBy', 'updatedBy', 'importHash']);
export const testCaseFilterSchema = yup.object({
  title: yup.string().optional(),
  leadBy: yup.string().optional(),
  reviewedBy: yup.string().optional(),
  tenant: yup.string().optional(),
  importHash: yup.string().optional(),
});
