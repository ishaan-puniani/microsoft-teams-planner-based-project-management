import * as yup from 'yup';
import { fileSchema } from './fileSchema';

export const taskSchema = yup.object({
  title: yup.string().optional(),
  description: yup.string().optional(),
  attachment: yup.array().of(fileSchema).optional(),
  leadBy: yup.string().optional(),
  reviewedBy: yup.string().optional(),
  estimatedStart: yup.date().optional(),
  estimatedEnd: yup.date().optional(),
  workStart: yup.date().optional(),
  workEnd: yup.date().optional(),
  tenant: yup.string().required(),
  createdBy: yup.string().optional(),
  updatedBy: yup.string().optional(),
  importHash: yup.string().optional(),
});

export const taskCreateSchema = taskSchema.omit(['createdBy', 'updatedBy', 'importHash']);
export const taskUpdateSchema = taskSchema.partial().omit(['createdBy', 'updatedBy', 'importHash']);
export const taskFilterSchema = yup.object({
  title: yup.string().optional(),
  leadBy: yup.string().optional(),
  reviewedBy: yup.string().optional(),
  tenant: yup.string().optional(),
  estimatedStartFrom: yup.date().optional(),
  estimatedStartTo: yup.date().optional(),
  estimatedEndFrom: yup.date().optional(),
  estimatedEndTo: yup.date().optional(),
  workStartFrom: yup.date().optional(),
  workStartTo: yup.date().optional(),
  workEndFrom: yup.date().optional(),
  workEndTo: yup.date().optional(),
  importHash: yup.string().optional(),
});
