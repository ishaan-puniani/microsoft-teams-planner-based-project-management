import * as yup from 'yup';

export const testSuiteSchema = yup.object({
  name: yup.string().optional(),
  tenant: yup.string().required(),
  createdBy: yup.string().optional(),
  updatedBy: yup.string().optional(),
  importHash: yup.string().optional(),
});

export const testSuiteCreateSchema = testSuiteSchema.omit(['createdBy', 'updatedBy', 'importHash']);
export const testSuiteUpdateSchema = testSuiteSchema.partial().omit(['createdBy', 'updatedBy', 'importHash']);
export const testSuiteFilterSchema = yup.object({
  name: yup.string().optional(),
  tenant: yup.string().optional(),
  importHash: yup.string().optional(),
});
