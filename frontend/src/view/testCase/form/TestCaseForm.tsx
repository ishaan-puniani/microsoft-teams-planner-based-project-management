import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { i18n } from 'src/i18n';
import yupFormSchemas from 'src/modules/shared/yup/yupFormSchemas';
import Storage from 'src/security/storage';
import ButtonIcon from 'src/view/shared/ButtonIcon';
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
});

const TestCaseForm = (props) => {
  const [initialValues] = useState(() => {
    const record = props.record || {};

    return {
      title: record.title,
      description: record.description,
      attachment: record.attachment || [],
      leadBy: record.leadBy,
      reviewedBy: record.reviewedBy,
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
                label={i18n(
                  'entities.testCase.fields.title',
                )}
              />
            </div>
            <div className="col-lg-7 col-md-8 col-12">
              <InputFormItem
                name="description"
                label={i18n(
                  'entities.testCase.fields.description',
                )}
              />
            </div>
            <div className="col-lg-7 col-md-8 col-12"></div>
            <div className="col-lg-7 col-md-8 col-12">
              <FilesFormItem
                name="attachment"
                label={i18n(
                  'entities.testCase.fields.attachment',
                )}
                storage={Storage.values.testCaseAttachment}
              />
            </div>
            <div className="col-lg-7 col-md-8 col-12">
              <UserAutocompleteFormItem
                name="leadBy"
                label={i18n(
                  'entities.testCase.fields.leadBy',
                )}
                showCreate={!props.modal}
              />
            </div>
            <div className="col-lg-7 col-md-8 col-12">
              <UserAutocompleteFormItem
                name="reviewedBy"
                label={i18n(
                  'entities.testCase.fields.reviewedBy',
                )}
                showCreate={!props.modal}
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

export default TestCaseForm;
