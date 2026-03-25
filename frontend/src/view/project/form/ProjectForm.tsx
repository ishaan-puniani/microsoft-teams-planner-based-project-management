import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { i18n } from 'src/i18n';
import Errors from 'src/modules/shared/error/errors';
import yupFormSchemas from 'src/modules/shared/yup/yupFormSchemas';
import AiAgentService from 'src/modules/aiAgent/aiAgentService';
import ButtonIcon from 'src/view/shared/ButtonIcon';
import InputFormItem from 'src/view/shared/form/items/InputFormItem';
import TextAreaFormItem from 'src/view/shared/form/items/TextAreaFormItem';
import DatePickerFormItem from 'src/view/shared/form/items/DatePickerFormItem';
import SelectFormItem from 'src/view/shared/form/items/SelectFormItem';
import FormWrapper from 'src/view/shared/styles/FormWrapper';
import TaskTemplateAutocompleteFormItem from 'src/view/taskTemplate/autocomplete/TaskTemplateAutocompleteFormItem';
import * as yup from 'yup';
import MsPlanAutocompleteFormItem from 'src/view/msPlanner/autocomplete/MsPlanAutocomplete';
import MsPGroupAutocompleteFormItem from 'src/view/msPlanner/autocomplete/MsPGroupAutocomplete';
import { ESTIMATES_ROLES } from 'src/view/project/reports/components/estimatesConstants';

const SKILL_LEVEL_OPTIONS = [
  { value: '', label: i18n('entities.project.fields.teamSkillLevelUnallocated') },
  { value: 'LOW', label: i18n('entities.project.fields.teamSkillLevelLow') },
  { value: 'MEDIUM', label: i18n('entities.project.fields.teamSkillLevelMedium') },
  { value: 'HIGH', label: i18n('entities.project.fields.teamSkillLevelHigh') },
];

