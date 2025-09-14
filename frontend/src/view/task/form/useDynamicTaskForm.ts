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
      if (!selTemplate) {
        setSelectedTemplate(null);
        setTemplateFields([]);
        setCurrentSchema(baseTaskSchema);
        return;
      }

      try {
        setLoadingTemplate(true);
        const template = await TaskTemplateService.find(selTemplate.id);
        setSelectedTemplate(template);
        setTemplateFields(template.fields || []);
        
        // Update schema with template fields
        const newSchema = createDynamicSchema(template.fields || []);
        setCurrentSchema(newSchema);

        // Pre-populate form fields with template default values
        if (template.fields && form) {
          template.fields.forEach((field) => {
            if (
              field.defaultValue !== undefined &&
              field.defaultValue !== null
            ) {
              form.setValue(
                `templateData.${field.id}`,
                field.defaultValue,
              );
            }
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
