import * as yup from 'yup';

export const testPlanSchema = yup.object({
  title: yup.string().optional(),
  scope: yup.string().optional(),
  objective: yup.string().optional(),
  tenant: yup.string().required(),
  createdBy: yup.string().optional(),
  updatedBy: yup.string().optional(),
  importHash: yup.string().optional(),
});

export const testPlanCreateSchema = testPlanSchema.omit(['createdBy', 'updatedBy', 'importHash']);
export const testPlanUpdateSchema = testPlanSchema.partial().omit(['createdBy', 'updatedBy', 'importHash']);
export const testPlanFilterSchema = yup.object({
  title: yup.string().optional(),
  tenant: yup.string().optional(),
  importHash: yup.string().optional(),
});