const schema = yup.object().shape({
  name: yupFormSchemas.string(
    i18n('entities.project.fields.name'),
    {},
  ),
  description: yupFormSchemas.string(
    i18n('entities.project.fields.description'),
    {},
  ),
  skillsEstimationContext: yupFormSchemas.string(
    i18n('entities.project.fields.skillsEstimationContext'),
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
  msGroup: yupFormSchemas.relationToOne(
    i18n('entities.project.fields.msGroup'),
    {},
  ),
  msPlan: yupFormSchemas.relationToOne(
    i18n('entities.project.fields.msPlan'),
    {},
  ),
  epicTemplate: yupFormSchemas.relationToOne(
    i18n('entities.project.fields.epicTemplate'),
    {},
  ),
  userStoryTemplate: yupFormSchemas.relationToOne(
    i18n('entities.project.fields.userStoryTemplate'),
  ),
  taskTemplate: yupFormSchemas.relationToOne(
    i18n('entities.project.fields.taskTemplate'),
  ),
  bugTemplate: yupFormSchemas.relationToOne(
    i18n('entities.project.fields.bugTemplate'),
  ),
  subtaskTemplate: yupFormSchemas.relationToOne(
    i18n('entities.project.fields.subtaskTemplate'),
  ),
  testPlanTemplate: yupFormSchemas.relationToOne(
    i18n('entities.project.fields.testPlanTemplate'),
  ),
  testCaseTemplate: yupFormSchemas.relationToOne(
    i18n('entities.project.fields.testCaseTemplate'),
  ),
  teamSkillLevel: yup.object().shape(
    Object.fromEntries(
      ESTIMATES_ROLES.map(({ key }) => [
        key,
        yup
          .string()
          .nullable()
          .oneOf(['', 'LOW', 'MEDIUM', 'HIGH']),
      ]),
    ),
  ),
});

function normalizeRelationToOne(value: any): { id: string; label: string } | null {
  if (value == null) return null;
  if (typeof value === 'object' && (value.id != null || value._id != null)) {
    const id = String(value.id ?? value._id);
    const label = value.label ?? value.name ?? id;
    return { id, label };
  }
  if (typeof value === 'string' && value.trim() !== '') {
    return { id: value, label: value };
  }
  return null;
}

const ProjectForm = (props) => {
  const [suggestion, setSuggestion] = useState('');
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [initialValues] = useState(() => {
    const record = props.record || {};
    const tsl = record.teamSkillLevel || {};
    return {
      name: record.name,
      description: record.description,
      skillsEstimationContext: record.skillsEstimationContext,
      code: record.code,
      startDate: record.startDate,
      endDate: record.endDate,
      status: record.status,
      priority: record.priority,
      msGroup: normalizeRelationToOne(record.msGroup),
      msPlan: normalizeRelationToOne(record.msPlan),
      epicTemplate: normalizeRelationToOne(record.epicTemplate),
      userStoryTemplate: normalizeRelationToOne(record.userStoryTemplate),
      taskTemplate: normalizeRelationToOne(record.taskTemplate),
      bugTemplate: normalizeRelationToOne(record.bugTemplate),
      subtaskTemplate: normalizeRelationToOne(record.subtaskTemplate),
      testPlanTemplate: normalizeRelationToOne(record.testPlanTemplate),
      testCaseTemplate: normalizeRelationToOne(record.testCaseTemplate),
      teamSkillLevel: {
        architect: tsl.architect ?? '',
        developer: tsl.developer ?? '',
        tester: tsl.tester ?? '',
        businessAnalyst: tsl.businessAnalyst ?? '',
        ux: tsl.ux ?? '',
        pm: tsl.pm ?? '',
      },
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
    const payload = { ...values };
    if (payload.teamSkillLevel) {
      payload.teamSkillLevel = Object.fromEntries(
        Object.entries(payload.teamSkillLevel).filter(
          ([_, v]) => v != null && v !== '',
        ),
      ) as typeof payload.teamSkillLevel;
      if (Object.keys(payload.teamSkillLevel).length === 0) {
        payload.teamSkillLevel = undefined;
      }
    }
    props.onSubmit(props?.record?.id, payload);
  };

  const groupId = form.watch('msGroup')?.id;
  const description = form.watch('description');
  const descriptionText = typeof description === 'string' ? description.trim() : '';
  const canGenerateSuggestion = descriptionText.length > 0;
  const prevGroupIdRef = useRef<string | undefined>(undefined);

  // When msGroup changes, clear msPlan so the plan list refetches for the new group and we don't keep a plan from the previous group
  useEffect(() => {
    if (prevGroupIdRef.current !== undefined && prevGroupIdRef.current !== groupId) {
      form.setValue('msPlan', null);
    }
    prevGroupIdRef.current = groupId;
  }, [groupId, form]);

  const onGenerateSuggestion = async () => {
    if (!canGenerateSuggestion || suggestionLoading) {
      return;
    }

    try {
      setSuggestionLoading(true);
      const data = await AiAgentService.suggestProjectDescription(descriptionText);
      setSuggestion((data?.suggestion || '').trim());
    } catch (error) {
      Errors.showMessage(error);
    } finally {
      setSuggestionLoading(false);
    }
  };

  return (
    <FormWrapper>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="row">
            <div className="col-lg-7 col-md-8 col-12">
              <MsPGroupAutocompleteFormItem
                name="msGroup"
                label={i18n('entities.project.fields.groupId')}
              />
            </div>
            {groupId?.length > 2 &&
              <div className="col-lg-7 col-md-8 col-12">
                <MsPlanAutocompleteFormItem
                  key={groupId}
                  name="msPlan"
                  label={i18n('entities.project.fields.msPlan')}
                  groupId={groupId}
                />
              </div>
            }
            <div className="col-lg-7 col-md-8 col-12">
              <InputFormItem
                name="name"
                label={i18n('entities.project.fields.name')}
              />
            </div>
            <div className="col-lg-7 col-md-8 col-12">
              <TextAreaFormItem
                name="description"
                label={i18n('entities.project.fields.description')}
              />

              <div className="mt-2">
                <div className="mb-2">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    type="button"
                    disabled={!canGenerateSuggestion || suggestionLoading || props.saveLoading}
                    onClick={onGenerateSuggestion}
                  >
                    {suggestionLoading ? 'Generating suggestion...' : 'Generate Suggestion'}
                  </button>
                </div>

                {suggestion ? (
                  <div className="alert alert-info mb-0" role="status">
                    {suggestion}
                  </div>
                ) : null}
              </div>

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

          <div className="row">
            <div className="col-12">
              <h5 className="mb-3">{i18n('entities.project.sections.teamSkillLevel')}</h5>
            </div>
            <div className="col-lg-7 col-md-8 col-12">
              <TextAreaFormItem
                name="skillsEstimationContext"
                label={i18n('entities.project.fields.skillsEstimationContext')}
                placeholder={i18n('entities.project.placeholders.skillsEstimationContext')}
              />
            </div>
            {ESTIMATES_ROLES.map(({ key, label }) => (
              <div key={key} className="col-lg-6 col-md-8 col-12">
                <SelectFormItem
                  name={`teamSkillLevel.${key}`}
                  label={label}
                  options={SKILL_LEVEL_OPTIONS}
                />
              </div>
            ))}
          </div>

          <div className="row">
            <div className="col-12">
              <h5 className="mb-3">{i18n('entities.project.sections.templates')}</h5>
            </div>
            <div className="col-lg-6 col-md-8 col-12">
              <TaskTemplateAutocompleteFormItem
                name="epicTemplate"
                label={i18n('entities.project.fields.epicTemplate')}
                hint={i18n('entities.project.hints.epicTemplate')}
                showCreate={!props.modal}
              />
            </div>
            <div className="col-lg-6 col-md-8 col-12">
              <TaskTemplateAutocompleteFormItem
                name="userStoryTemplate"
                label={i18n('entities.project.fields.userStoryTemplate')}
                hint={i18n('entities.project.hints.userStoryTemplate')}
                showCreate={!props.modal}
              />
            </div>
            <div className="col-lg-6 col-md-8 col-12">
              <TaskTemplateAutocompleteFormItem
                name="taskTemplate"
                label={i18n('entities.project.fields.taskTemplate')}
                hint={i18n('entities.project.hints.taskTemplate')}
                showCreate={!props.modal}
              />
            </div>
            <div className="col-lg-6 col-md-8 col-12">
              <TaskTemplateAutocompleteFormItem
                name="bugTemplate"
                label={i18n('entities.project.fields.bugTemplate')}
                hint={i18n('entities.project.hints.bugTemplate')}
                showCreate={!props.modal}
              />
            </div>
            <div className="col-lg-6 col-md-8 col-12">
              <TaskTemplateAutocompleteFormItem
                name="subtaskTemplate"
                label={i18n('entities.project.fields.subtaskTemplate')}
                hint={i18n('entities.project.hints.subtaskTemplate')}
                showCreate={!props.modal}
              />
            </div>
            <div className="col-lg-6 col-md-8 col-12">
              <TaskTemplateAutocompleteFormItem
                name="testPlanTemplate"
                label={i18n('entities.project.fields.testPlanTemplate')}
                hint={i18n('entities.project.hints.testPlanTemplate')}
                showCreate={!props.modal}
              />
            </div>
            <div className="col-lg-6 col-md-8 col-12">
              <TaskTemplateAutocompleteFormItem
                name="testCaseTemplate"
                label={i18n('entities.project.fields.testCaseTemplate')}
                hint={i18n('entities.project.hints.testCaseTemplate')}
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

export default ProjectForm;
