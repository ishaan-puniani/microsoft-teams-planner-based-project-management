import { useState } from 'react';
import ButtonIcon from 'src/view/shared/ButtonIcon';
import AiAgentService from 'src/modules/aiAgent/aiAgentService';
import Errors from 'src/modules/shared/error/errors';
import type { ParsedItem } from '../structuredBulkParser';

type Props = {
  tasks: ParsedItem[];
  onTaskTodosChange?: (taskIndex: number, todos: string[]) => void;
  projectBrief?: string;
  userStoryTitle?: string;
};

const TaskPanelOfProjectPlanner = ({
  tasks,
  onTaskTodosChange,
  projectBrief,
  userStoryTitle,
}: Props) => {
  const [loadingTaskIndex, setLoadingTaskIndex] = useState<number | null>(null);

  const handleGenerateTodos = async (taskIndex: number) => {
    const t = tasks[taskIndex];
    if (!t || !onTaskTodosChange) return;
    setLoadingTaskIndex(taskIndex);
    try {
      const data = await AiAgentService.plannerSuggestTodosForTask(t.title, {
        taskDescription: t.description || undefined,
        projectBrief,
        userStoryTitle,
      });
      onTaskTodosChange(taskIndex, data.todos || []);
    } catch (e: any) {
      Errors.handle(e);
    } finally {
      setLoadingTaskIndex(null);
    }
  };

  return (
    <div className="planner-tasks-list">
      {tasks.map((t, idx) => (
        <details key={idx} className="planner-level-2-item border rounded mb-2">
          <summary className="planner-task-header px-3 py-2 d-flex align-items-center small">
            <span className="flex-grow-1">{t.title}</span>
            {t.todoChecklist.length > 0 && (
              <span className="badge bg-light text-dark ms-2">{t.todoChecklist.length} todos</span>
            )}
          </summary>
          <div className="planner-task-body px-3 pb-3 pt-0">
            {t.description && (
              <p className="small text-muted mb-2">{t.description}</p>
            )}

            {/* Panel to generate TODO list for this task */}
            {onTaskTodosChange && (
              <div className="mb-3">
                <div className="small text-muted mb-1">TODO list</div>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm mb-2"
                  disabled={loadingTaskIndex !== null}
                  onClick={() => handleGenerateTodos(idx)}
                >
                  <ButtonIcon
                    loading={loadingTaskIndex === idx}
                    iconClass="fas fa-list-check"
                  />
                  Generate TODOs
                </button>
              </div>
            )}

            {t.todoChecklist.length > 0 ? (
              <div className="planner-todo-panel rounded p-2">
                <ul className="list-group list-group-flush small mb-0 border-0">
                  {t.todoChecklist.map((item, i) => (
                    <li key={i} className="list-group-item py-2 px-2 d-flex align-items-center border-0 border-bottom bg-transparent">
                      <span className="form-check me-2 planner-todo-check">
                        <input type="checkbox" className="form-check-input" readOnly disabled />
                      </span>
                      <span className="flex-grow-1">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              onTaskTodosChange && (
                <span className="small text-muted">No todos yet. Use &quot;Generate TODOs&quot; above.</span>
              )
            )}
            {!onTaskTodosChange && t.todoChecklist.length === 0 && (
              <span className="small text-muted">No todos</span>
            )}
          </div>
        </details>
      ))}
    </div>
  );
};

export { TaskPanelOfProjectPlanner };
export default TaskPanelOfProjectPlanner;
