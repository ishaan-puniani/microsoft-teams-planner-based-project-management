import { yupResolver } from '@hookform/resolvers/yup';
import { useState, useEffect, useCallback } from 'react';
import { FormProvider, useForm, useFieldArray } from 'react-hook-form';
import { i18n } from 'src/i18n';
import yupFormSchemas from 'src/modules/shared/yup/yupFormSchemas';
import ButtonIcon from 'src/view/shared/ButtonIcon';
import InputFormItem from 'src/view/shared/form/items/InputFormItem';
import SelectFormItem from 'src/view/shared/form/items/SelectFormItem';
import SwitchFormItem from 'src/view/shared/form/items/SwitchFormItem';
import TextAreaFormItem from 'src/view/shared/form/items/TextAreaFormItem';
import FormWrapper from 'src/view/shared/styles/FormWrapper';
import * as yup from 'yup';
import { SAMPLES } from './samples';

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
  fields: yup.array().of(
    yup.object().shape({
      name: yup.string().required(),
      type: yup.string().required(),
      required: yup.boolean().default(false),
      options: yup.array().of(yup.string()).optional(),
      defaultValue: yup.mixed().optional(),
    })
  ).default([]),
  workflow: yup.object().shape({
    states: yup.array().of(
      yup.object().shape({
        name: yup.string().required(),
        color: yup.string().default('#007bff'),
        isInitial: yup.boolean().default(false),
        isFinal: yup.boolean().default(false),
      })
    ).default([]),
    transitions: yup.array().of(
      yup.object().shape({
        from: yup.string().required(),
        to: yup.string().required(),
        name: yup.string().required(),
      })
    ).default([]),
  }).default({ states: [], transitions: [] }),
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
      fields: record.fields || [],
      workflow: record.workflow || { states: [], transitions: [] },
      isActive: record.isActive !== undefined ? record.isActive : true,
    };
  });

  const form = useForm({
    resolver: yupResolver(schema as yup.AnyObjectSchema),
    mode: 'all',
    defaultValues: initialValues as any,
  });

  const { fields: formFields, append: appendField, remove: removeField } = useFieldArray({
    control: form.control,
    name: 'fields',
  });

  const { fields: workflowStates, append: appendState, remove: removeState } = useFieldArray({
    control: form.control,
    name: 'workflow.states',
  });

  const { fields: workflowTransitions, append: appendTransition, remove: removeTransition } = useFieldArray({
    control: form.control,
    name: 'workflow.transitions',
  });

  const onTypeChange = useCallback((selectedType) => {
    if (selectedType && SAMPLES[selectedType]) {
      const sample = SAMPLES[selectedType];
      
      // Clear existing fields, states, and transitions
      form.setValue('fields', []);
      form.setValue('workflow.states', []);
      form.setValue('workflow.transitions', []);
      
      // Convert sample fields to form format
      const sampleFields = sample.fields.map(field => ({
        name: field.name,
        type: field.type === 'text' ? 'TEXT' : 
              field.type === 'textarea' ? 'TEXTAREA' :
              field.type === 'number' ? 'NUMBER' :
              field.type === 'select' ? 'SELECT' :
              field.type === 'boolean' ? 'BOOLEAN' :
              field.type === 'date' ? 'DATE' : 'TEXT',
        required: field.required || false,
        options: field.options || [],
        defaultValue: field.defaultValue || '',
      }));
      
      // Convert sample states to form format
      const sampleStates = sample.workflow.states.map(state => ({
        name: state.name,
        color: '#007bff',
        isInitial: state.isInitial || false,
        isFinal: state.isFinal || false,
      }));
      
      // Convert sample transitions to form format
      const sampleTransitions = sample.workflow.transitions.map(transition => ({
        name: `${transition.fromState} → ${transition.toState}`,
        from: transition.fromState,
        to: transition.toState,
      }));
      
      // Set the sample data
      form.setValue('fields', sampleFields);
      form.setValue('workflow.states', sampleStates);
      form.setValue('workflow.transitions', sampleTransitions);
      
      // Update the name if it's empty
      if (!form.getValues('name')) {
        form.setValue('name', `${sample.name} Template`);
      }
    }
  }, [form]);

  // Watch for type changes to populate sample data
  const watchedType = form.watch('type');
  
  useEffect(() => {
    if (watchedType && SAMPLES[watchedType]) {
      onTypeChange(watchedType);
    }
  }, [watchedType, onTypeChange]);

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
          {/* Basic Information */}
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
              <TextAreaFormItem
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
                  {
                    value: 'TEST_PLAN',
                    label: i18n('entities.taskTemplate.enumerators.type.TEST_PLAN'),
                  },
                  {
                    value: 'TEST_CASE',
                    label: i18n('entities.taskTemplate.enumerators.type.TEST_CASE'),
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

          {/* Custom Fields Section */}
          <div className="row mt-4">
            <div className="col-12">
              <h5>{i18n('entities.taskTemplate.sections.customFields')}</h5>
              <p className="text-muted">{i18n('entities.taskTemplate.hints.customFields')}</p>
              
              {formFields.map((field, index) => (
                <div key={field.id} className="card mb-3">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-3">
                        <InputFormItem
                          name={`fields.${index}.name`}
                          label={i18n('entities.taskTemplate.fields.fieldName')}
                          required
                        />
                      </div>
                      <div className="col-md-2">
                        <SelectFormItem
                          name={`fields.${index}.type`}
                          label={i18n('entities.taskTemplate.fields.fieldType')}
                          options={[
                            { value: 'TEXT', label: i18n('entities.taskTemplate.enumerators.fieldType.TEXT') },
                            { value: 'NUMBER', label: i18n('entities.taskTemplate.enumerators.fieldType.NUMBER') },
                            { value: 'DATE', label: i18n('entities.taskTemplate.enumerators.fieldType.DATE') },
                            { value: 'SELECT', label: i18n('entities.taskTemplate.enumerators.fieldType.SELECT') },
                            { value: 'TEXTAREA', label: i18n('entities.taskTemplate.enumerators.fieldType.TEXTAREA') },
                            { value: 'BOOLEAN', label: i18n('entities.taskTemplate.enumerators.fieldType.BOOLEAN') },
                          ]}
                          required
                        />
                      </div>
                      <div className="col-md-2">
                        <SwitchFormItem
                          name={`fields.${index}.required`}
                          label={i18n('entities.taskTemplate.fields.required')}
                        />
                      </div>
                      <div className="col-md-3">
                        <InputFormItem
                          name={`fields.${index}.defaultValue`}
                          label={i18n('entities.taskTemplate.fields.defaultValue')}
                        />
                      </div>
                      <div className="col-md-2 d-flex align-items-end">
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => removeField(index)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => appendField({ name: '', type: 'TEXT', required: false, options: [], defaultValue: '' })}
              >
                <i className="fas fa-plus"></i> {i18n('entities.taskTemplate.actions.addField')}
              </button>
            </div>
          </div>

          {/* Workflow States Section */}
          <div className="row mt-4">
            <div className="col-12">
              <h5>{i18n('entities.taskTemplate.sections.workflowStates')}</h5>
              <p className="text-muted">{i18n('entities.taskTemplate.hints.workflowStates')}</p>
              
              {workflowStates.map((state, index) => (
                <div key={state.id} className="card mb-3">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-3">
                        <InputFormItem
                          name={`workflow.states.${index}.name`}
                          label={i18n('entities.taskTemplate.fields.stateName')}
                          required
                        />
                      </div>
                      <div className="col-md-2">
                        <InputFormItem
                          name={`workflow.states.${index}.color`}
                          label={i18n('entities.taskTemplate.fields.stateColor')}
                          type="color"
                        />
                      </div>
                      <div className="col-md-2">
                        <SwitchFormItem
                          name={`workflow.states.${index}.isInitial`}
                          label={i18n('entities.taskTemplate.fields.isInitial')}
                        />
                      </div>
                      <div className="col-md-2">
                        <SwitchFormItem
                          name={`workflow.states.${index}.isFinal`}
                          label={i18n('entities.taskTemplate.fields.isFinal')}
                        />
                      </div>
                      <div className="col-md-3 d-flex align-items-end">
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => removeState(index)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => appendState({ name: '', color: '#007bff', isInitial: false, isFinal: false })}
              >
                <i className="fas fa-plus"></i> {i18n('entities.taskTemplate.actions.addState')}
              </button>
            </div>
          </div>

          {/* Workflow Transitions Section */}
          <div className="row mt-4">
            <div className="col-12">
              <h5>{i18n('entities.taskTemplate.sections.workflowTransitions')}</h5>
              <p className="text-muted">{i18n('entities.taskTemplate.hints.workflowTransitions')}</p>
              
              {workflowTransitions.map((transition, index) => (
                <div key={transition.id} className="card mb-3">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-3">
                        <InputFormItem
                          name={`workflow.transitions.${index}.name`}
                          label={i18n('entities.taskTemplate.fields.transitionName')}
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <InputFormItem
                          name={`workflow.transitions.${index}.from`}
                          label={i18n('entities.taskTemplate.fields.fromState')}
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <InputFormItem
                          name={`workflow.transitions.${index}.to`}
                          label={i18n('entities.taskTemplate.fields.toState')}
                          required
                        />
                      </div>
                      <div className="col-md-3 d-flex align-items-end">
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => removeTransition(index)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => appendTransition({ name: '', from: '', to: '' })}
              >
                <i className="fas fa-plus"></i> {i18n('entities.taskTemplate.actions.addTransition')}
              </button>
            </div>
          </div>

          <div className="form-buttons mt-4">
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
