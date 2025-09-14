import { useCallback, useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import TaskTemplateService from 'src/modules/taskTemplate/taskTemplateService';
import { TaskTemplateField, createDynamicSchema, baseTaskSchema, validateFormWithSchema } from './DynamicTaskSchema';

// Define types locally since shared directory is not accessible
interface TaskTemplate {
  id: string;
  name?: string;
  description?: string;
  type?: string;
  fields?: TaskTemplateField[];
}

interface UseDynamicTaskFormProps {
  form: UseFormReturn<any> | null;
  watchedTemplate: any;
}

export const useDynamicTaskForm = ({ form, watchedTemplate }: UseDynamicTaskFormProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
  const [templateFields, setTemplateFields] = useState<TaskTemplateField[]>([]);
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [currentSchema, setCurrentSchema] = useState(baseTaskSchema);

  // Function to fetch template data
  const fetchTemplate = useCallback(
    async (selTemplate: any) => {
      console.log('Fetching template:', selTemplate);
      if (!selTemplate) {
        setSelectedTemplate(null);
        setTemplateFields([]);
        setCurrentSchema(baseTaskSchema);
        return;
      }

      try {
        setLoadingTemplate(true);
        const template = await TaskTemplateService.find(selTemplate.id);
        console.log('Fetched template:', template);
        setSelectedTemplate(template);
        setTemplateFields(template.fields || []);
        
        // Update schema with template fields
        const newSchema = createDynamicSchema(template.fields || []);
        setCurrentSchema(newSchema);

        // Pre-populate form fields with existing templateData values or template default values
        if (template.fields && form) {
          console.log('Current form values:', form.getValues());
          template.fields.forEach((field) => {
            const fieldName = `templateData.${field.id}`;
            const existingValue = form.getValues(fieldName);
            
            console.log(`Field ${fieldName}: existingValue=${existingValue}, defaultValue=${field.defaultValue}`);
            
            // Use existing value if available, otherwise use template default value
            const valueToSet = existingValue !== undefined && existingValue !== null 
              ? existingValue 
              : (field.defaultValue !== undefined && field.defaultValue !== null 
                  ? field.defaultValue 
                  : '');
            
            console.log(`Setting ${fieldName} to:`, valueToSet);
            form.setValue(fieldName, valueToSet);
          });
        }
      } catch (error) {
        console.error('Error fetching template:', error);
        setSelectedTemplate(null);
        setTemplateFields([]);
        setCurrentSchema(baseTaskSchema);
      } finally {
        setLoadingTemplate(false);
      }
    },
    [form],
  );

  // Watch for template changes
  useEffect(() => {
    console.log('Template change detected:', watchedTemplate);
    if (watchedTemplate) {
      fetchTemplate(watchedTemplate);
    } else {
      setSelectedTemplate(null);
      setTemplateFields([]);
      setCurrentSchema(baseTaskSchema);
    }
  }, [watchedTemplate, fetchTemplate]);

  // Clear all errors when template changes to avoid stale validation errors
  useEffect(() => {
    if (form) {
      form.clearErrors();
    }
  }, [templateFields, form]);

  // Validation function
  const validateForm = useCallback(async (values: any) => {
    return await validateFormWithSchema(currentSchema, values);
  }, [currentSchema]);

  // Reset function
  const resetDynamicForm = useCallback(() => {
    setSelectedTemplate(null);
    setTemplateFields([]);
    setCurrentSchema(baseTaskSchema);
  }, []);

  return {
    selectedTemplate,
    templateFields,
    loadingTemplate,
    currentSchema,
    validateForm,
    resetDynamicForm,
  };
};
