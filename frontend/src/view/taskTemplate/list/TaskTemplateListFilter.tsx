import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { i18n } from 'src/i18n';
import actions from 'src/modules/taskTemplate/list/taskTemplateListActions';
import selectors from 'src/modules/taskTemplate/list/taskTemplateListSelectors';
import filterRenders from 'src/modules/shared/filter/filterRenders';
import yupFilterSchemas from 'src/modules/shared/yup/yupFilterSchemas';
import { AppDispatch } from 'src/modules/store';
import ButtonIcon from 'src/view/shared/ButtonIcon';
import FilterPreview from 'src/view/shared/filter/FilterPreview';
import InputFormItem from 'src/view/shared/form/items/InputFormItem';
import SelectFormItem from 'src/view/shared/form/items/SelectFormItem';
import FilterWrapper from 'src/view/shared/styles/FilterWrapper';
import * as yup from 'yup';

const schema = yup.object().shape({
  name: yupFilterSchemas.string(
    i18n('entities.taskTemplate.fields.name'),
  ),
  description: yupFilterSchemas.string(
    i18n('entities.taskTemplate.fields.description'),
  ),
  type: yupFilterSchemas.enumerator(
    i18n('entities.taskTemplate.fields.type'),
  ),
  isActive: yupFilterSchemas.boolean(
    i18n('entities.taskTemplate.fields.isActive'),
  ),
});

const emptyValues = {
  name: null,
  description: null,
  type: null,
  isActive: null,
};

const previewRenders = {
  name: {
    label: i18n('entities.taskTemplate.fields.name'),
    render: filterRenders.generic(),
  },
  description: {
    label: i18n('entities.taskTemplate.fields.description'),
    render: filterRenders.generic(),
  },
  type: {
    label: i18n('entities.taskTemplate.fields.type'),
    render: filterRenders.enumerator('entities.taskTemplate.enumerators.type'),
  },
  isActive: {
    label: i18n('entities.taskTemplate.fields.isActive'),
    render: filterRenders.boolean(),
  },
};

const TaskTemplateListFilter = (props) => {
  const rawFilter = useSelector(selectors.selectRawFilter);
  const dispatch = useDispatch<AppDispatch>();
  const [expanded, setExpanded] = useState(false);

  const [initialValues] = useState(() => {
    return {
      ...emptyValues,
      ...rawFilter,
    };
  });

  const form = useForm({
    defaultValues: initialValues,
    mode: 'onSubmit',
  });

  useEffect(() => {
    dispatch(actions.doFetch(schema.cast(initialValues), rawFilter));
    // eslint-disable-next-line
  }, [dispatch]);

  const onSubmit = (values) => {
    const rawValues = form.getValues();
    dispatch(actions.doFetch(values, rawValues, false));
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
        values={rawFilter}
        renders={previewRenders}
        expanded={expanded}
        onRemove={onRemove}
        onExpand={setExpanded}
        onCollapse={() => setExpanded(false)}
      />

      <div className="container">
        <div
          id="filters"
          className={`collapse ${expanded ? 'show' : ''}`}
        >
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="row">
                <div className="col-lg-6 col-12">
                  <InputFormItem
                    name="name"
                    label={i18n('entities.taskTemplate.fields.name')}
                  />
                </div>
                <div className="col-lg-6 col-12">
                  <InputFormItem
                    name="description"
                    label={i18n('entities.taskTemplate.fields.description')}
                  />
                </div>
                <div className="col-lg-6 col-12">
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
                  />
                </div>
                <div className="col-lg-6 col-12">
                  <SelectFormItem
                    name="isActive"
                    label={i18n('entities.taskTemplate.fields.isActive')}
                    options={[
                      {
                        value: true,
                        label: i18n('common.yes'),
                      },
                      {
                        value: false,
                        label: i18n('common.no'),
                      },
                    ]}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-12 filter-buttons">
                  <ButtonIcon
                    loading={loading}
                    iconClass="fas fa-search"
                    onClick={form.handleSubmit(onSubmit)}
                  >
                    {i18n('common.search')}
                  </ButtonIcon>

                  <ButtonIcon
                    loading={loading}
                    iconClass="fas fa-undo"
                    onClick={onReset}
                  >
                    {i18n('common.reset')}
                  </ButtonIcon>
                </div>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </FilterWrapper>
  );
};

export default TaskTemplateListFilter;
