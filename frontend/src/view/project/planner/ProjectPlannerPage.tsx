import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { i18n } from 'src/i18n';
import Errors from 'src/modules/shared/error/errors';
import Message from 'src/view/shared/message';
import ProjectService from 'src/modules/project/projectService';
import TaskService from 'src/modules/task/taskService';
import TaskTemplateService from 'src/modules/taskTemplate/taskTemplateService';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import PageTitle from 'src/view/shared/styles/PageTitle';
import Spinner from 'src/view/shared/Spinner';
import ButtonIcon from 'src/view/shared/ButtonIcon';
import {
  parseStructuredBulk,
  LEVEL_LABELS,
  LEVEL_TYPES,
  type Level,
} from './structuredBulkParser';
import type { ParsedItem } from './structuredBulkParser';
import { loadPlannerContent, savePlannerContent, PLANNER_SAMPLE_PLACEHOLDER } from './plannerStorage';
import { generateTaskClientId } from './taskIdUtils';

const PLANNER_SAVE_DEBOUNCE_MS = 500;

type TemplateWithFields = {
  id: string;
  name?: string;
  fields?: Array<{ id?: string; _id?: string; name?: string; type?: string }>;
};

function fieldId(f: { id?: string; _id?: string }): string | null {
  return f.id || (f as any)._id || null;
}

function getTemplateFieldIds(template: TemplateWithFields) {
  const fields = template?.fields || [];
  const byName = (name: string) =>
    fields.find((f) => String(f.name || '').toLowerCase() === name.toLowerCase());
  const byType = (type: string) => fields.find((f) => f.type === type);

  const title = byName('title') || byType('TEXT');
  const description = byName('description') || fields.find((f) => f.type === 'TEXTAREA');
  const acceptanceCriteria = byName('acceptance criteria');
  const checklist = fields.find((f) => f.type === 'CHECKLIST');

  return {
    title: title ? fieldId(title) : null,
    description: description ? fieldId(description) : null,
    acceptanceCriteria: acceptanceCriteria ? fieldId(acceptanceCriteria) : null,
    checklist: checklist ? fieldId(checklist) : null,
  };
}

/** Build one task payload for bulk-create API (parsed item + template). Includes clientId and parentClientId for hierarchy. */
function buildTaskPayload(
  projectId: string,
  item: ParsedItem,
  template: TemplateWithFields,
  typeKey: string,
  clientId: string,
  parentClientId: string | undefined,
): {
  project: string;
  template: string;
  type: string;
  title: string;
  description?: string;
  templateData: Record<string, unknown>;
  clientId: string;
  parentClientId?: string;
} {
  const ids = getTemplateFieldIds(template);
  const templateData: Record<string, unknown> = {};
  if (ids.title) templateData[ids.title] = item.title;
  if (ids.description && item.description) templateData[ids.description] = item.description;
  if (ids.acceptanceCriteria && item.acceptanceCriteria.length > 0) {
    templateData[ids.acceptanceCriteria] = item.acceptanceCriteria.join('\n');
  }
  if (ids.checklist && item.todoChecklist.length > 0) {
    templateData[ids.checklist] = item.todoChecklist.map((label) => ({ label, done: false }));
  }
  return {
    project: projectId,
    template: template.id,
    type: typeKey,
    title: item.title,
    description: item.description || undefined,
    templateData,
    clientId,
    ...(parentClientId != null && { parentClientId }),
  };
}

function PreviewItemForm({ item }: { item: ParsedItem }) {
  const indent = item.level * 12;
  return (
    <div className="mb-3" style={{ marginLeft: indent }}>
      <span className="badge bg-secondary mb-1">{LEVEL_LABELS[item.level]}</span>
      <input
        type="text"
        className="form-control form-control-sm mb-1"
        value={item.title}
        readOnly
      />
      {item.description && (
        <textarea
          className="form-control form-control-sm mb-1 font-monospace small"
          rows={3}
          value={item.description}
          readOnly
        />
      )}
      {item.acceptanceCriteria.length > 0 && (
        <>
          <label className="form-label small mb-0 mt-1">Acceptance Criteria</label>
          <textarea
            className="form-control form-control-sm small"
            rows={item.acceptanceCriteria.length + 1}
            value={item.acceptanceCriteria.join('\n')}
            readOnly
          />
        </>
      )}
      {item.todoChecklist.length > 0 && (
        <>
          <label className="form-label small mb-0 mt-1">TODO</label>
          <textarea
            className="form-control form-control-sm small"
            rows={item.todoChecklist.length + 1}
            value={item.todoChecklist.join('\n')}
            readOnly
          />
        </>
      )}
    </div>
  );
}

