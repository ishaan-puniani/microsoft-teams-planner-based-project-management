import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { i18n } from 'src/i18n';
import Errors from 'src/modules/shared/error/errors';
import ProjectService from 'src/modules/project/projectService';
import AiAgentService from 'src/modules/aiAgent/aiAgentService';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import PageTitle from 'src/view/shared/styles/PageTitle';
import Spinner from 'src/view/shared/Spinner';
import ButtonIcon from 'src/view/shared/ButtonIcon';
import { parseStructuredBulk, serializeTasksOnly } from './structuredBulkParser';
import type { ParsedItem } from './structuredBulkParser';
import EpicPanelOfProjectPlanner from './components/EpicPanelOfProjectPlanner';
import {
  loadPlannerContent,
  savePlannerContent,
  loadPlannerBrief,
  savePlannerBrief,
  PLANNER_SAMPLE_PLACEHOLDER,
} from './plannerStorage';
import './plannerHierarchy.css';

const SAVE_DEBOUNCE_MS = 500;

function serializeUserStory(item: ParsedItem): string {
  const lines: string[] = [`- ${item.title}`];
  if (item.description) lines.push(item.description);
  if (item.acceptanceCriteria.length > 0) {
    lines.push('AC:');
    item.acceptanceCriteria.forEach((c) => lines.push(`- ${c}`));
  }
  return lines.join('\n');
}

function buildFullStructuredText(
  epicsText: string,
  epicUserStories: Record<number, string>,
  userStoryTasks: Record<string, string>,
): string {
  const epicNames = epicsText
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const sections: string[] = [];
  for (let i = 0; i < epicNames.length; i++) {
    sections.push(epicNames[i]);
    const text = epicUserStories[i] || '';
    const parsed = parseStructuredBulk(text);
    const userStories = parsed.filter((x) => x.level === 1);
    for (let j = 0; j < userStories.length; j++) {
      const key = `${i}-${j}`;
      const userStoryBlock = serializeUserStory(userStories[j]);
      const tasksBlock = userStoryTasks[key];
      sections.push(tasksBlock ? `${userStoryBlock}\n\n${tasksBlock}` : userStoryBlock);
    }
    sections.push('');
  }
  return sections.join('\n\n').trim();
}

function parseFullTextToAgentState(fullText: string): {
  epicsText: string;
  epicUserStories: Record<number, string>;
  userStoryTasks: Record<string, string>;
} {
  const items = parseStructuredBulk(fullText);
  const epicIdxs = items.map((x, i) => (x.level === 0 ? i : -1)).filter((i) => i >= 0);
  if (epicIdxs.length === 0) {
    return { epicsText: '', epicUserStories: {}, userStoryTasks: {} };
  }
  const epicNames = epicIdxs.map((i) => items[i].title);
  const epicsText = epicNames.join('\n');
  const epicUserStories: Record<number, string> = {};
  const userStoryTasks: Record<string, string> = {};
  for (let ei = 0; ei < epicIdxs.length; ei++) {
    const start = epicIdxs[ei];
    const end = epicIdxs[ei + 1] ?? items.length;
    const epicItems = items.slice(start, end);
    const epicTitle = epicItems[0].level === 0 ? epicItems[0].title : '';
    const rest = epicItems.slice(1);
    const blocks: ParsedItem[][] = [];
    let current: ParsedItem[] = [];
    for (const item of rest) {
      if (item.level === 1) {
        if (current.length) blocks.push(current);
        current = [item];
      } else if (item.level === 2) {
        current.push(item);
      }
    }
    if (current.length) blocks.push(current);
    // Do not include epic title in user-stories text; it is already shown in the epic accordion header.
    const epicBlockLines: string[] = [];
    blocks.forEach((block, j) => {
      epicBlockLines.push(serializeUserStory(block[0]));
      userStoryTasks[`${ei}-${j}`] = serializeTasksOnly(block.slice(1));
    });
    epicUserStories[ei] = epicBlockLines.join('\n\n');
  }
  return { epicsText, epicUserStories, userStoryTasks };
}

