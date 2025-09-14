import { yupResolver } from '@hookform/resolvers/yup';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { i18n } from 'src/i18n';
import yupFormSchemas from 'src/modules/shared/yup/yupFormSchemas';
import TaskTemplateService from 'src/modules/taskTemplate/taskTemplateService';
import Storage from 'src/security/storage';
import ButtonIcon from 'src/view/shared/ButtonIcon';
import DatePickerFormItem from 'src/view/shared/form/items/DatePickerFormItem';
import FilesFormItem from 'src/view/shared/form/items/FilesFormItem';
import InputFormItem from 'src/view/shared/form/items/InputFormItem';
import InputNumberFormItem from 'src/view/shared/form/items/InputNumberFormItem';
import SelectFormItem from 'src/view/shared/form/items/SelectFormItem';
import SwitchFormItem from 'src/view/shared/form/items/SwitchFormItem';
import TextAreaFormItem from 'src/view/shared/form/items/TextAreaFormItem';
import FormWrapper from 'src/view/shared/styles/FormWrapper';
import TaskTemplateAutocompleteFormItem from 'src/view/taskTemplate/autocomplete/TaskTemplateAutocompleteFormItem';
import UserAutocompleteFormItem from 'src/view/user/autocomplete/UserAutocompleteFormItem';
import * as yup from 'yup';

