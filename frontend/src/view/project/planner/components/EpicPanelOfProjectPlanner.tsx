import { useRef, useState, type ChangeEvent } from 'react';
import ButtonIcon from 'src/view/shared/ButtonIcon';
import AiAgentService, {
  type AiSuggestionAttachment,
} from 'src/modules/aiAgent/aiAgentService';
import Errors from 'src/modules/shared/error/errors';
import { parseStructuredBulk, serializeTasksOnly } from '../structuredBulkParser';
import type { ParsedItem } from '../structuredBulkParser';
import { UserStoryPanelOfProjectPlanner } from './UserStoryPanelOfProjectPlanner';
import {
  readPlannerReferenceFile,
  toAttachmentPayload,
  type PlannerReferenceFile,
} from '../plannerReferenceFile';

function serializeUserStory(item: ParsedItem): string {
  const lines: string[] = [`- ${item.title}`];
  if (item.description) lines.push(item.description);
  if (item.acceptanceCriteria.length > 0) {
    lines.push('AC:');
    item.acceptanceCriteria.forEach((c) => lines.push(`- ${c}`));
  }
  return lines.join('\n');
}

type Props = {
  epicIndex: number;
  epicName: string;
  projectId: string;
  projectBrief: string;
  plannerAttachment?: AiSuggestionAttachment;
  userStoriesText: string;
  onUserStoriesTextChange: (text: string) => void;
  userStoryTasks: Record<string, string>;
  onUserStoryTasksChange: (next: Record<string, string>) => void;
};

