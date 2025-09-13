import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { i18n } from 'src/i18n';
import yupFormSchemas from 'src/modules/shared/yup/yupFormSchemas';
import ButtonIcon from 'src/view/shared/ButtonIcon';
import InputFormItem from 'src/view/shared/form/items/InputFormItem';
import DatePickerFormItem from 'src/view/shared/form/items/DatePickerFormItem';
import SelectFormItem from 'src/view/shared/form/items/SelectFormItem';
import FormWrapper from 'src/view/shared/styles/FormWrapper';
import * as yup from 'yup';

const schema = yup.object().shape({
  name: yupFormSchemas.string(
    i18n('entities.project.fields.name'),
    {},
  ),
  description: yupFormSchemas.string(
    i18n('entities.project.fields.description'),
    {},
  ),
  code: yupFormSchemas.string(
    i18n('entities.project.fields.code'),
    {},
  ),
  startDate: yupFormSchemas.date(
    i18n('entities.project.fields.startDate'),
    {},
  ),
  endDate: yupFormSchemas.date(
    i18n('entities.project.fields.endDate'),
    {},
  ),
  status: yupFormSchemas.string(
    i18n('entities.project.fields.status'),
    {},
  ),
  priority: yupFormSchemas.string(
    i18n('entities.project.fields.priority'),
    {},
  ),
});

const ProjectForm = (props) => {
  const [initialValues] = useState(() => {
    const record = props.record || {};

    return {
      name: record.name,
      description: record.description,
      code: record.code,
      startDate: record.startDate,
      endDate: record.endDate,
      status: record.status,
      priority: record.priority,
    };
  });

  const form = useForm({
    resolver: yupResolver(schema as yup.AnyObjectSchema),
    mode: 'all',
    defaultValues: initialValues as any,
  });

  const onReset = () => {
    Object.keys(initialValues).forEach((key) => {
      form.setValue(key, initialValues[key]);
    });
  };

  const onSubmit = (values) => {
    props.onSubmit(props?.record?.id, values);
  };

  return (
    <FormWrapper>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="row">
            <div className="col-lg-7 col-md-8 col-12">
              <InputFormItem
                name="name"
                label={i18n('entities.project.fields.name')}
              />
            </div>
            <div className="col-lg-7 col-md-8 col-12">
              <InputFormItem
                name="description"
                label={i18n('entities.project.fields.description')}
              />
            </div>
            <div className="col-lg-7 col-md-8 col-12">
              <InputFormItem
                name="code"
                label={i18n('entities.project.fields.code')}
              />
            </div>
            <div className="col-lg-7 col-md-8 col-12">
              <DatePickerFormItem
                name="startDate"
                label={i18n('entities.project.fields.startDate')}
              />
            </div>
            <div className="col-lg-7 col-md-8 col-12">
              <DatePickerFormItem
                name="endDate"
                label={i18n('entities.project.fields.endDate')}
              />
            </div>
            <div className="col-lg-7 col-md-8 col-12">
              <SelectFormItem
                name="status"
                label={i18n('entities.project.fields.status')}
                options={[
                  { value: 'planning', label: 'Planning' },
                  { value: 'active', label: 'Active' },
                  { value: 'on_hold', label: 'On Hold' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
              />
            </div>
            <div className="col-lg-7 col-md-8 col-12">
              <SelectFormItem
                name="priority"
                label={i18n('entities.project.fields.priority')}
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'urgent', label: 'Urgent' },
                ]}
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

export default ProjectForm;
