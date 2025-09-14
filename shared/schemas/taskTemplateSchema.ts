import * as yup from 'yup';

export const taskTemplateSchema = yup.object({
  name: yup.string().required(),
  description: yup.string().optional(),
  type: yup.string().oneOf(['EPIC', 'USER_STORY', 'TASK', 'BUG', 'SUBTASK']).required(),
  fields: yup.array().of(yup.object({
    name: yup.string().required(),
    type: yup.string().oneOf(['TEXT', 'NUMBER', 'DATE', 'SELECT', 'TEXTAREA', 'BOOLEAN']).required(),
    required: yup.boolean().default(false),
    options: yup.array().of(yup.string()).optional(),
    defaultValue: yup.mixed().optional(),
  })).default([]),
  workflow: yup.object({
    states: yup.array().of(yup.object({
      name: yup.string().required(),
      color: yup.string().default('#007bff'),
      isInitial: yup.boolean().default(false),
      isFinal: yup.boolean().default(false),
    })).default([]),
    transitions: yup.array().of(yup.object({
      from: yup.string().required(),
      to: yup.string().required(),
      name: yup.string().required(),
    })).default([]),
  }).default({ states: [], transitions: [] }),
  isActive: yup.boolean().default(true),
  tenant: yup.string().required(),
  createdBy: yup.string().optional(),
  updatedBy: yup.string().optional(),
  importHash: yup.string().optional(),
});

export const taskTemplateCreateSchema = taskTemplateSchema.omit(['createdBy', 'updatedBy', 'importHash']);
export const taskTemplateUpdateSchema = taskTemplateSchema.partial().omit(['createdBy', 'updatedBy', 'importHash']);
export const taskTemplateFilterSchema = yup.object({
  name: yup.string().optional(),
  description: yup.string().optional(),
  type: yup.string().optional(),
  isActive: yup.boolean().optional(),
  tenant: yup.string().optional(),
  importHash: yup.string().optional(),
});
