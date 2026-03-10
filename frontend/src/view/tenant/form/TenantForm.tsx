import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import config from 'src/config';
import { i18n } from 'src/i18n';
import yupFormSchemas from 'src/modules/shared/yup/yupFormSchemas';
import { tenantSubdomain } from 'src/modules/tenant/tenantSubdomain';
import ButtonIcon from 'src/view/shared/ButtonIcon';
import InputFormItem from 'src/view/shared/form/items/InputFormItem';
import FormWrapper from 'src/view/shared/styles/FormWrapper';
import * as yup from 'yup';

const msPlannerSchema = yup.object().shape({
  MS_TENANT_ID: yupFormSchemas.string(
    i18n('tenant.fields.msPlanner.tenantId'),
    { max: 255 },
  ),
  MS_CLIENT_ID: yupFormSchemas.string(
    i18n('tenant.fields.msPlanner.clientId'),
    { max: 255 },
  ),
  MS_CLIENT_SECRET: yupFormSchemas.string(
    i18n('tenant.fields.msPlanner.clientSecret'),
    { max: 255 },
  ),
  MS_SCOPE: yupFormSchemas.string(
    i18n('tenant.fields.msPlanner.scope'),
    { max: 512 },
  ),
});

const schemaWithUrl = yup.object().shape({
  name: yupFormSchemas.string(
    i18n('tenant.fields.tenantName'),
    {
      required: true,
      max: 50,
    },
  ),
  url: yupFormSchemas
    .string(i18n('tenant.fields.tenantUrl'), {
      required: true,
      max: 50,
    })
    .matches(
      /^[a-z0-9][-a-zA-Z0-9]*$/,
      i18n('tenant.validation.url'),
    ),
  msPlanner: msPlannerSchema,
});

const schemaWithoutUrl = yup.object().shape({
  name: yupFormSchemas.string(
    i18n('tenant.fields.tenantName'),
    {
      required: true,
      max: 50,
    },
  ),
  msPlanner: msPlannerSchema,
});

const schema = tenantSubdomain.isEnabled
  ? schemaWithUrl
  : schemaWithoutUrl;

function TenantForm(props) {
  const defaultMsPlanner = {
    MS_TENANT_ID: '',
    MS_CLIENT_ID: '',
    MS_CLIENT_SECRET: '',
    MS_SCOPE: '',
  };
  const [initialValues] = useState(() => {
    const base = props.record || { name: '' };
    return {
      ...base,
      msPlanner: {
        ...defaultMsPlanner,
        ...(base.msPlanner || {}),
      },
    };
  });

  const form = useForm({
    resolver: yupResolver(schema as yup.AnyObjectSchema),
    mode: 'all',
    defaultValues: initialValues,
  });

  const onSubmit = (values) => {
    const { ...data } = values;
    props.onSubmit(props.record?.id, data);
  };

  const msPlannerSectionTitle = i18n('tenant.fields.msPlanner.title');

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
                label={i18n('tenant.fields.name')}
                required={true}
                autoFocus
              />
            </div>

            {tenantSubdomain.isEnabled && (
              <div className="col-lg-7 col-md-8 col-12">
                <InputFormItem
                  name="url"
                  label={i18n('tenant.fields.tenantUrl')}
                  endAdornment={`.${config.frontendUrl.host}`}
                />
              </div>
            )}

            <div className="col-12">
              <h5 className="mb-3 mt-2">{msPlannerSectionTitle}</h5>
            </div>

            {props.record?.msPlannerEncrypted?.length>10 && <div className="col-12">Already saved MS Planner Config with encrypted <button>Change</button></div>}

            <div className="col-lg-7 col-md-8 col-12">
              <InputFormItem
                name="msPlanner.MS_TENANT_ID"
                label={i18n('tenant.fields.msPlanner.tenantId')}
                type="text"
              />
            </div>
            <div className="col-lg-7 col-md-8 col-12">
              <InputFormItem
                name="msPlanner.MS_CLIENT_ID"
                label={i18n('tenant.fields.msPlanner.clientId')}
                type="text"
              />
            </div>
            <div className="col-lg-7 col-md-8 col-12">
              <InputFormItem
                name="msPlanner.MS_CLIENT_SECRET"
                label={i18n('tenant.fields.msPlanner.clientSecret')}
                type="password"
              />
            </div>
            <div className="col-lg-7 col-md-8 col-12">
              <InputFormItem
                name="msPlanner.MS_SCOPE"
                label={i18n('tenant.fields.msPlanner.scope')}
                type="text"
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
}

export default TenantForm;