const ProjectPlannerPage = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const location = useLocation();
  const [project, setProject] = useState<{ id: string; name?: string } | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [templatesByType, setTemplatesByType] = useState<Record<string, TemplateWithFields[]>>({});
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [bulkText, setBulkText] = useState(PLANNER_SAMPLE_PLACEHOLDER);
  const [creating, setCreating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<'list' | 'form'>('list');
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadProject = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoadingProject(true);
      const data = await ProjectService.find(projectId);
      setProject(data);
    } catch (e) {
      Errors.handle(e);
      setProject(null);
    } finally {
      setLoadingProject(false);
    }
  }, [projectId]);

  const loadTemplates = useCallback(async () => {
    try {
      setLoadingTemplates(true);
      const [epic, userStory, task, subtask] = await Promise.all([
        TaskTemplateService.list({ type: 'EPIC' }, undefined, 100, 0),
        TaskTemplateService.list({ type: 'USER_STORY' }, undefined, 100, 0),
        TaskTemplateService.list({ type: 'TASK' }, undefined, 100, 0),
        TaskTemplateService.list({ type: 'SUBTASK' }, undefined, 100, 0),
      ]);
      setTemplatesByType({
        EPIC: epic?.rows || [],
        USER_STORY: userStory?.rows || [],
        TASK: task?.rows || [],
        SUBTASK: subtask?.rows || [],
      });
    } catch (e) {
      Errors.handle(e);
    } finally {
      setLoadingTemplates(false);
    }
  }, []);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  useEffect(() => {
    if (!projectId) return;
    const state = location.state as { bulkText?: string } | null;
    if (state?.bulkText) {
      setBulkText(state.bulkText);
      setShowPreview(false);
      window.history.replaceState({}, document.title, location.pathname);
      return;
    }
    const saved = loadPlannerContent(projectId);
    if (saved != null && saved.trim()) setBulkText(saved);
  }, [projectId, location.state, location.pathname]);

  useEffect(() => {
    if (!projectId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveTimeoutRef.current = null;
      // Do not persist sample placeholder; it is only for display in this view.
      if (bulkText.trim() !== PLANNER_SAMPLE_PLACEHOLDER.trim()) {
        savePlannerContent(projectId, bulkText);
      }
    }, PLANNER_SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [projectId, bulkText]);

  const parsed = parseStructuredBulk(bulkText);
  const templatesByLevel: Record<string, TemplateWithFields | null> = {
    EPIC: (templatesByType.EPIC || [])[0] || null,
    USER_STORY: (templatesByType.USER_STORY || [])[0] || null,
    TASK: (templatesByType.TASK || [])[0] || null,
    SUBTASK: (templatesByType.SUBTASK || [])[0] || null,
  };

  const handleBulkCreate = async () => {
    if (!projectId) return;
    const missing = LEVEL_TYPES.filter((t) => !templatesByLevel[t] && parsed.some((p) => LEVEL_TYPES[p.level] === t));
    if (missing.length > 0) {
      Message.error(`No template found for: ${missing.join(', ')}. Create task templates for these types first.`);
      return;
    }
    if (parsed.length === 0) {
      Message.error('Enter structured content (Epic, -User Story, --Task, ---Subtask).');
      return;
    }
    try {
      setCreating(true);
      const lastClientIdByLevel: Record<number, string> = {};
      const tasks: Array<ReturnType<typeof buildTaskPayload>> = [];
      for (const item of parsed) {
        const typeKey = LEVEL_TYPES[item.level];
        const template = templatesByLevel[typeKey];
        if (!template) continue;
        const clientId = generateTaskClientId();
        const parentClientId = item.level === 0 ? undefined : lastClientIdByLevel[item.level - 1];
        lastClientIdByLevel[item.level] = clientId;
        tasks.push(buildTaskPayload(projectId, item, template, typeKey, clientId, parentClientId));
      }
      const { count } = await TaskService.bulkCreate(projectId, tasks);
      Message.success(`Created ${count} requirement(s).`);
      setBulkText(PLANNER_SAMPLE_PLACEHOLDER);
      savePlannerContent(projectId, PLANNER_SAMPLE_PLACEHOLDER);
    } catch (e) {
      Errors.handle(e);
    } finally {
      setCreating(false);
    }
  };

  if (loadingProject || !projectId) {
    return (
      <ContentWrapper>
        <Spinner />
      </ContentWrapper>
    );
  }

  if (!project) {
    return (
      <ContentWrapper>
        <p>{i18n('common.noDataToExport')}</p>
      </ContentWrapper>
    );
  }

  return (
    <>
      <Breadcrumb
        items={[
          [i18n('dashboard.menu'), '/'],
          [i18n('entities.project.menu'), '/project'],
          [project.name || projectId, `/project/${projectId}`],
          [i18n('common.planner')],
        ]}
      />

      <ContentWrapper>
        <PageTitle>
          {i18n('common.planner')} — {project.name || projectId}
        </PageTitle>

        <div className="mb-3">
          <Link to={`/project-planner/${projectId}/estimate`} className="btn btn-outline-secondary btn-sm me-2">
            <i className="fas fa-table me-1" />
            Estimate / Time plan
          </Link>
          <Link to={`/project-planner/${projectId}/agent`} className="btn btn-outline-primary btn-sm me-2">
            <i className="fas fa-robot me-1" />
            Generate with AI
          </Link>
          <Link to={`/project/${projectId}`} className="btn btn-light btn-sm">
            <i className="fas fa-arrow-left me-1" />
            {i18n('common.view')} {i18n('entities.project.menu')}
          </Link>
        </div>

        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="fas fa-list-check me-2" />
              Structured bulk requirements
            </h5>
          </div>
          <div className="card-body">
            <p className="text-muted mb-3">
              Use a hierarchy: <strong>Epic</strong> (no dash), <strong>- User Story</strong> (one dash), <strong>-- Task</strong> (two dashes), <strong>--- Subtask</strong> (three dashes). Put description below each title. For User Stories, add <code>AC:</code> then <code>- item</code> lines for <strong>Acceptance Criteria</strong>. For Tasks, add <code>TODO:</code> then <code>- item</code> lines for the <strong>checklist</strong>.
            </p>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label mb-0">
                  {showPreview ? 'Preview' : 'Structured text'}
                  {showPreview && ` (${parsed.length} item(s))`}
                </label>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setShowPreview((v) => !v)}
                >
                  {showPreview ? (
                    <>
                      <i className="fas fa-edit me-1" />
                      Edit text
                    </>
                  ) : (
                    <>
                      <i className="fas fa-eye me-1" />
                      Show preview
                    </>
                  )}
                </button>
              </div>

              {!showPreview && (
                <textarea
                  className="form-control font-monospace"
                  rows={22}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                />
              )}

              {showPreview && (
                <>
                  <div className="btn-group btn-group-sm mb-2">
                    <button
                      type="button"
                      className={`btn ${previewMode === 'list' ? 'btn-primary' : 'btn-outline-secondary'}`}
                      onClick={() => setPreviewMode('list')}
                    >
                      List
                    </button>
                    <button
                      type="button"
                      className={`btn ${previewMode === 'form' ? 'btn-primary' : 'btn-outline-secondary'}`}
                      onClick={() => setPreviewMode('form')}
                    >
                      Form
                    </button>
                  </div>

                  {parsed.length > 0 && previewMode === 'list' && (
                    <ul className="list-group list-group-flush border rounded">
                      {parsed.map((item, idx) => (
                        <li key={idx} className="list-group-item d-flex flex-column gap-1">
                          <span className="badge bg-secondary align-self-start">
                            {LEVEL_LABELS[item.level as Level]}
                          </span>
                          <strong>{item.title}</strong>
                          {item.description && (
                            <span className="text-muted small">{item.description.split('\n')[0]}</span>
                          )}
                          {item.acceptanceCriteria.length > 0 && (
                            <span className="small">AC: {item.acceptanceCriteria.length} item(s)</span>
                          )}
                          {item.todoChecklist.length > 0 && (
                            <span className="small">Checklist: {item.todoChecklist.length} item(s)</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  {parsed.length > 0 && previewMode === 'form' && (
                    <div className="border rounded p-3 bg-light">
                      {parsed.map((item, idx) => (
                        <PreviewItemForm key={idx} item={item} />
                      ))}
                    </div>
                  )}

                  {parsed.length === 0 && (
                    <div className="border rounded p-3 bg-light text-muted small">
                      No items parsed. Click &quot;Edit text&quot; to add structured content.
                    </div>
                  )}
                </>
              )}
            </div>

            {!loadingTemplates && parsed.length > 0 && (
              <div className="mb-2 small text-muted">
                Templates: EPIC → {templatesByLevel.EPIC?.name ?? '—'}, User Story → {templatesByLevel.USER_STORY?.name ?? '—'}, Task → {templatesByLevel.TASK?.name ?? '—'}, Subtask → {templatesByLevel.SUBTASK?.name ?? '—'}
              </div>
            )}

            <button
              type="button"
              className="btn btn-primary"
              disabled={creating || parsed.length === 0}
              onClick={handleBulkCreate}
            >
              <ButtonIcon loading={creating} iconClass="fas fa-plus" />
              {creating ? 'Creating…' : `Create ${parsed.length} requirement(s)`}
            </button>
          </div>
        </div>
      </ContentWrapper>
    </>
  );
};

export default ProjectPlannerPage;
