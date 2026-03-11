import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { i18n } from 'src/i18n';
import TaskService from 'src/modules/task/taskService';
import Spinner from 'src/view/shared/Spinner';
import '../plannerHierarchy.css';

type TaskRecord = {
  id: string;
  key?: string;
  type?: string;
  title?: string;
  description?: string;
  parents?: Array<{ id?: string } | string>;
};

type TaskNode = {
  task: TaskRecord;
  children: TaskNode[];
};

function getParentIds(t: TaskRecord): string[] {
  const p = t.parents;
  if (!p || !p.length) return [];
  return p.map((first) =>
    typeof first === 'object' && first != null && 'id' in first && first.id != null
      ? String((first as { id: string }).id)
      : String(first),
  );
}

function buildTaskTree(tasks: TaskRecord[]): TaskNode[] {
  const childrenOf = new Map<string, TaskNode[]>();
  const roots: TaskNode[] = [];

  tasks.forEach((task) => {
    const node: TaskNode = { task, children: [] };
    const parentIds = getParentIds(task);
    if (parentIds.length === 0) {
      roots.push(node);
    } else {
      for (const parentId of parentIds) {
        const list = childrenOf.get(parentId) ?? [];
        list.push(node);
        childrenOf.set(parentId, list);
      }
    }
  });

  function attachChildren(node: TaskNode): TaskNode {
    node.children = (childrenOf.get(node.task.id) ?? []).map(attachChildren);
    return node;
  }

  return roots.map(attachChildren);
}

function TaskTreeNode({ node, depth }: { node: TaskNode; depth: number }) {
  const [open, setOpen] = useState(false);
  const { task, children } = node;
  const hasChildren = children.length > 0;
  const typeLabel = task.type || 'Task';

  return (
    <div className="mb-1">
      <details open={open} className="border rounded mb-1" style={{ marginLeft: depth * 16 }}>
        <summary
          className="d-flex align-items-center px-3 py-2 cursor-pointer list-unstyled"
          style={{
            backgroundColor: depth === 0 ? '#eef4fc' : depth === 1 ? '#eef4ee' : depth === 2 ? '#eef2f4' : '#f0f0f0',
          }}
          onClick={(e) => {
            if (!hasChildren) e.preventDefault();
            else setOpen((o) => !o);
          }}
        >
          <span className="badge bg-secondary me-2 small">{typeLabel}</span>
          <span className="me-2 small">
            <Link
              to={`/task/${task.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-decoration-none"
              onClick={(e) => e.stopPropagation()}
            >
              {task.key || task.id}
              <i className="fas fa-external-link-alt ms-1 small" aria-hidden />
            </Link>
          </span>
          <span className="flex-grow-1 fw-medium">{task.title || (task.key ? '' : task.id)}</span>
          {hasChildren && (
            <span className="small text-muted ms-2">{children.length} item{children.length !== 1 ? 's' : ''}</span>
          )}
        </summary>
        {hasChildren && (
          <div className="ps-2 pb-2 pt-0">
            {children.map((child) => (
              <TaskTreeNode key={child.task.id} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </details>
    </div>
  );
}

const ProjectPlanView = ({ projectId }: { projectId: string | undefined }) => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    TaskService.list({ project: projectId }, undefined, 500, 0)
      .then((res: { rows?: TaskRecord[] }) => {
        if (!cancelled) setTasks(res.rows ?? []);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? 'Failed to load tasks');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const tree = useMemo(() => buildTaskTree(tasks), [tasks]);

  if (!projectId) return null;

  if (loading) {
    return (
      <div className="mt-4">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 alert alert-danger">
        {error}
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h5 className="mb-3">
        <i className="fas fa-sitemap me-2" />
        {i18n('common.planner')} — {i18n('entities.task.menu')} ({tasks.length})
      </h5>
      {tree.length === 0 ? (
        <p className="text-muted">{i18n('table.noData')}</p>
      ) : (
        <div className="plan-tree">
          {tree.map((node) => (
            <TaskTreeNode key={node.task.id} node={node} depth={0} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectPlanView;
