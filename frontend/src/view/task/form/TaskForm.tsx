import { yupResolver } from '@hookform/resolvers/yup';
import moment from 'moment';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { i18n } from 'src/i18n';
import Storage from 'src/security/storage';
import ButtonIcon from 'src/view/shared/ButtonIcon';
import DatePickerFormItem from 'src/view/shared/form/items/DatePickerFormItem';
import FilesFormItem from 'src/view/shared/form/items/FilesFormItem';
import InputFormItem from 'src/view/shared/form/items/InputFormItem';
import FormWrapper from 'src/view/shared/styles/FormWrapper';
import TaskTemplateAutocompleteFormItem from 'src/view/taskTemplate/autocomplete/TaskTemplateAutocompleteFormItem';
import UserAutocompleteFormItem from 'src/view/user/autocomplete/UserAutocompleteFormItem';
import DynamicTaskFormFields from './DynamicTaskFormFields';
import { baseTaskSchema } from './DynamicTaskSchema';
import { useDynamicTaskForm } from './useDynamicTaskForm';
import ProjectAutocompleteFormItem from 'src/view/project/autocomplete/ProjectAutocompleteFormItem';

const TaskForm = (props) => {
  const [initialValues] = useState(() => {
    const record = props.record || {};

    return {
      project: record.project,
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
      templateData: record.templateData || {}, // Initialize templateData object
    };
  });

  const form = useForm({
    resolver: yupResolver(baseTaskSchema),
    mode: 'all',
    defaultValues: initialValues as any,
  });

  // Watch for template changes
  const watchedTemplate = form.watch('template');

  // Use dynamic form hook
  const {
    templateFields,
    loadingTemplate,
    currentSchema,
    resetDynamicForm,
  } = useDynamicTaskForm({ form, watchedTemplate });

  const onReset = () => {
    Object.keys(initialValues).forEach((key) => {
      form.setValue(key, initialValues[key]);
    });
    resetDynamicForm();
  };

  const onSubmit = async (values: any) => {
    // Validate template fields using current schema
    if (templateFields.length > 0) {
      try {
        await currentSchema.validate(values, { abortEarly: false });
      } catch (error: any) {
        // Set template field validation errors
        if (error.inner) {
          error.inner.forEach((err: any) => {
            if (err.path.startsWith('templateData.')) {
              form.setError(err.path, {
                type: 'validation',
                message: err.message,
              });
            }
          });
        }
        return; // Don't submit if there are template field validation errors
      }
    }
    
    props.onSubmit(props?.record?.id, values);
  };

  return (
    <FormWrapper>
      <FormProvider {...form} key={JSON.stringify(templateFields)}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="row">
            <div className="col-lg-7 col-md-8 col-12">
             <ProjectAutocompleteFormItem
                name="project"
                label={i18n('entities.task.fields.project')}
                showCreate={!props.modal}
                required={true}
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

            <DynamicTaskFormFields
              templateFields={templateFields}
              loadingTemplate={loadingTemplate}
            />

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
              type="submit"
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