// Define types locally since shared directory is not accessible
interface TaskTemplate {
  id: string;
  name?: string;
  description?: string;
  type?: string;
  fields?: TaskTemplateField[];
  workflow?: any;
  isActive?: boolean;
  tenant: string;
  createdBy?: string;
  updatedBy?: string;
  importHash?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TaskTemplateField {
  name: string;
  type:
    | 'TEXT'
    | 'NUMBER'
    | 'DATE'
    | 'SELECT'
    | 'TEXTAREA'
    | 'BOOLEAN';
  required?: boolean;
  options?: string[];
  defaultValue?: any;
}

// Base schema for core task fields
const baseTaskSchema = yup.object().shape({
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
});

// Function to create dynamic schema by extending base schema with template fields
const createDynamicSchema = (templateFields: TaskTemplateField[]) => {
  const dynamicFields: any = {};
  
  templateFields.forEach((field) => {
    const fieldName = `templateField_${field.name}`;
    const fieldLabel = field.name.charAt(0).toUpperCase() + field.name.slice(1);
    
    switch (field.type) {
      case 'TEXT':
      case 'TEXTAREA':
        dynamicFields[fieldName] = field.required 
          ? yup.string().required(`${fieldLabel} is required`)
          : yup.string();
        break;
      case 'NUMBER':
        dynamicFields[fieldName] = field.required 
          ? yup.number().required(`${fieldLabel} is required`)
          : yup.number();
        break;
      case 'DATE':
        dynamicFields[fieldName] = field.required 
          ? yup.date().required(`${fieldLabel} is required`)
          : yup.date();
        break;
      case 'SELECT':
        dynamicFields[fieldName] = field.required 
          ? yup.string().required(`${fieldLabel} is required`)
          : yup.string();
        break;
      case 'BOOLEAN':
        dynamicFields[fieldName] = yup.boolean();
        break;
      default:
        dynamicFields[fieldName] = field.required 
          ? yup.string().required(`${fieldLabel} is required`)
          : yup.string();
    }
  });
  
  return baseTaskSchema.shape(dynamicFields);
};

const TaskForm = (props) => {
  const [selectedTemplate, setSelectedTemplate] =
    useState<TaskTemplate | null>(null);
  const [templateFields, setTemplateFields] = useState<
    TaskTemplateField[]
  >([]);
  const [loadingTemplate, setLoadingTemplate] =
    useState(false);
  const [currentSchema, setCurrentSchema] = useState(baseTaskSchema);
  const [schemaKey, setSchemaKey] = useState(0);

  const [initialValues] = useState(() => {
    const record = props.record || {};

    return {
      title: record.title,
      description: record.description,
      attachment: record.attachment || [],
      leadBy: record.leadBy,
      reviewedBy: record.reviewedBy,
      estimatedStart: record.estimatedStart
        ? moment(record.estimatedStart).toDate()
        : null,
      estimatedEnd: record.estimatedEnd
        ? moment(record.estimatedEnd).toDate()
        : null,
      workStart: record.workStart
        ? moment(record.workStart).toDate()
        : null,
      workEnd: record.workEnd
        ? moment(record.workEnd).toDate()
        : null,
      template: record.template,
    };
  });

  const form = useForm({
    resolver: yupResolver(currentSchema),
    mode: 'all',
    defaultValues: initialValues as any,
  });

  // Function to fetch template data
  const fetchTemplate = useCallback(
    async (selTemplate:any) => {
      if (!selTemplate) {
        setSelectedTemplate(null);
        setTemplateFields([]);
        return;
      }

      try {
        setLoadingTemplate(true);
        const template = await TaskTemplateService.find(
          selTemplate.id,
        );
        setSelectedTemplate(template);
        setTemplateFields(template.fields || []);
        
        // Update schema with template fields
        const newSchema = createDynamicSchema(template.fields || []);
        setCurrentSchema(newSchema);
        setSchemaKey(prev => prev + 1);

        // Pre-populate form fields with template default values
        if (template.fields) {
          template.fields.forEach((field) => {
            if (
              field.defaultValue !== undefined &&
              field.defaultValue !== null
            ) {
              form.setValue(
                `templateField_${field.name}`,
                field.defaultValue,
              );
            }
          });
        }
      } catch (error) {
        console.error('Error fetching template:', error);
        setSelectedTemplate(null);
        setTemplateFields([]);
      } finally {
        setLoadingTemplate(false);
      }
    },
    [form],
  );

  // Watch for template changes
  const watchedTemplate = form.watch('template');

  useEffect(() => {
    if (watchedTemplate) {
      fetchTemplate(watchedTemplate);
    } else {
      setSelectedTemplate(null);
      setTemplateFields([]);
      setCurrentSchema(baseTaskSchema);
      setSchemaKey(prev => prev + 1);
    }
  }, [watchedTemplate, fetchTemplate]);

  // Force re-validation when schema changes
  useEffect(() => {
    // Trigger validation with current values when schema changes
    form.trigger(); // This will re-validate all fields with the new schema
  }, [currentSchema, form]);

  // Clear form errors when template fields change
  useEffect(() => {
    form.clearErrors();
  }, [templateFields, form]);

  const onReset = () => {
    Object.keys(initialValues).forEach((key) => {
      form.setValue(key, initialValues[key]);
    });
    setSelectedTemplate(null);
    setTemplateFields([]);
    setCurrentSchema(baseTaskSchema);
    setSchemaKey(prev => prev + 1);
  };

  const onSubmit = (values: any) => {
    props.onSubmit(props?.record?.id, values);
  };

  // Function to render template fields
  const renderTemplateField = (
    field: TaskTemplateField,
  ) => {
    const fieldName = `templateField_${field.name}`;
    const fieldLabel =
      field.name.charAt(0).toUpperCase() +
      field.name.slice(1);

    switch (field.type) {
        case 'TEXT':
          return (
            <div
              key={field.name}
              className="col-lg-7 col-md-8 col-12"
            >
              <InputFormItem
                name={fieldName}
                label={fieldLabel}
                required={field.required}
              />
            </div>
          );
      case 'TEXTAREA':
        return (
          <div
            key={field.name}
            className="col-lg-7 col-md-8 col-12"
          >
            <TextAreaFormItem
              name={fieldName}
              label={fieldLabel}
              required={field.required}
            />
          </div>
        );
      case 'NUMBER':
        return (
          <div
            key={field.name}
            className="col-lg-7 col-md-8 col-12"
          >
            <InputNumberFormItem
              name={fieldName}
              label={fieldLabel}
              required={field.required}
            />
          </div>
        );
      case 'DATE':
        return (
          <div
            key={field.name}
            className="col-lg-7 col-md-8 col-12"
          >
            <DatePickerFormItem
              name={fieldName}
              label={fieldLabel}
              required={field.required}
            />
          </div>
        );
      case 'SELECT':
        return (
          <div
            key={field.name}
            className="col-lg-7 col-md-8 col-12"
          >
            <SelectFormItem
              name={fieldName}
              label={fieldLabel}
              options={
                field.options?.map((option) => ({
                  value: option,
                  label: option,
                })) || []
              }
              required={field.required}
            />
          </div>
        );
      case 'BOOLEAN':
        return (
          <div
            key={field.name}
            className="col-lg-7 col-md-8 col-12"
          >
            <SwitchFormItem
              name={fieldName}
              label={fieldLabel}
            />
          </div>
        );
      default:
        return (
          <div
            key={field.name}
            className="col-lg-7 col-md-8 col-12"
          >
            <InputFormItem
              name={fieldName}
              label={fieldLabel}
              required={field.required}
            />
          </div>
        );
    }
  };

  return (
    <FormWrapper>
      <FormProvider {...form} key={schemaKey}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="row">
            <div className="col-lg-7 col-md-8 col-12">
              <InputFormItem
                name="title"
                label={i18n('entities.task.fields.title')}
              />
            </div>
            <div className="col-lg-7 col-md-8 col-12">
              <TaskTemplateAutocompleteFormItem
                name="template"
                label={i18n(
                  'entities.task.fields.template',
                )}
                hint={i18n('entities.task.hints.template')}
                showCreate={!props.modal}
                required={true}
              />
            </div>

            {/* Template Fields Section */}
            {loadingTemplate && (
              <div className="col-12">
                <div className="text-center">
                  <i className="fas fa-spinner fa-spin"></i>{' '}
                  {i18n('common.loading')}...
                </div>
              </div>
            )}

            {selectedTemplate &&
              templateFields.length > 0 && (
                <>
                  <div className="col-12">
                    <h6 className="text-muted mb-3">
                      <i className="fas fa-layer-group"></i>{' '}
                      {selectedTemplate.name} - Template
                      Fields
                    </h6>
                  </div>
                  {templateFields.map((field) =>
                    renderTemplateField(field),
                  )}
                </>
              )}

            <div className="col-lg-7 col-md-8 col-12">
              <InputFormItem
                name="description"
                label={i18n(
                  'entities.task.fields.description',
                )}
              />
            </div>
            <div className="col-lg-7 col-md-8 col-12">
              <FilesFormItem
                name="attachment"
                label={i18n(
                  'entities.task.fields.attachment',
                )}
                storage={Storage.values.taskAttachment}
              />
            </div>
            <div className="col-lg-7 col-md-8 col-12">
              <UserAutocompleteFormItem
                name="leadBy"
                label={i18n('entities.task.fields.leadBy')}
                showCreate={!props.modal}
              />
            </div>
            <div className="col-lg-7 col-md-8 col-12">
              <UserAutocompleteFormItem
                name="reviewedBy"
                label={i18n(
                  'entities.task.fields.reviewedBy',
                )}
                showCreate={!props.modal}
              />
            </div>
            <div className="col-lg-7 col-md-8 col-12">
              <DatePickerFormItem
                name="estimatedStart"
                label={i18n(
                  'entities.task.fields.estimatedStart',
                )}
                showTimeInput
              />
            </div>
            <div className="col-lg-7 col-md-8 col-12">
              <DatePickerFormItem
                name="estimatedEnd"
                label={i18n(
                  'entities.task.fields.estimatedEnd',
                )}
                showTimeInput
              />
            </div>
            <div className="col-lg-7 col-md-8 col-12">
              <DatePickerFormItem
                name="workStart"
                label={i18n(
                  'entities.task.fields.workStart',
                )}
                showTimeInput
              />
            </div>
            <div className="col-lg-7 col-md-8 col-12">
              <DatePickerFormItem
                name="workEnd"
                label={i18n('entities.task.fields.workEnd')}
                showTimeInput
              />
            </div>
          </div>
          <div className="form-buttons">
            <button
              className="btn btn-primary"
              disabled={props.saveLoading}
              type="button"
              onClick={form.handleSubmit(onSubmit)}
            >
              <ButtonIcon
                loading={props.saveLoading}
                iconClass="far fa-save"
              />{' '}
              {i18n('common.save')}
            </button>

            <button
              className="btn btn-light"
              type="button"
              disabled={props.saveLoading}
              onClick={onReset}
            >
              <i className="fas fa-undo"></i>{' '}
              {i18n('common.reset')}
            </button>

            {props.onCancel ? (
              <button
                className="btn btn-light"
                type="button"
                disabled={props.saveLoading}
                onClick={() => props.onCancel()}
              >
                <i className="fas fa-times"></i>{' '}
                {i18n('common.cancel')}
              </button>
            ) : null}
          </div>
        </form>
      </FormProvider>
    </FormWrapper>
  );
};

export default TaskForm;