const EpicPanelOfProjectPlanner = ({
  epicIndex,
  epicName,
  projectId,
  projectBrief,
  plannerAttachment,
  userStoriesText,
  onUserStoriesTextChange,
  userStoryTasks,
  onUserStoryTasksChange,
}: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserStoryIndexes, setSelectedUserStoryIndexes] = useState<number[]>([]);
  const [taskSuggestionLoadingByUserStory, setTaskSuggestionLoadingByUserStory] =
    useState<Record<number, boolean>>({});
  const [epicAttachment, setEpicAttachment] = useState<PlannerReferenceFile | null>(null);
  const epicFileRef = useRef<HTMLInputElement>(null);

  const parsed = parseStructuredBulk(userStoriesText);
  const userStories = parsed.filter((x) => x.level === 1);

  /** Strip epic title from first line if present; the epic name is already in the accordion header. */
  const stripEpicTitleFromText = (text: string): string => {
    const trimmed = text.trim();
    if (!trimmed || !epicName.trim()) return text;
    const firstLine = trimmed.split('\n')[0].trim();
    if (firstLine === epicName.trim()) {
      const rest = trimmed.slice(firstLine.length).trimStart();
      return rest.startsWith('\n\n') ? rest.slice(2) : rest;
    }
    return text;
  };

  const epicAttachmentPayload = toAttachmentPayload(epicAttachment);
  const attachmentForEpicAi = epicAttachmentPayload ?? plannerAttachment;

  const clearEpicFile = () => {
    setEpicAttachment(null);
    if (epicFileRef.current) epicFileRef.current.value = '';
  };

  const onEpicReferenceFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setEpicAttachment(null);
      return;
    }
    try {
      const data = await readPlannerReferenceFile(file);
      setEpicAttachment(data);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Invalid file');
      e.target.value = '';
    }
  };

  const handleGenerateUserStories = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await AiAgentService.plannerSuggestUserStoriesForEpic(
        epicName,
        { projectBrief, projectId, attachment: attachmentForEpicAi },
      );
      onUserStoriesTextChange(stripEpicTitleFromText(data.userStoriesText || ''));
    } catch (e: any) {
      Errors.handle(e);
      setError(e?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStorySelection = (userStoryIndex: number, checked: boolean) => {
    setSelectedUserStoryIndexes((prev) => {
      if (checked) {
        if (prev.includes(userStoryIndex)) return prev;
        return [...prev, userStoryIndex];
      }
      return prev.filter((idx) => idx !== userStoryIndex);
    });
  };

  const handleGenerateTasksForSelectedUserStories = async () => {
    if (!selectedUserStoryIndexes.length) return;
    setError(null);
    const failedUserStories: string[] = [];

    for (const usIdx of selectedUserStoryIndexes) {
      const userStory = userStories[usIdx];
      if (!userStory) continue;

      setTaskSuggestionLoadingByUserStory((prev) => ({ ...prev, [usIdx]: true }));
      try {
        const data = await AiAgentService.plannerSuggestTasksForUserStory(
          serializeUserStory(userStory),
          { projectBrief, epicName, projectId, attachment: attachmentForEpicAi },
        );
        const parsedFull = parseStructuredBulk(data.tasksText || '');
        const tasksOnly = parsedFull.filter((x) => x.level === 2);
        onUserStoryTasksChange({ [`${epicIndex}-${usIdx}`]: serializeTasksOnly(tasksOnly) });
      } catch (e: any) {
        Errors.handle(e);
        failedUserStories.push(userStory.title);
      } finally {
        setTaskSuggestionLoadingByUserStory((prev) => ({ ...prev, [usIdx]: false }));
      }
    }

    if (failedUserStories.length > 0) {
      setError(`Failed to suggest tasks for: ${failedUserStories.join(', ')}`);
    }
  };

  const isAnyTaskSuggestionLoading = Object.values(taskSuggestionLoadingByUserStory).some(Boolean);

  const collapseId = `epic-${epicIndex}`;

  return (
    <div className="accordion-item planner-level-0 border-0 mb-2">
      <h2 className="accordion-header">
        <button
          type="button"
          className={`accordion-button planner-epic-header ${expanded ? '' : 'collapsed'}`}
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-controls={collapseId}
        >
          <span className="fw-semibold">{epicName}</span>
          {userStories.length > 0 && (
            <span className="badge bg-secondary ms-2">{userStories.length} user stories</span>
          )}
        </button>
      </h2>
      <div
        id={collapseId}
        className={`accordion-collapse collapse ${expanded ? 'show' : ''}`}
      >
        <div className="accordion-body planner-epic-body">
          {/* Step 2: Panel to generate User Stories for this Epic */}
          <div className="mb-3">
            <label className="form-label small text-muted">2. User Stories (for this epic)</label>
            <div className="mb-2">
              <div className="d-flex flex-wrap align-items-end gap-2">
                <div className="flex-grow-1" style={{ minWidth: '200px' }}>
                  <label className="form-label small text-muted mb-0">
                    Optional PDF/image (this epic)
                  </label>
                  <input
                    ref={epicFileRef}
                    type="file"
                    accept="application/pdf,image/jpeg,image/png,image/gif,image/webp,.pdf"
                    className="form-control form-control-sm"
                    disabled={loading}
                    onChange={onEpicReferenceFile}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={loading || !epicName.trim()}
                  onClick={handleGenerateUserStories}
                >
                  <ButtonIcon loading={loading} iconClass="fas fa-magic" />
                  Generate User Stories
                </button>
              </div>
              {epicAttachment && (
                <div className="d-flex align-items-center flex-wrap gap-2 mt-1">
                  <span
                    className="small text-muted text-truncate"
                    style={{ maxWidth: '280px' }}
                    title={epicAttachment.name}
                  >
                    {epicAttachment.name}
                  </span>
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0"
                    onClick={clearEpicFile}
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
              rows={6}
              value={userStoriesText}
              onChange={(e) => onUserStoriesTextChange(e.target.value)}
              placeholder="- User Story lines with AC:. Generate or paste (epic title is in the header above)."
              disabled={loading}
            />
          </div>

          {/* Nested accordion: User Stories (each expandable → Generate Tasks, then Tasks with todos) */}
          {userStories.length > 0 && (
            <div className="planner-level-1 ms-2 border-start border-2 border-light ps-2">
              <div className="small text-muted mb-2">User stories (expand to generate tasks)</div>
              <button
                type="button"
                className="btn btn-primary btn-sm mb-2"
                disabled={selectedUserStoryIndexes.length === 0 || isAnyTaskSuggestionLoading}
                onClick={handleGenerateTasksForSelectedUserStories}
              >
                <ButtonIcon loading={isAnyTaskSuggestionLoading} iconClass="fas fa-magic" />
                Generate Task suggestions for selected User Stories ({selectedUserStoryIndexes.length})
              </button>
              {userStories.map((us, usIdx) => (
                <div key={usIdx} className="d-flex align-items-start gap-2">
                  <div className="pt-2" style={{ minWidth: '20px' }}>
                    {taskSuggestionLoadingByUserStory[usIdx] ? (
                      <span
                        className="spinner-border spinner-border-sm text-primary"
                        role="status"
                        aria-label={`Generating tasks for ${us.title}`}
                      />
                    ) : (
                      <input
                        type="checkbox"
                        id={`userstory-${epicIndex}-${usIdx}`}
                        className="form-check-input mt-1"
                        checked={selectedUserStoryIndexes.includes(usIdx)}
                        onChange={(e) => toggleUserStorySelection(usIdx, e.target.checked)}
                        disabled={isAnyTaskSuggestionLoading}
                      />
                    )}
                  </div>
                <UserStoryPanelOfProjectPlanner
                  epicIndex={epicIndex}
                  userStoryIndex={usIdx}
                  userStory={us}
                  projectId={projectId}
                  projectBrief={projectBrief}
                  epicName={epicName}
                  plannerAttachment={attachmentForEpicAi}
                  tasksText={userStoryTasks[`${epicIndex}-${usIdx}`] ?? ''}
                  onTasksTextChange={(text) =>
                    onUserStoryTasksChange({ [`${epicIndex}-${usIdx}`]: text })
                  }
                  serializeUserStoryText={() => serializeUserStory(us)}
                />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EpicPanelOfProjectPlanner;
