import * as yup from 'yup';

export const projectSchema = yup.object({
  name: yup.string().optional(),
  description: yup.string().optional(),
  startDate: yup.date().optional(),
  endDate: yup.date().optional(),
  status: yup.string().optional(),
  priority: yup.string().optional(),
  tenant: yup.string().required(),
  createdBy: yup.string().optional(),
  updatedBy: yup.string().optional(),
  importHash: yup.string().optional(),
});

export const projectCreateSchema = projectSchema.omit(['createdBy', 'updatedBy', 'importHash']);
export const projectUpdateSchema = projectSchema.partial().omit(['createdBy', 'updatedBy', 'importHash']);
export const projectFilterSchema = yup.object({
  name: yup.string().optional(),
  description: yup.string().optional(),
  startDate: yup.date().optional(),
  endDate: yup.date().optional(),
  status: yup.string().optional(),
  priority: yup.string().optional(),
  tenant: yup.string().optional(),
  importHash: yup.string().optional(),
});
