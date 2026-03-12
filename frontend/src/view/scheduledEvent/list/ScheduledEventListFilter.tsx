import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { i18n } from 'src/i18n';
import filterRenders from 'src/modules/shared/filter/filterRenders';
import yupFilterSchemas from 'src/modules/shared/yup/yupFilterSchemas';
import { AppDispatch } from 'src/modules/store';
import actions from 'src/modules/scheduledEvent/list/scheduledEventListActions';
import selectors from 'src/modules/scheduledEvent/list/scheduledEventListSelectors';
import ButtonIcon from 'src/view/shared/ButtonIcon';
import FilterPreview from 'src/view/shared/filter/FilterPreview';
import InputFormItem from 'src/view/shared/form/items/InputFormItem';
import FilterWrapper from 'src/view/shared/styles/FilterWrapper';
import * as yup from 'yup';

const schema = yup.object().shape({
  title: yupFilterSchemas.string(
    i18n('entities.scheduledEvent.fields.title'),
  ),
  timezone: yupFilterSchemas.string(
    i18n('entities.scheduledEvent.fields.timezone'),
  ),
});

const emptyValues = {
  title: null,
  timezone: null,
};

const previewRenders = {
  title: {
    label: i18n('entities.scheduledEvent.fields.title'),
    render: filterRenders.generic(),
  },
  timezone: {
    label: i18n('entities.scheduledEvent.fields.timezone'),
    render: filterRenders.generic(),
  },
};

const ScheduledEventListFilter = (props) => {
  const dispatch = useDispatch<AppDispatch>();
  const rawFilter = useSelector(selectors.selectRawFilter);
  const [expanded, setExpanded] = useState(false);

  const [initialValues] = useState(() => ({
    ...emptyValues,
    ...rawFilter,
  }));

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

  return (
    <FilterWrapper>
      <FilterPreview
        onClick={() => setExpanded(!expanded)}
        renders={previewRenders}
        values={rawFilter}
        expanded={expanded}
        onRemove={onRemove}
      />
      <div className="container">
        <div className={`collapse ${expanded ? 'show' : ''}`}>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="row">
                <div className="col-lg-6 col-12">
                  <InputFormItem
                    name="title"
                    label={i18n('entities.scheduledEvent.fields.title')}
                  />
                </div>
                <div className="col-lg-6 col-12">
                  <InputFormItem
                    name="timezone"
                    label={i18n('entities.scheduledEvent.fields.timezone')}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-12 filter-buttons">
                  <button
                    className="btn btn-primary"
                    type="submit"
                  >
                    <ButtonIcon iconClass="fas fa-search" />{' '}
                    {i18n('common.search')}
                  </button>
                  <button
                    className="btn btn-light"
                    type="button"
                    onClick={onReset}
                  >
                    <ButtonIcon iconClass="fas fa-undo" />{' '}
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
};

export default ScheduledEventListFilter;
