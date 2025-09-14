import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { i18n } from 'src/i18n';
import yupFormSchemas from 'src/modules/shared/yup/yupFormSchemas';
import ButtonIcon from 'src/view/shared/ButtonIcon';
import InputFormItem from 'src/view/shared/form/items/InputFormItem';
import SelectFormItem from 'src/view/shared/form/items/SelectFormItem';
import SwitchFormItem from 'src/view/shared/form/items/SwitchFormItem';
import FormWrapper from 'src/view/shared/styles/FormWrapper';
import * as yup from 'yup';

const schema = yup.object().shape({
  name: yupFormSchemas.string(
    i18n('entities.taskTemplate.fields.name'),
    {},
  ),
  description: yupFormSchemas.string(
    i18n('entities.taskTemplate.fields.description'),
    {},
  ),
  type: yupFormSchemas.string(
    i18n('entities.taskTemplate.fields.type'),
    {},
  ),
  isActive: yupFormSchemas.boolean(
    i18n('entities.taskTemplate.fields.isActive'),
  ),
});

const TaskTemplateForm = (props) => {
  const [initialValues] = useState(() => {
    const record = props.record || {};

    return {
      name: record.name || '',
      description: record.description || '',
      type: record.type || '',
      isActive: record.isActive !== undefined ? record.isActive : true,
    };
  });

  const form = useForm({
    resolver: yupResolver(schema as yup.AnyObjectSchema),
    mode: 'all',
    defaultValues: initialValues as any,
  });

  const onSubmit = (values) => {
    props.onSubmit(props.record?.id, values);
  };

  const onReset = () => {
    Object.keys(initialValues).forEach((key) => {
      form.setValue(key, initialValues[key]);
    });
  };


  return (
    <FormWrapper>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="row">
            <div className="col-lg-7 col-md-8 col-12">
              <InputFormItem
                name="name"
                label={i18n('entities.taskTemplate.fields.name')}
                required={true}
                autoFocus
              />
            </div>
            <div className="col-lg-7 col-md-8 col-12">
              <InputFormItem
                name="description"
                label={i18n('entities.taskTemplate.fields.description')}
              />
            </div>
            <div className="col-lg-7 col-md-8 col-12">
              <SelectFormItem
                name="type"
                label={i18n('entities.taskTemplate.fields.type')}
                options={[
                  {
                    value: 'EPIC',
                    label: i18n('entities.taskTemplate.enumerators.type.EPIC'),
                  },
                  {
                    value: 'USER_STORY',
                    label: i18n('entities.taskTemplate.enumerators.type.USER_STORY'),
                  },
                  {
                    value: 'TASK',
                    label: i18n('entities.taskTemplate.enumerators.type.TASK'),
                  },
                  {
                    value: 'BUG',
                    label: i18n('entities.taskTemplate.enumerators.type.BUG'),
                  },
                  {
                    value: 'SUBTASK',
                    label: i18n('entities.taskTemplate.enumerators.type.SUBTASK'),
                  },
                ]}
                required={true}
              />
            </div>
            <div className="col-lg-7 col-md-8 col-12">
              <SwitchFormItem
                name="isActive"
                label={i18n('entities.taskTemplate.fields.isActive')}
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

export default TaskTemplateForm;
