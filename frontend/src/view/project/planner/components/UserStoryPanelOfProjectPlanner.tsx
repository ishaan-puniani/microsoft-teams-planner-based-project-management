import { useRef, useState, type ChangeEvent } from 'react';
import ButtonIcon from 'src/view/shared/ButtonIcon';
import AiAgentService, {
  type AiSuggestionAttachment,
} from 'src/modules/aiAgent/aiAgentService';
import Errors from 'src/modules/shared/error/errors';
import { parseStructuredBulk, serializeTasksOnly } from '../structuredBulkParser';
import type { ParsedItem } from '../structuredBulkParser';
import { TaskPanelOfProjectPlanner } from './TaskPanelOfProjectPlanner';
import {
  readPlannerReferenceFile,
  toAttachmentPayload,
  type PlannerReferenceFile,
} from '../plannerReferenceFile';

type Props = {
  epicIndex: number;
  userStoryIndex: number;
  userStory: ParsedItem;
  projectId: string;
  projectBrief: string;
  epicName: string;
  plannerAttachment?: AiSuggestionAttachment;
  tasksText: string;
  onTasksTextChange: (text: string) => void;
  serializeUserStoryText: () => string;
};

const UserStoryPanelOfProjectPlanner = ({
  epicIndex,
  userStoryIndex,
  userStory,
  projectId,
  projectBrief,
  epicName,
  plannerAttachment,
  tasksText,
  onTasksTextChange,
  serializeUserStoryText,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storyAttachment, setStoryAttachment] = useState<PlannerReferenceFile | null>(null);
  const storyFileRef = useRef<HTMLInputElement>(null);

  const parsed = parseStructuredBulk(tasksText);
  const tasks = parsed.filter((x) => x.level === 2);

  const handleTaskTodosChange = (taskIndex: number, newTodos: string[]) => {
    if (taskIndex < 0 || taskIndex >= tasks.length) return;
    const level2Indices = parsed.reduce<number[]>((acc, p, i) => (p.level === 2 ? [...acc, i] : acc), []);
    const targetIdx = level2Indices[taskIndex];
    if (targetIdx == null) return;
    const updated = parsed.map((item, i) =>
      i === targetIdx && item.level === 2 ? { ...item, todoChecklist: newTodos } : item,
    );
    onTasksTextChange(serializeTasksOnly(updated));
  };

  const storyAttachmentPayload = toAttachmentPayload(storyAttachment);
  const attachmentForStoryAi = storyAttachmentPayload ?? plannerAttachment;

  const clearStoryFile = () => {
    setStoryAttachment(null);
    if (storyFileRef.current) storyFileRef.current.value = '';
  };

  const onStoryReferenceFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setStoryAttachment(null);
      return;
    }
    try {
      const data = await readPlannerReferenceFile(file);
      setStoryAttachment(data);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Invalid file');
      e.target.value = '';
    }
  };

  const handleGenerateTasks = async () => {
    setError(null);
    setLoading(true);
    try {
      const userStoryText = serializeUserStoryText();
      const data = await AiAgentService.plannerSuggestTasksForUserStory(
        userStoryText,
        { projectBrief, epicName, projectId, attachment: attachmentForStoryAi },
      );
      const fullBlock = data.tasksText || '';
      const parsedFull = parseStructuredBulk(fullBlock);
      const tasksOnly = parsedFull.filter((x) => x.level === 2);
      onTasksTextChange(serializeTasksOnly(tasksOnly));
    } catch (e: any) {
      Errors.handle(e);
      setError(e?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <details className="planner-level-1-item border rounded mb-2">
      <summary className="planner-userstory-header px-3 py-2 d-flex align-items-center">
        <span className="flex-grow-1 small fw-medium">{userStory.title}</span>
        {tasks.length > 0 && (
          <span className="badge bg-secondary ms-2">{tasks.length} tasks</span>
        )}
      </summary>
      <div className="planner-userstory-body px-3 pb-3 pt-0">
        {/* Description and AC (then task generation below) */}
        {userStory.description && (
          <div className="mb-2">
            <div className="small text-muted mb-1">Description</div>
            <p className="small mb-0">{userStory.description}</p>
          </div>
        )}
        {userStory.acceptanceCriteria.length > 0 && (
          <div className="mb-3">
            <div className="small text-muted mb-1">AC:</div>
            <ul className="small mb-0 ps-3">
              {userStory.acceptanceCriteria.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Step 3: Panel to generate Tasks for this User Story */}
        <div className="mb-2">
          <label className="form-label small text-muted">3. Tasks + Todos (for this user story)</label>
          <div className="mb-2">
            <div className="d-flex flex-wrap align-items-end gap-2">
              <div className="flex-grow-1" style={{ minWidth: '200px' }}>
                <label className="form-label small text-muted mb-0">
                  Optional PDF/image (this user story)
                </label>
                <input
                  ref={storyFileRef}
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/gif,image/webp,.pdf"
                  className="form-control form-control-sm"
                  disabled={loading}
                  onChange={onStoryReferenceFile}
                />
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={loading}
                onClick={handleGenerateTasks}
              >
                <ButtonIcon loading={loading} iconClass="fas fa-magic" />
                Generate Tasks
              </button>
            </div>
            {storyAttachment && (
              <div className="d-flex align-items-center flex-wrap gap-2 mt-1">
                <span
                  className="small text-muted text-truncate"
                  style={{ maxWidth: '280px' }}
                  title={storyAttachment.name}
                >
                  {storyAttachment.name}
                </span>
                <button
                  type="button"
                  className="btn btn-link btn-sm p-0"
                  onClick={clearStoryFile}
                >
                  Clear file
                </button>
              </div>
            )}
          </div>
          {error && (
            <div className="alert alert-danger py-2 small mb-2">{error}</div>
          )}
          <textarea
            className="form-control form-control-sm font-monospace small mb-2"
            rows={5}
            value={tasksText}
            onChange={(e) => onTasksTextChange(e.target.value)}
            placeholder="-- Task lines with TODO:. Generate or paste (no user story/AC here)."
            disabled={loading}
          />
        </div>

        {/* Nested: Tasks (each expandable → list of todos) */}
        {tasks.length > 0 && (
          <div className="planner-level-2 ms-2 border-start border-2 border-light ps-2">
            <div className="small text-muted mb-2">Tasks (expand to generate or view todos)</div>
            <TaskPanelOfProjectPlanner
              tasks={tasks}
              onTaskTodosChange={handleTaskTodosChange}
              projectId={projectId}
              projectBrief={projectBrief}
              userStoryTitle={userStory.title}
              plannerAttachment={attachmentForStoryAi}
            />
          </div>
        )}
      </div>
    </details>
  );
};

export { UserStoryPanelOfProjectPlanner };
export default UserStoryPanelOfProjectPlanner;
