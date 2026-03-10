import React, { useCallback, useMemo, useState } from 'react';
import { FormProvider, useForm, Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { i18n } from 'src/i18n';
import TaskService from 'src/modules/task/taskService';
import ButtonIcon from 'src/view/shared/ButtonIcon';
import FormWrapper from 'src/view/shared/styles/FormWrapper';
import ProjectAutocompleteFormItem from 'src/view/project/autocomplete/ProjectAutocompleteFormItem';
import TaskAutocompleteFormItem from 'src/view/task/autocomplete/TaskAutocompleteFormItem';
import SelectFormItem from 'src/view/shared/form/items/SelectFormItem';
import Errors from 'src/modules/shared/error/errors';
import Message from 'src/view/shared/message';
import yupFormSchemas from 'src/modules/shared/yup/yupFormSchemas';

const QUICK_FORMAT_PLACEHOLDER = `title task 1
description task 1

title task 2
description task 2`;

export interface ParsedTask {
  title: string;
  description: string;
}

function parseQuickFormat(text: string): ParsedTask[] {
  const blocks = text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  const result: ParsedTask[] = [];
  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trimEnd());
    const title = lines[0] ?? '';
    const description = lines.slice(1).join('\n').trim() ?? '';
    if (title.trim()) {
      result.push({ title: title.trim(), description });
    }
  }
  return result;
}

const TYPE_OPTIONS = [
  { value: 'EPIC', label: i18n('entities.taskTemplate.enumerators.type.EPIC') },
  { value: 'USER_STORY', label: i18n('entities.taskTemplate.enumerators.type.USER_STORY') },
  { value: 'TASK', label: i18n('entities.taskTemplate.enumerators.type.TASK') },
  { value: 'BUG', label: i18n('entities.taskTemplate.enumerators.type.BUG') },
  { value: 'SUBTASK', label: i18n('entities.taskTemplate.enumerators.type.SUBTASK') },
  { value: 'TEST_PLAN', label: i18n('entities.taskTemplate.enumerators.type.TEST_PLAN') },
  { value: 'TEST_CASE', label: i18n('entities.taskTemplate.enumerators.type.TEST_CASE') },
];

const quickCreateSchema = yup.object().shape({
  project: yupFormSchemas.relationToOne(
    i18n('entities.task.fields.project'),
    { required: true },
  ),
  type: yupFormSchemas.string(
    i18n('entities.task.fields.type'),
    {},
  ),
  parents: yupFormSchemas.relationToMany(
    i18n('entities.task.fields.parents'),
    {},
  ),
});

type QuickCreateFormValues = {
  project?: any;
  type?: string;
  parents?: any[];
};

export interface QuickCreateTaskWithDetailProps {
  visible?: boolean;
  onClose?: () => void;
  onSuccess?: (tasks: any[]) => void;
  initialProject?: any;
  initialType?: string;
  initialParents?: any[];
  /** If true, render as modal; if false, render inline (e.g. in a page) */
  modal?: boolean;
}

const QuickCreateTaskWithDetail: React.FC<QuickCreateTaskWithDetailProps> = ({
  visible = true,
  onClose,
  onSuccess,
  initialProject = null,
  initialType = 'TASK',
  initialParents = [],
  modal = true,
}) => {
  const [textareaValue, setTextareaValue] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  const form = useForm<QuickCreateFormValues>({
    resolver: yupResolver(quickCreateSchema) as Resolver<QuickCreateFormValues>,
    mode: 'all',
    defaultValues: {
      project: initialProject,
      type: initialType,
      parents: initialParents || [],
    },
  });

  const parsedTasks = useMemo(() => parseQuickFormat(textareaValue), [textareaValue]);
  const parsedCount = parsedTasks.length;

  const onSubmit = useCallback(
    async (values: QuickCreateFormValues) => {
      if (parsedTasks.length === 0) {
        Message.error(i18n('entities.task.quickCreate.enterAtLeastOne'));
        return;
      }
      const projectId =
        values.project?.id ?? values.project;
      if (!projectId) {
        (form as any).setError('project', {
          type: 'manual',
          message: i18n('validation.required'),
        });
        return;
      }
      const parentIds = (values.parents || [])
        .map((p) => (p?.id != null ? p.id : p))
        .filter(Boolean);

      setSaveLoading(true);
      try {
        const tasksPayload = parsedTasks.map((task) => ({
          type: values.type || 'TASK',
          title: task.title || 'Untitled',
          description: task.description || '',
          ...(parentIds.length > 0 && { parents: parentIds }),
        }));
        await TaskService.bulkCreate(projectId, tasksPayload);
        onSuccess?.([]);
        if (modal && onClose) {
          setTextareaValue('');
          form.reset({ project: values.project, type: values.type, parents: values.parents });
          onClose();
        }
      } catch (error) {
        Errors.handle(error);
      } finally {
        setSaveLoading(false);
      }
    },
    [parsedTasks, form, modal, onClose, onSuccess],
  );

  const handleCancel = useCallback(() => {
    setTextareaValue('');
    form.reset();
    onClose?.();
  }, [form, onClose]);

  if (modal && visible === false) return null;

  const content = (
    <FormWrapper>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="row">
            <div className="col-lg-7 col-md-8 col-12">
              <ProjectAutocompleteFormItem
                name="project"
                label={i18n('entities.task.fields.project')}
                required
              />
            </div>
            <div className="col-lg-7 col-md-8 col-12">
              <SelectFormItem
                name="type"
                label={i18n('entities.task.fields.type')}
                options={TYPE_OPTIONS}
              />
            </div>
            <div className="col-lg-7 col-md-8 col-12">
              <TaskAutocompleteFormItem
                name="parents"
                label={i18n('entities.task.fields.parents')}
                mode="multiple"
              />
            </div>
            <div className="col-12">
              <div className="form-group">
                <label className="form-label">
                  {i18n('entities.task.quickCreate.tasksLabel')}
                  {parsedCount > 0 && (
                    <span className="text-muted small fw-normal ms-2">
                      — {parsedCount} task{parsedCount !== 1 ? 's' : ''} detected
                    </span>
                  )}
                </label>
                <textarea
                  className="form-control"
                  rows={12}
                  value={textareaValue}
                  onChange={(e) => setTextareaValue(e.target.value)}
                  placeholder={QUICK_FORMAT_PLACEHOLDER}
                  style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}
                />
                <small className="form-text text-muted">
                  {i18n('entities.task.quickCreate.hint')}
                </small>
              </div>
            </div>
          </div>
          <div className="form-buttons">
            <button
              className="btn btn-primary"
              disabled={saveLoading}
              type="submit"
            >
              <ButtonIcon
                loading={saveLoading}
                iconClass="fas fa-plus"
              />{' '}
              {saveLoading
                ? i18n('common.saving')
                : i18n('entities.task.quickCreate.create')}
            </button>
            {modal && onClose && (
              <button
                className="btn btn-light"
                type="button"
                disabled={saveLoading}
                onClick={handleCancel}
              >
                <i className="fas fa-times" /> {i18n('common.cancel')}
              </button>
            )}
          </div>
        </form>
      </FormProvider>
    </FormWrapper>
  );

  if (!modal) return content;

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {i18n('entities.task.quickCreate.title')}
            </h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            />
          </div>
          <div className="modal-body">{content}</div>
        </div>
      </div>
    </div>
  );
};

export default QuickCreateTaskWithDetail;
