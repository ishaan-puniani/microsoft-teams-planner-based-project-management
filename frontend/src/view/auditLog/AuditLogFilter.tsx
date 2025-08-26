import { yupResolver } from '@hookform/resolvers/yup';
import queryString from 'query-string';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { i18n } from 'src/i18n';
import actions from 'src/modules/auditLog/auditLogActions';
import selectors from 'src/modules/auditLog/auditLogSelectors';
import filterRenders from 'src/modules/shared/filter/filterRenders';
import yupFilterSchemas from 'src/modules/shared/yup/yupFilterSchemas';
import { AppDispatch } from 'src/modules/store';
import ButtonIcon from 'src/view/shared/ButtonIcon';
import FilterPreview from 'src/view/shared/filter/FilterPreview';
import DatePickerRangeFormItem from 'src/view/shared/form/items/DatePickerRangeFormItem';
import InputFormItem from 'src/view/shared/form/items/InputFormItem';
import TagsFormItem from 'src/view/shared/form/items/TagsFormItem';
import FilterWrapper from 'src/view/shared/styles/FilterWrapper';
import * as yup from 'yup';

const schema = yup.object().shape({
  timestampRange: yupFilterSchemas.datetimeRange(
    i18n('auditLog.fields.timestampRange'),
  ),
  entityNames: yupFilterSchemas.stringArray(
    i18n('auditLog.fields.entityNames'),
  ),
  entityId: yupFilterSchemas.string(
    i18n('auditLog.fields.entityId'),
  ),
  action: yupFilterSchemas.string(
    i18n('auditLog.fields.action'),
  ),
  createdByEmail: yupFilterSchemas.email(
    i18n('auditLog.fields.createdByEmail'),
  ),
});

const emptyValues = {
  timestampRange: [],
  entityNames: [],
  entityId: null,
  action: null,
  createdByEmail: null,
};

const previewRenders = {
  timestampRange: {
    label: i18n('auditLog.fields.timestampRange'),
    render: filterRenders.datetimeRange(),
  },
  entityNames: {
    label: i18n('auditLog.fields.entityNames'),
    render: filterRenders.stringArray(),
  },
  entityId: {
    label: i18n('auditLog.fields.entityId'),
    render: filterRenders.generic(),
  },
  action: {
    label: i18n('auditLog.fields.action'),
    render: filterRenders.generic(),
  },
  createdByEmail: {
    label: i18n('auditLog.fields.createdByEmail'),
    render: filterRenders.generic(),
  },
};

function AuditLogFilter(props) {
  const rawFilter = useSelector(selectors.selectRawFilter);
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  const [initialValues] = useState(() => {
    const initialValues = {
      ...emptyValues,
      ...rawFilter,
    };

    const queryFilters = queryString.parse(location.search);

    initialValues.entityNames =
      queryFilters.entityNames || initialValues.entityNames;
    if (
      initialValues.entityNames &&
      !Array.isArray(initialValues.entityNames)
    ) {
      initialValues.entityNames = [
        initialValues.entityNames,
      ];
    }

    initialValues.entityId =
      queryFilters.entityId || initialValues.entityId;

    initialValues.createdByEmail =
      queryFilters.createdByEmail ||
      initialValues.createdByEmail;

    return initialValues;
  });

  const form = useForm({
    resolver: yupResolver(schema as yup.AnyObjectSchema),
    defaultValues: initialValues,
    mode: 'all',
  });

  useEffect(() => {
    dispatch(
      actions.doFetch(
        schema.cast(initialValues),
        rawFilter,
      ),
    );
    // eslint-disable-next-line
  }, [dispatch]);

  const onSubmit = (values) => {
    const rawValues = form.getValues();
    dispatch(actions.doFetch(values, rawValues));
    setExpanded(false);
  };

  const onReset = () => {
    Object.keys(emptyValues).forEach((key) => {
      form.setValue(key, emptyValues[key]);
    });
    dispatch(actions.doReset());
    setExpanded(false);
  };

  const onRemove = (key) => {
    form.setValue(key, emptyValues[key]);
    return form.handleSubmit(onSubmit)();
  };

  const { loading } = props;

  return (
    <FilterWrapper>
      <FilterPreview
        onClick={() => {
          setExpanded(!expanded);
        }}
        renders={previewRenders}
        values={rawFilter}
        expanded={expanded}
        onRemove={onRemove}
      />
      <div className="container">
        <div
          className={`collapse ${expanded ? 'show' : ''}`}
        >
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="row">
                <div className="col-lg-6 col-12">
                  <DatePickerRangeFormItem
                    name="timestampRange"
                    label={i18n(
                      'auditLog.fields.timestampRange',
                    )}
                    showTimeInput
                  />
                </div>
                <div className="col-lg-6 col-12">
                  <InputFormItem
                    name="createdByEmail"
                    label={i18n(
                      'auditLog.fields.createdByEmail',
                    )}
                  />
                </div>
                <div className="col-lg-6 col-12">
                  <TagsFormItem
                    name="entityNames"
                    label={i18n(
                      'auditLog.fields.entityNames',
                    )}
                    notFoundContent={i18n(
                      'auditLog.entityNamesHint',
                    )}
                  />
                </div>
                <div className="col-lg-6 col-12">
                  <InputFormItem
                    name="entityId"
                    label={i18n('auditLog.fields.entityId')}
                  />
                </div>
                <div className="col-lg-6 col-12">
                  <InputFormItem
                    name="action"
                    label={i18n('auditLog.fields.action')}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-12 filter-buttons">
                  <button
                    className="btn btn-primary"
                    type="submit"
                  >
                    <ButtonIcon
                      loading={loading}
                      iconClass="fas fa-search"
                    />{' '}
                    {i18n('common.search')}
                  </button>
                  <button
                    className="btn btn-light"
                    type="button"
                    onClick={onReset}
                  >
                    <ButtonIcon
                      loading={loading}
                      iconClass="fas fa-undo"
                    />{' '}
                    {i18n('common.reset')}
                  </button>
                </div>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </FilterWrapper>
  );
}

export default AuditLogFilter;
