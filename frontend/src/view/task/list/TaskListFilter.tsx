import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { i18n } from 'src/i18n';
import filterRenders from 'src/modules/shared/filter/filterRenders';
import yupFilterSchemas from 'src/modules/shared/yup/yupFilterSchemas';
import { AppDispatch } from 'src/modules/store';
import actions from 'src/modules/task/list/taskListActions';
import selectors from 'src/modules/task/list/taskListSelectors';
import ButtonIcon from 'src/view/shared/ButtonIcon';
import FilterPreview from 'src/view/shared/filter/FilterPreview';
import DatePickerRangeFormItem from 'src/view/shared/form/items/DatePickerRangeFormItem';
import InputFormItem from 'src/view/shared/form/items/InputFormItem';
import SelectFormItem from 'src/view/shared/form/items/SelectFormItem';
import FilterWrapper from 'src/view/shared/styles/FilterWrapper';
import TagAutocompleteFormItem from 'src/view/tag/autocomplete/TagAutocompleteFormItem';
import * as yup from 'yup';

const schema = yup.object().shape({
  type: yupFilterSchemas.string(
    i18n('entities.task.fields.type'),
  ),
  title: yupFilterSchemas.string(
    i18n('entities.task.fields.title'),
  ),
  description: yupFilterSchemas.string(
    i18n('entities.task.fields.description'),
  ),
  status: yupFilterSchemas.enumerator(
    i18n('entities.task.fields.status'),
  ),
  tags: yupFilterSchemas.relationToMany(
    i18n('entities.task.fields.tags'),
  ),
  leadBy: yupFilterSchemas.relationToOne(
    i18n('entities.task.fields.leadBy'),
  ),
  reviewedBy: yupFilterSchemas.relationToOne(
    i18n('entities.task.fields.reviewedBy'),
  ),
  estimatedStartRange: yupFilterSchemas.datetimeRange(
    i18n('entities.task.fields.estimatedStartRange'),
  ),
  estimatedEndRange: yupFilterSchemas.datetimeRange(
    i18n('entities.task.fields.estimatedEndRange'),
  ),
  workStartRange: yupFilterSchemas.datetimeRange(
    i18n('entities.task.fields.workStartRange'),
  ),
  workEndRange: yupFilterSchemas.datetimeRange(
    i18n('entities.task.fields.workEndRange'),
  ),
});

const emptyValues = {
  type: null,
  title: null,
  description: null,
  status: null,
  tags: [],
  leadBy: null,
  reviewedBy: null,
  estimatedStartRange: [],
  estimatedEndRange: [],
  workStartRange: [],
  workEndRange: [],
};

const previewRenders = {
  type: {
    label: i18n('entities.task.fields.type'),
    render: filterRenders.generic(),
  },
  title: {
    label: i18n('entities.task.fields.title'),
    render: filterRenders.generic(),
  },
  description: {
    label: i18n('entities.task.fields.description'),
    render: filterRenders.generic(),
  },
  status: {
    label: i18n('entities.task.fields.status'),
    render: filterRenders.enumerator('entities.task.enumerators.status'),
  },
  tags: {
    label: i18n('entities.task.fields.tags'),
    render: filterRenders.relationToMany(),
  },
  estimatedStartRange: {
    label: i18n('entities.task.fields.estimatedStartRange'),
    render: filterRenders.datetimeRange(),
  },
  estimatedEndRange: {
    label: i18n('entities.task.fields.estimatedEndRange'),
    render: filterRenders.datetimeRange(),
  },
  workStartRange: {
    label: i18n('entities.task.fields.workStartRange'),
    render: filterRenders.datetimeRange(),
  },
  workEndRange: {
    label: i18n('entities.task.fields.workEndRange'),
    render: filterRenders.datetimeRange(),
  },
};

const TaskListFilter = (props) => {
  const dispatch = useDispatch<AppDispatch>();
  const rawFilter = useSelector(selectors.selectRawFilter);
  const [expanded, setExpanded] = useState(false);

  const [initialValues] = useState(() => {
    return {
      ...emptyValues,
      ...rawFilter,
    };
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
                  <InputFormItem
                    name="type"
                    label={i18n(
                      'entities.task.fields.type',
                    )}
                  />
                </div>
                <div className="col-lg-6 col-12">
                  <InputFormItem
                    name="title"
                    label={i18n(
                      'entities.task.fields.title',
                    )}
                  />
                </div>
                <div className="col-lg-6 col-12">
                  <InputFormItem
                    name="description"
                    label={i18n(
                      'entities.task.fields.description',
                    )}
                  />
                </div>
                <div className="col-lg-6 col-12">
                  <SelectFormItem
                    name="status"
                    label={i18n('entities.task.fields.status')}
                    options={[
                      { value: 'OPEN', label: i18n('entities.task.enumerators.status.OPEN') },
                      { value: 'PLANNED', label: i18n('entities.task.enumerators.status.PLANNED') },
                      { value: 'IN_PROGRESS', label: i18n('entities.task.enumerators.status.IN_PROGRESS') },
                      { value: 'DONE', label: i18n('entities.task.enumerators.status.DONE') },
                      { value: 'INVALID', label: i18n('entities.task.enumerators.status.INVALID') },
                      { value: 'FUTURE', label: i18n('entities.task.enumerators.status.FUTURE') },
                    ]}
                  />
                </div>
                <div className="col-lg-6 col-12">
                  <TagAutocompleteFormItem
                    name="tags"
                    label={i18n('entities.task.fields.tags')}
                    mode="multiple"
                    showCreate={false}
                  />
                </div>
                <div className="col-lg-6 col-12">
                  <DatePickerRangeFormItem
                    name="estimatedStartRange"
                    label={i18n(
                      'entities.task.fields.estimatedStartRange',
                    )}
                    showTimeInput
                  />
                </div>
                <div className="col-lg-6 col-12">
                  <DatePickerRangeFormItem
                    name="estimatedEndRange"
                    label={i18n(
                      'entities.task.fields.estimatedEndRange',
                    )}
                    showTimeInput
                  />
                </div>
                <div className="col-lg-6 col-12">
                  <DatePickerRangeFormItem
                    name="workStartRange"
                    label={i18n(
                      'entities.task.fields.workStartRange',
                    )}
                    showTimeInput
                  />
                </div>
                <div className="col-lg-6 col-12">
                  <DatePickerRangeFormItem
                    name="workEndRange"
                    label={i18n(
                      'entities.task.fields.workEndRange',
                    )}
                    showTimeInput
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-12 filter-buttons">
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={props.loading}
                  >
                    <ButtonIcon
                      loading={props.loading}
                      iconClass="fas fa-search"
                    />{' '}
                    {i18n('common.search')}
                  </button>
                  <button
                    className="btn btn-light"
                    type="button"
                    onClick={onReset}
                    disabled={props.loading}
                  >
                    <ButtonIcon
                      loading={props.loading}
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
};

export default TaskListFilter;