const ProjectPlannerAgentPage = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const [project, setProject] = useState<{ id: string; name?: string } | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [step, setStep] = useState<1 | 2>(1);
  const [projectBrief, setProjectBrief] = useState('');
  const [epicsText, setEpicsText] = useState('');
  const [showEpicsPreview, setShowEpicsPreview] = useState(false);
  const [epicUserStories, setEpicUserStories] = useState<Record<number, string>>({});
  const [userStoryTasks, setUserStoryTasks] = useState<Record<string, string>>({});
  const [epicsLoading, setEpicsLoading] = useState(false);
  const [epicsError, setEpicsError] = useState<string | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedForProjectRef = useRef<string | null>(null);

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

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  useEffect(() => {
    if (!projectId) return;
    if (loadedForProjectRef.current === projectId) return;
    loadedForProjectRef.current = projectId;
    const brief = loadPlannerBrief(projectId);
    if (brief != null) setProjectBrief(brief);
    const content = loadPlannerContent(projectId);
    const trimmed = content?.trim() ?? '';
    // Do not load sample placeholder into AI planner; it is only a placeholder elsewhere.
    if (trimmed && trimmed !== PLANNER_SAMPLE_PLACEHOLDER.trim()) {
      try {
        const state = parseFullTextToAgentState(content!);
        setEpicsText(state.epicsText);
        setEpicUserStories(state.epicUserStories);
        setUserStoryTasks(state.userStoryTasks);
      } catch {
        // keep default state if parse fails
      }
    }
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveTimeoutRef.current = null;
      const formatted = buildFullStructuredText(epicsText, epicUserStories, userStoryTasks);
      if (formatted.trim()) savePlannerContent(projectId, formatted);
      savePlannerBrief(projectId, projectBrief);
    }, SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [projectId, projectBrief, epicsText, epicUserStories, userStoryTasks]);

  const handleGenerateEpics = async () => {
    setEpicsError(null);
    setEpicsLoading(true);
    try {
      const data = await AiAgentService.plannerSuggestEpics(projectBrief);
      setEpicsText(data.epicsText || '');
    } catch (e: any) {
      Errors.handle(e);
      setEpicsError(e?.message || 'Request failed');
    } finally {
      setEpicsLoading(false);
    }
  };

  const handleContinueToEpics = () => {
    if (epicsText.trim()) setStep(2);
  };

  const epicNames = epicsText
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);

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
          [i18n('common.planner'), `/project-planner/${projectId}`],
          'AI Assistant',
        ]}
      />

      <ContentWrapper>
        <PageTitle>AI Assistant — {project.name || projectId}</PageTitle>

        <div className="mb-3">
          <Link
            to={`/project-planner/${projectId}`}
            className="btn btn-light btn-sm me-2"
          >
            <i className="fas fa-arrow-left me-1" />
            Back to Planner
          </Link>
          <Link to={`/project/${projectId}`} className="btn btn-outline-secondary btn-sm">
            {i18n('common.view')} {i18n('entities.project.menu')}
          </Link>
        </div>

        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="fas fa-robot me-2" />
              Generate requirements (Epics → User Stories → Tasks)
            </h5>
          </div>
          <div className="card-body">
            {step === 1 && (
              <>
                <label className="form-label small">Tell me about your project</label>
                <textarea
                  className="form-control mb-2"
                  rows={4}
                  value={projectBrief}
                  onChange={(e) => setProjectBrief(e.target.value)}
                  placeholder="e.g. E-commerce app with login, product catalog, cart and checkout."
                  disabled={epicsLoading}
                />
                <div className="mb-2">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={epicsLoading || !projectBrief.trim()}
                    onClick={handleGenerateEpics}
                  >
                    <ButtonIcon loading={epicsLoading} iconClass="fas fa-magic" />
                    Generate Epics
                  </button>
                </div>
                {epicsError && (
                  <div className="alert alert-danger py-2 small mb-2">{epicsError}</div>
                )}
                {epicsText && (
                  <>
                    <label className="form-label small">
                      Epics (editable, one per line)
                    </label>
                    <div className="mb-2">
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm me-2"
                        onClick={() => setShowEpicsPreview(!showEpicsPreview)}
                      >
                        {showEpicsPreview ? 'Show textarea' : 'Preview as list'}
                      </button>
                    </div>
                    {showEpicsPreview ? (
                      <ul className="list-group list-group-flush mb-2">
                        {epicNames.map((name, idx) => (
                          <li key={idx} className="list-group-item py-2">
                            {name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <textarea
                        className="form-control font-monospace small mb-2"
                        rows={8}
                        value={epicsText}
                        onChange={(e) => setEpicsText(e.target.value)}
                        disabled={epicsLoading}
                      />
                    )}
                    <div className="d-flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        disabled={epicsLoading}
                        onClick={handleContinueToEpics}
                      >
                        Continue to User Stories →
                      </button>
                    </div>
                  </>
                )}
              </>
            )}

            {step === 2 && (
              <>
                <p className="text-muted small mb-2">
                  Brief: {projectBrief.slice(0, 80)}
                  {projectBrief.length > 80 ? '…' : ''}
                </p>
                <p className="form-label small mb-2">
                  Expand each <strong>Epic</strong> to generate user stories. Expand each <strong>User Story</strong> to generate tasks. Each <strong>Task</strong> shows its todos.
                </p>
                <div className="accordion mb-3 planner-hierarchy" id="epics-accordion">
                  {epicNames.map((epicName, epicIndex) => (
                    <EpicPanelOfProjectPlanner
                      key={epicIndex}
                      epicIndex={epicIndex}
                      epicName={epicName}
                      projectBrief={projectBrief}
                      userStoriesText={epicUserStories[epicIndex] ?? ''}
                      onUserStoriesTextChange={(text) =>
                        setEpicUserStories((prev) => ({ ...prev, [epicIndex]: text }))
                      }
                      userStoryTasks={userStoryTasks}
                      onUserStoryTasksChange={(patch) =>
                        setUserStoryTasks((prev) => ({ ...prev, ...patch }))
                      }
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </ContentWrapper>
    </>
  );
};

export default ProjectPlannerAgentPage;
