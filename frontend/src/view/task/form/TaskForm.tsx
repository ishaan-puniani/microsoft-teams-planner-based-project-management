import { yupResolver } from '@hookform/resolvers/yup';
import moment from 'moment';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { i18n } from 'src/i18n';
import yupFormSchemas from 'src/modules/shared/yup/yupFormSchemas';
import Storage from 'src/security/storage';
import ButtonIcon from 'src/view/shared/ButtonIcon';
import DatePickerFormItem from 'src/view/shared/form/items/DatePickerFormItem';
import FilesFormItem from 'src/view/shared/form/items/FilesFormItem';
import InputFormItem from 'src/view/shared/form/items/InputFormItem';
import FormWrapper from 'src/view/shared/styles/FormWrapper';
import UserAutocompleteFormItem from 'src/view/user/autocomplete/UserAutocompleteFormItem';
import * as yup from 'yup';

const schema = yup.object().shape({
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
});

const TaskForm = (props) => {
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
                name="title"
                label={i18n('entities.task.fields.title')}
              />
            </div>
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
