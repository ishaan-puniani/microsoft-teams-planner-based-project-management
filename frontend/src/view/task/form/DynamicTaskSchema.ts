import { i18n } from 'src/i18n';
import yupFormSchemas from 'src/modules/shared/yup/yupFormSchemas';
import * as yup from 'yup';

// Define types locally since shared directory is not accessible
export interface TaskTemplateField {
  id: string;
  name: string;
  type: 'TEXT' | 'TEXTAREA' | 'NUMBER' | 'DATE' | 'SELECT' | 'BOOLEAN';
  required?: boolean;
  options?: string[];
  defaultValue?: any;
}

// Base schema for core task fields
export const baseTaskSchema = yup.object().shape({
  title: yupFormSchemas.string(
    i18n('entities.title.fields.title'),
    {},
  ),
  description: yupFormSchemas.string(
    i18n('entities.description.fields.description'),
    {},
  ),
  attachment: yupFormSchemas.files(
    i18n('entities.attachment.fields.attachment'),
    {},
  ),
  leadBy: yupFormSchemas.relationToOne(
    i18n('entities.leadBy.fields.leadBy'),
    {},
  ),
  reviewedBy: yupFormSchemas.relationToOne(
    i18n('entities.reviewedBy.fields.reviewedBy'),
    {},
  ),
  estimatedStart: yupFormSchemas.datetime(
    i18n('entities.estimatedStart.fields.estimatedStart'),
    {},
  ),
  estimatedEnd: yupFormSchemas.datetime(
    i18n('entities.estimatedEnd.fields.estimatedEnd'),
    {},
  ),
  workStart: yupFormSchemas.datetime(
    i18n('entities.workStart.fields.workStart'),
    {},
  ),
  workEnd: yupFormSchemas.datetime(
    i18n('entities.workEnd.fields.workEnd'),
    {},
  ),
  template: yupFormSchemas.relationToOne(
    i18n('entities.task.fields.template'),
    {},
  ),
  templateData: yup.object().shape({}), // Dynamic template data object
});

// Function to create dynamic schema by extending base schema with template fields
export const createDynamicSchema = (templateFields: TaskTemplateField[]) => {
  const templateDataFields: any = {};
  
  templateFields.forEach((field) => {
    const fieldLabel = field.name.charAt(0).toUpperCase() + field.name.slice(1);
    
    switch (field.type) {
      case 'TEXT':
      case 'TEXTAREA':
        templateDataFields[field.id] = field.required 
          ? yup.string().required(`${fieldLabel} is required`)
          : yup.string();
        break;
      case 'NUMBER':
        templateDataFields[field.id] = field.required 
          ? yup.number().required(`${fieldLabel} is required`)
          : yup.number();
        break;
      case 'DATE':
        templateDataFields[field.id] = field.required 
          ? yup.date().required(`${fieldLabel} is required`)
          : yup.date();
        break;
      case 'SELECT':
        templateDataFields[field.id] = field.required 
          ? yup.string().required(`${fieldLabel} is required`)
          : yup.string();
        break;
      case 'BOOLEAN':
        templateDataFields[field.id] = yup.boolean();
        break;
      default:
        templateDataFields[field.id] = field.required 
          ? yup.string().required(`${fieldLabel} is required`)
          : yup.string();
    }
  });
  
  // Update the templateData shape with dynamic fields
  return baseTaskSchema.shape({
    templateData: yup.object().shape(templateDataFields)
  });
};

// Manual validation function using current schema
export const validateFormWithSchema = async (schema: yup.ObjectSchema<any>, values: any) => {
  try {
    await schema.validate(values, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error: any) {
    const validationErrors: any = {};
    
    if (error.inner) {
      error.inner.forEach((err: any) => {
        validationErrors[err.path] = {
          type: 'validation',
          message: err.message,
        };
      });
    }
    
    return { isValid: false, errors: validationErrors };
  }
};
