import { useState } from 'react';
import ButtonIcon from 'src/view/shared/ButtonIcon';
import AiAgentService from 'src/modules/aiAgent/aiAgentService';
import Errors from 'src/modules/shared/error/errors';
import { parseStructuredBulk } from '../structuredBulkParser';
import type { ParsedItem } from '../structuredBulkParser';
import { UserStoryPanelOfProjectPlanner } from './UserStoryPanelOfProjectPlanner';

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
  projectBrief: string;
  userStoriesText: string;
  onUserStoriesTextChange: (text: string) => void;
  userStoryTasks: Record<string, string>;
  onUserStoryTasksChange: (next: Record<string, string>) => void;
};

const EpicPanelOfProjectPlanner = ({
  epicIndex,
  epicName,
  projectBrief,
  userStoriesText,
  onUserStoriesTextChange,
  userStoryTasks,
  onUserStoryTasksChange,
}: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsed = parseStructuredBulk(userStoriesText);
  const userStories = parsed.filter((x) => x.level === 1);

  const handleGenerateUserStories = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await AiAgentService.plannerSuggestUserStoriesForEpic(
        epicName,
        { projectBrief },
      );
      onUserStoriesTextChange(data.userStoriesText || '');
    } catch (e: any) {
      Errors.handle(e);
      setError(e?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

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
            <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
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
            {error && (
              <div className="alert alert-danger py-2 small mb-2">{error}</div>
            )}
            <textarea
              className="form-control form-control-sm font-monospace small mb-2"
              rows={6}
              value={userStoriesText}
              onChange={(e) => onUserStoriesTextChange(e.target.value)}
              placeholder="Epic title then '- User Story' lines with AC:. Generate or paste."
              disabled={loading}
            />
          </div>

          {/* Nested accordion: User Stories (each expandable → Generate Tasks, then Tasks with todos) */}
          {userStories.length > 0 && (
            <div className="planner-level-1 ms-2 border-start border-2 border-light ps-2">
              <div className="small text-muted mb-2">User stories (expand to generate tasks)</div>
              {userStories.map((us, usIdx) => (
                <UserStoryPanelOfProjectPlanner
                  key={usIdx}
                  epicIndex={epicIndex}
                  userStoryIndex={usIdx}
                  userStory={us}
                  projectBrief={projectBrief}
                  epicName={epicName}
                  tasksText={userStoryTasks[`${epicIndex}-${usIdx}`] ?? ''}
                  onTasksTextChange={(text) =>
                    onUserStoryTasksChange({
                      ...userStoryTasks,
                      [`${epicIndex}-${usIdx}`]: text,
                    })
                  }
                  serializeUserStoryText={() => serializeUserStory(us)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EpicPanelOfProjectPlanner;
