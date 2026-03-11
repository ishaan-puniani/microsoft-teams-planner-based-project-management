import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ReactGrid,
    Column,
    Row,
    HeaderCell,
    ChevronCell,
    TextCell,
    NumberCell,
    CellChange,
    Id,
    CellTemplate,
    Compatible,
    Uncertain,
    CellStyle,
} from '@silevis/reactgrid';
import '@silevis/reactgrid/styles.css';
import './ProjectTimePlanExcel.css';
import { i18n } from 'src/i18n';
import TaskService from 'src/modules/task/taskService';
import Spinner from 'src/view/shared/Spinner';
import Errors from 'src/modules/shared/error/errors';
import AiAgentService from 'src/modules/aiAgent/aiAgentService';
import { parseStructuredBulk } from '../structuredBulkParser';
import { generateTaskClientId } from '../taskIdUtils';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const ADD_COLUMN_ID = 'add';
const AI_COLUMN_ID = 'ai';
const DELETE_COLUMN_ID = 'delete';
const ROW_NUM_COLUMN_ID = 'rowNum';

type AiTarget = 'userstory' | 'task' | 'todo';

type DeleteButtonCell = {
    type: 'deleteButton';
    taskId: string;
    isDeleted: boolean;
};

function createDeleteButtonTemplate(
    onToggleDeleteRef: React.MutableRefObject<((taskId: string) => void) | null>,
): CellTemplate<DeleteButtonCell> {
    return {
        getCompatibleCell(uncertain: Uncertain<DeleteButtonCell>): Compatible<DeleteButtonCell> {
            return {
                ...uncertain,
                text: '',
                value: 0,
                taskId: uncertain.taskId ?? '',
                isDeleted: uncertain.isDeleted === true,
            } as Compatible<DeleteButtonCell>;
        },
        isFocusable: () => false,
        render(cell: Compatible<DeleteButtonCell>) {
            return (
                <button
                    type="button"
                    className={`btn btn-sm btn-link p-0 border-0 ${cell.isDeleted ? 'text-danger' : 'text-secondary'}`}
                    style={{ minWidth: 22 }}
                    title={cell.isDeleted ? 'Undo delete' : 'Mark for delete'}
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onToggleDeleteRef.current?.(cell.taskId);
                    }}
                >
                    <i className={cell.isDeleted ? 'fas fa-undo' : 'fas fa-trash-alt'} />
                </button>
            );
        },
    };
}

type RowNumberCell = {
    type: 'rowNumber';
    rowIndex: number;
    taskId: string;
    isDirty: boolean;
    style?: CellStyle;
};

function createRowNumberTemplate(
    onUndoRowRef: React.MutableRefObject<((taskId: string) => void) | null>,
): CellTemplate<RowNumberCell> {
    return {
        getCompatibleCell(uncertain: Uncertain<RowNumberCell>): Compatible<RowNumberCell> {
            return {
                ...uncertain,
                text: '',
                value: 0,
                rowIndex: uncertain.rowIndex ?? 0,
                taskId: uncertain.taskId ?? '',
                isDirty: uncertain.isDirty === true,
            } as Compatible<RowNumberCell>;
        },
        isFocusable: () => false,
        render(cell: Compatible<RowNumberCell>) {
            return (
                <div className="d-flex align-items-center justify-content-center gap-1 w-100 h-100">
                    <span className="text-muted small">{cell.rowIndex}</span>
                    {cell.isDirty && (
                        <button
                            type="button"
                            className="btn btn-sm btn-link p-0 border-0 text-danger"
                            style={{ minWidth: 18 }}
                            title="Undo row changes"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onUndoRowRef.current?.(cell.taskId);
                            }}
                        >
                            <i className="fas fa-exclamation" />
                        </button>
                    )}
                </div>
            );
        },
    };
}

type AddButtonCell = {
    type: 'addButton';
    taskId: string;
    addTarget?: 'userstory' | 'task';
    showRemove?: boolean;
};

type AiButtonCell = {
    type: 'aiButton';
    taskId: string;
    aiTarget?: AiTarget;
    aiLoading?: boolean;
};

function createAddButtonTemplate(
    onAddRef: React.MutableRefObject<((taskId: string, target: 'userstory' | 'task') => void) | null>,
    onRemoveRef: React.MutableRefObject<((taskId: string) => void) | null>,
): CellTemplate<AddButtonCell> {
    return {
        getCompatibleCell(uncertain: Uncertain<AddButtonCell>): Compatible<AddButtonCell> {
            return {
                ...uncertain,
                text: '',
                value: 0,
                taskId: uncertain.taskId ?? '',
                addTarget: uncertain.addTarget,
                showRemove: uncertain.showRemove === true,
            } as Compatible<AddButtonCell>;
        },
        isFocusable: () => false,
        render(cell: Compatible<AddButtonCell>) {
            return (
                <span className="d-inline-flex align-items-center gap-1">
                    {cell.addTarget != null && (
                        <button
                            type="button"
                            className="btn btn-sm btn-link p-0 text-secondary border-0"
                            style={{ minWidth: 22 }}
                            title={cell.addTarget === 'userstory' ? 'Add User Story' : 'Add Task'}
                            onClick={(e) => {
                                e.stopPropagation();
                                const target = cell.addTarget!;
                                onAddRef.current?.(cell.taskId, target);
                            }}
                        >
                            <i className="fas fa-plus" />
                        </button>
                    )}
                    {cell.showRemove && (
                        <button
                            type="button"
                            className="btn btn-sm btn-link p-0 text-danger border-0"
                            style={{ minWidth: 22 }}
                            title="Remove (local only)"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemoveRef.current?.(cell.taskId);
                            }}
                        >
                            <i className="fas fa-minus" />
                        </button>
                    )}
                </span>
            );
        },
    };
}

type TitleWithSpeechCell = {
    type: 'titleWithSpeech';
    taskId: string;
    text: string;
    style?: CellStyle;
};

function createTitleWithSpeechTemplate(
    getStateRef: React.MutableRefObject<() => { listening: boolean; dictatingForTaskId: string | null }>,
    onTitleChangeRef: React.MutableRefObject<((taskId: string, text: string) => void) | null>,
    onMicClickRef: React.MutableRefObject<((taskId: string) => void) | null>,
    browserSupportsSpeechRef: React.MutableRefObject<boolean>,
): CellTemplate<TitleWithSpeechCell> {
    return {
        getCompatibleCell(uncertain: Uncertain<TitleWithSpeechCell>): Compatible<TitleWithSpeechCell> {
            return {
                ...uncertain,
                text: uncertain.text ?? '',
                taskId: uncertain.taskId ?? '',
            } as Compatible<TitleWithSpeechCell>;
        },
        isFocusable: () => true,
        render(cell: Compatible<TitleWithSpeechCell>) {
            const state = getStateRef.current?.();
            const listening = state?.listening ?? false;
            const dictatingForTaskId = state?.dictatingForTaskId ?? null;
            const isDictatingThis = dictatingForTaskId === cell.taskId;
            const showMic = browserSupportsSpeechRef.current;

            return (
                <div
                    className="d-flex align-items-center gap-1 w-100 h-100"
                    style={{ minWidth: 0, ...(cell.style as React.CSSProperties) }}
                >
                    <input
                        type="text"
                        className="form-control form-control-sm border-0 bg-transparent h-100 flex-grow-1"
                        style={{ minWidth: 0 }}
                        value={cell.text}
                        onChange={(e) => onTitleChangeRef.current?.(cell.taskId, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        onKeyUp={(e) => e.stopPropagation()}
                        title="Title"
                    />
                    {showMic && (
                        <button
                            type="button"
                            className={`btn btn-sm btn-link p-0 border-0 flex-shrink-0 ${isDictatingThis && listening ? 'text-danger' : 'text-secondary'}`}
                            style={{ minWidth: 22 }}
                            title={listening && isDictatingThis ? 'Stop listening' : 'Dictate title (speech to text)'}
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onMicClickRef.current?.(cell.taskId);
                            }}
                        >
                            <i className={`fas fa-microphone${listening && isDictatingThis ? '-slash' : ''}`} />
                        </button>
                    )}
                </div>
            );
        },
    };
}

type KeyWithLinkCell = {
    type: 'keyWithLink';
    taskId: string;
    text: string;
    style?: CellStyle;
};

function createKeyWithLinkTemplate(): CellTemplate<KeyWithLinkCell> {
    return {
        getCompatibleCell(uncertain: Uncertain<KeyWithLinkCell>): Compatible<KeyWithLinkCell> {
            return {
                ...uncertain,
                text: uncertain.text ?? '',
                taskId: uncertain.taskId ?? '',
            } as Compatible<KeyWithLinkCell>;
        },
        isFocusable: () => false,
        render(cell: Compatible<KeyWithLinkCell>) {
            const href = `/task/${cell.taskId}`;
            return (
                <div
                    className="d-flex align-items-center gap-1 w-100 h-100"
                    style={{ minWidth: 0, ...(cell.style as React.CSSProperties) }}
                >
                    <span className="flex-grow-1 text-truncate" style={{ minWidth: 0 }}>
                        {cell.text}
                    </span>
                    <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-link p-0 border-0 flex-shrink-0 text-secondary"
                        style={{ minWidth: 22 }}
                        title="Open task in new tab"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <i className="fas fa-external-link-alt" />
                    </a>
                </div>
            );
        },
    };
}

function createAiButtonTemplate(
    onAiStarRef: React.MutableRefObject<((taskId: string, target: AiTarget) => void) | null>,
): CellTemplate<AiButtonCell> {
    return {
        getCompatibleCell(uncertain: Uncertain<AiButtonCell>): Compatible<AiButtonCell> {
            return {
                ...uncertain,
                text: '',
                value: 0,
                taskId: uncertain.taskId ?? '',
                aiTarget: uncertain.aiTarget,
                aiLoading: uncertain.aiLoading === true,
            } as Compatible<AiButtonCell>;
        },
        isFocusable: () => false,
        render(cell: Compatible<AiButtonCell>) {
            const aiTitle =
                cell.aiTarget === 'userstory'
                    ? 'Generate User Stories (AI)'
                    : cell.aiTarget === 'task'
                        ? 'Generate Tasks (AI)'
                        : cell.aiTarget === 'todo'
                            ? 'Generate Todos (AI)'
                            : '';
            if (cell.aiTarget == null) return <span />;
            return (
                <button
                    type="button"
                    className="btn btn-sm btn-link p-0 text-warning border-0"
                    style={{ minWidth: 22 }}
                    title={aiTitle}
                    disabled={cell.aiLoading}
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        try {
                            if (cell.aiTarget && onAiStarRef.current) {
                                onAiStarRef.current(cell.taskId, cell.aiTarget);
                            }
                        } catch (err) {
                            console.error('Star click error:', err);
                        }
                    }}
                >
                    {cell.aiLoading ? (
                        <i className="fas fa-spinner fa-spin" />
                    ) : (
                        <i className="fas fa-star" />
                    )}
                </button>
            );
        },
    };
}

type EstimatedTime = {
    atchitect?: number;
    developer?: number;
    tester?: number;
    businessAnalyst?: number;
    UX?: number;
    PM?: number;
};

type TaskRecord = {
    id: string;
    key?: string;
    type?: string;
    title?: string;
    storyPoints?: string;
    estimatedTime?: EstimatedTime;
    parents?: Array<{ id?: string } | string>;
};

type TaskNode = {
    task: TaskRecord;
    children: TaskNode[];
};

const COLUMN_IDS = [
    'type',
    'key',
    'title',
    'storyPoints',
    'architect',
    'developer',
    'tester',
    'businessAnalyst',
    'ux',
    'pm',
] as const;

const DEFAULT_COLUMN_WIDTHS: Record<string, number> = {
    [ROW_NUM_COLUMN_ID]: 44,
    [ADD_COLUMN_ID]: 36,
    [AI_COLUMN_ID]: 36,
    [DELETE_COLUMN_ID]: 36,
    type: 100,
    key: 100,
    title: 280,
    storyPoints: 100,
    architect: 100,
    developer: 100,
    tester: 100,
    businessAnalyst: 100,
    ux: 100,
    pm: 100,
};

const HEADERS = [
    'Type',
    'Key',
    'Title',
    'Story Points',
    'Architect',
    'Developer',
    'Tester',
    'Business Analyst',
    'UX',
    'PM',
];

const ESTIMATED_KEYS: (keyof EstimatedTime)[] = [
    'atchitect',
    'developer',
    'tester',
    'businessAnalyst',
    'UX',
    'PM',
];

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

function flattenTree(nodes: TaskNode[]): TaskRecord[] {
    const out: TaskRecord[] = [];
    function walk(ns: TaskNode[]) {
        for (const n of ns) {
            out.push(n.task);
            walk(n.children);
        }
    }
    walk(nodes);
    return out;
}

/** Collect task id and all descendant ids for a given task id; returns null if not found. */
function collectSubtreeIds(nodes: TaskNode[], targetId: string): Set<string> | null {
    const walk = (node: TaskNode, ids: Set<string>) => {
        ids.add(node.task.id);
        for (const c of node.children) walk(c, ids);
    };
    for (const n of nodes) {
        if (n.task.id === targetId) {
            const ids = new Set<string>();
            walk(n, ids);
            return ids;
        }
        const found = collectSubtreeIds(n.children, targetId);
        if (found) return found;
    }
    return null;
}

/** Returns visible nodes in tree order (respecting expanded state) with depth */
function getVisibleWithDepth(
    nodes: TaskNode[],
    expandedIds: Set<string>,
    parentExpanded: boolean,
    depth: number,
): { node: TaskNode; depth: number }[] {
    const out: { node: TaskNode; depth: number }[] = [];
    for (const n of nodes) {
        if (!parentExpanded) continue;
        out.push({ node: n, depth });
        const childExpanded = expandedIds.has(n.task.id);
        out.push(...getVisibleWithDepth(n.children, expandedIds, childExpanded, depth + 1));
    }
    return out;
}

const EPIC_ROW_BG = '#e3f2fd';
const USER_STORY_ROW_BG = '#f3e5f5';

function normalizeTaskType(type: string | undefined): string {
    if (!type) return '';
    return String(type).toLowerCase().replace(/\s+/g, ' ').trim();
}

function getRowBackground(type: string | undefined): string | undefined {
    if (!type) return undefined;
    const t = normalizeTaskType(type).replace(/\s/g, '_');
    if (t === 'epic') return EPIC_ROW_BG;
    if (t === 'user_story' || t === 'userstory') return USER_STORY_ROW_BG;
    return undefined;
}

function isEpicOrUserStory(type: string | undefined): boolean {
    if (!type) return false;
    const t = normalizeTaskType(type).replace(/\s/g, '_');
    return t === 'epic' || t === 'user_story' || t === 'userstory';
}

/** Sum of storyPoints (as number) and estimatedTime for all descendant tasks only (not this node). */
function sumDescendantEstimates(node: TaskNode): {
    storyPoints: number;
    estimatedTime: EstimatedTime;
} {
    let storyPoints = 0;
    const estimatedTime: EstimatedTime = {};
    const walk = (n: TaskNode) => {
        for (const child of n.children) {
            const sp = child.task.storyPoints;
            if (sp != null && sp !== '') {
                const num = Number(sp);
                if (!Number.isNaN(num)) storyPoints += num;
            }
            const et = child.task.estimatedTime;
            if (et) {
                ESTIMATED_KEYS.forEach((key) => {
                    const v = et[key];
                    if (typeof v === 'number' && !Number.isNaN(v)) {
                        (estimatedTime as Record<string, number>)[key] =
                            ((estimatedTime as Record<string, number>)[key] ?? 0) + v;
                    }
                });
            }
            walk(child);
        }
    };
    walk(node);
    return { storyPoints, estimatedTime };
}

type EstimatesLevel = 'tasks' | 'epics_and_stories' | 'all';

const ESTIMATES_LEVEL_OPTIONS: { value: EstimatesLevel; label: string }[] = [
    { value: 'tasks', label: 'Estimates On Tasks' },
    { value: 'epics_and_stories', label: 'Estimates On Epics and Stories' },
    { value: 'all', label: 'Estimates On Epics, Stories and Tasks' },
];

const ESTIMATES_STORAGE_KEY_PREFIX = 'projectTimePlanEstimates:';
const PENDING_TASKS_STORAGE_KEY_PREFIX = 'projectTimePlanPendingTasks:';

const PENDING_ID_PREFIX = 'pending-';

function isPendingId(id: string): boolean {
    return id.startsWith(PENDING_ID_PREFIX);
}

function makePendingId(): string {
    return `${PENDING_ID_PREFIX}${generateTaskClientId()}`;
}

type StoredEstimates = Record<string, { storyPoints?: string; estimatedTime?: EstimatedTime }>;

function getEstimatesStorageKey(projectId: string): string {
    return `${ESTIMATES_STORAGE_KEY_PREFIX}${projectId}`;
}

function loadEstimatesFromStorage(projectId: string): StoredEstimates {
    try {
        const raw = localStorage.getItem(getEstimatesStorageKey(projectId));
        if (!raw) return {};
        const parsed = JSON.parse(raw) as StoredEstimates;
        return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch {
        return {};
    }
}

function saveEstimatesToStorage(projectId: string, tasks: TaskRecord[]): void {
    const data: StoredEstimates = {};
    for (const t of tasks) {
        data[t.id] = {
            storyPoints: t.storyPoints,
            estimatedTime:
                t.estimatedTime && Object.keys(t.estimatedTime).length > 0 ? t.estimatedTime : undefined,
        };
    }
    try {
        localStorage.setItem(getEstimatesStorageKey(projectId), JSON.stringify(data));
    } catch {
        // ignore quota / privacy errors
    }
}

function clearEstimatesStorage(projectId: string): void {
    try {
        localStorage.removeItem(getEstimatesStorageKey(projectId));
    } catch {
        // ignore
    }
}

function getPendingStorageKey(projectId: string): string {
    return `${PENDING_TASKS_STORAGE_KEY_PREFIX}${projectId}`;
}

function loadPendingFromStorage(projectId: string): TaskRecord[] {
    try {
        const raw = localStorage.getItem(getPendingStorageKey(projectId));
        if (!raw) return [];
        const parsed = JSON.parse(raw) as TaskRecord[];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function savePendingToStorage(projectId: string, pending: TaskRecord[]): void {
    try {
        localStorage.setItem(
            getPendingStorageKey(projectId),
            JSON.stringify(pending),
        );
    } catch {
        // ignore
    }
}

function clearPendingStorage(projectId: string): void {
    try {
        localStorage.removeItem(getPendingStorageKey(projectId));
    } catch {
        // ignore
    }
}

function mergeEstimatesIntoTasks(
    tasks: TaskRecord[],
    stored: StoredEstimates,
): TaskRecord[] {
    if (!Object.keys(stored).length) return tasks;
    return tasks.map((t) => {
        const s = stored[t.id];
        if (!s) return t;
        return {
            ...t,
            storyPoints: s.storyPoints !== undefined ? s.storyPoints : t.storyPoints,
            estimatedTime:
                s.estimatedTime !== undefined ? s.estimatedTime : t.estimatedTime,
        };
    });
}

const ProjectTimePlanExcel = ({ projectId }: { projectId: string | undefined }) => {
    const [loading, setLoading] = useState(true);
    const [tasks, setTasks] = useState<TaskRecord[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
    const [dirtyTaskIds, setDirtyTaskIds] = useState<Set<string>>(() => new Set());
    const [deletedTaskIds, setDeletedTaskIds] = useState<Set<string>>(() => new Set());
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => ({ ...DEFAULT_COLUMN_WIDTHS }));
    const [aiLoadingTaskId, setAiLoadingTaskId] = useState<string | null>(null);
    const [dictatingForTaskId, setDictatingForTaskId] = useState<string | null>(null);
    const [estimatesLevel, setEstimatesLevel] = useState<EstimatesLevel>('tasks');

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition,
    } = useSpeechRecognition();

    const onAddChildRef = useRef<((taskId: string, target: 'userstory' | 'task') => void) | null>(null);
    const onRemoveRef = useRef<((taskId: string) => void) | null>(null);
    const onAiStarRef = useRef<((taskId: string, target: AiTarget) => void) | null>(null);
    const onToggleDeleteRef = useRef<((taskId: string) => void) | null>(null);
    const onUndoRowRef = useRef<((taskId: string) => void) | null>(null);
    const lastSavedTasksRef = useRef<Map<string, TaskRecord>>(new Map());
    const getSpeechStateRef = useRef<() => { listening: boolean; dictatingForTaskId: string | null }>(() => ({
        listening: false,
        dictatingForTaskId: null,
    }));
    const onTitleChangeRef = useRef<((taskId: string, text: string) => void) | null>(null);
    const onMicClickRef = useRef<((taskId: string) => void) | null>(null);
    const browserSupportsSpeechRef = useRef(false);
    browserSupportsSpeechRef.current = browserSupportsSpeechRecognition;
    const tasksRef = useRef<TaskRecord[]>([]);
    tasksRef.current = tasks;

    getSpeechStateRef.current = () => ({ listening, dictatingForTaskId });

    useEffect(() => {
        if (!listening && dictatingForTaskId != null && transcript.trim()) {
            const taskId = dictatingForTaskId;
            const newTitle = transcript.trim() || undefined;
            setTasks((prev) => {
                const next = prev.map((t) =>
                    t.id === taskId ? { ...t, title: newTitle } : t,
                );
                if (projectId) {
                    saveEstimatesToStorage(projectId, next);
                    const pending = next.filter((t) => isPendingId(t.id));
                    if (pending.length > 0) savePendingToStorage(projectId, pending);
                }
                return next;
            });
            setDirtyTaskIds((prev) => new Set(prev).add(taskId));
            setDictatingForTaskId(null);
            resetTranscript();
        }
    }, [listening, dictatingForTaskId, transcript, projectId, resetTranscript]);

    const handleMicClick = useCallback((taskId: string) => {
        if (listening) {
            if (dictatingForTaskId === taskId) {
                SpeechRecognition.stopListening();
            }
            return;
        }
        setDictatingForTaskId(taskId);
        resetTranscript();
        SpeechRecognition.startListening({ continuous: false, language: 'en-US' });
    }, [listening, dictatingForTaskId, resetTranscript]);

    const handleTitleChange = useCallback((taskId: string, text: string) => {
        setTasks((prev) => {
            const next = prev.map((t) =>
                t.id === taskId ? { ...t, title: text || undefined } : t,
            );
            if (projectId) {
                saveEstimatesToStorage(projectId, next);
                const pending = next.filter((t) => isPendingId(t.id));
                if (pending.length > 0) savePendingToStorage(projectId, pending);
            }
            return next;
        });
        setDirtyTaskIds((prev) => new Set(prev).add(taskId));
    }, [projectId]);

    useEffect(() => {
        onTitleChangeRef.current = handleTitleChange;
        onMicClickRef.current = handleMicClick;
    });

    const loadTasks = useCallback(() => {
        if (!projectId) return;
        setLoading(true);
        setError(null);
        TaskService.list({ project: projectId } , undefined, 500, 0)
            .then((res: { rows?: TaskRecord[] }) => {
                const rows = res.rows ?? [];
                const stored = loadEstimatesFromStorage(projectId);
                const merged = mergeEstimatesIntoTasks(rows, stored);
                const pending = loadPendingFromStorage(projectId);
                const allTasks = [...merged, ...pending];
                lastSavedTasksRef.current = new Map(allTasks.map((t) => [t.id, { ...t }]));
                setTasks(allTasks);
                setDirtyTaskIds(new Set());
                setDeletedTaskIds(new Set());
                const tree = buildTaskTree(allTasks);
                const idsWithChildren = new Set<string>();
                const collectParentIds = (ns: TaskNode[]) => {
                    for (const n of ns) {
                        if (n.children.length > 0) idsWithChildren.add(n.task.id);
                        collectParentIds(n.children);
                    }
                };
                collectParentIds(tree);
                setExpandedIds(idsWithChildren);
            })
            .catch((e) => setError((e as Error)?.message ?? 'Failed to load tasks'))
            .finally(() => setLoading(false));
    }, [projectId]);

    useEffect(() => {
        if (!projectId) return;
        let cancelled = false;
        setLoading(true);
        setError(null);
        TaskService.list({ project: projectId }, undefined, 500, 0)
            .then((res: { rows?: TaskRecord[] }) => {
                if (!cancelled) {
                    const rows = res.rows ?? [];
                    const stored = loadEstimatesFromStorage(projectId);
                    const merged = mergeEstimatesIntoTasks(rows, stored);
                    const pending = loadPendingFromStorage(projectId);
                    const allTasks = [...merged, ...pending];
                    lastSavedTasksRef.current = new Map(allTasks.map((t) => [t.id, { ...t }]));
                    setTasks(allTasks);
                    setDirtyTaskIds(new Set());
                    setDeletedTaskIds(new Set());
                    const tree = buildTaskTree(allTasks);
                    const idsWithChildren = new Set<string>();
                    const collectParentIds = (ns: TaskNode[]) => {
                        for (const n of ns) {
                            if (n.children.length > 0) idsWithChildren.add(n.task.id);
                            collectParentIds(n.children);
                        }
                    };
                    collectParentIds(tree);
                    setExpandedIds(idsWithChildren);
                }
            })
            .catch((e) => {
                if (!cancelled) setError((e as Error)?.message ?? 'Failed to load tasks');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [projectId]);

    const handleUndoRow = useCallback(
        (taskId: string) => {
            const saved = lastSavedTasksRef.current.get(taskId);
            if (saved == null) return;
            setTasks((prev) => {
                const next = prev.map((t) => (t.id === taskId ? { ...saved } : t));
                if (projectId) {
                    saveEstimatesToStorage(projectId, next);
                    const pending = next.filter((t) => isPendingId(t.id));
                    if (pending.length > 0) savePendingToStorage(projectId, pending);
                }
                return next;
            });
            setDirtyTaskIds((prev) => {
                const next = new Set(prev);
                next.delete(taskId);
                return next;
            });
        },
        [projectId],
    );

    const handleAddEpic = useCallback(() => {
        if (!projectId) return;
        const newTask: TaskRecord = {
            id: makePendingId(),
            type: 'EPIC',
            title: 'New Epic',
        };
        lastSavedTasksRef.current.set(newTask.id, { ...newTask });
        setTasks((prev) => {
            const next = [...prev, newTask];
            savePendingToStorage(projectId, next.filter((t) => isPendingId(t.id)));
            return next;
        });
    }, [projectId]);

    const handleAddChild = useCallback(
        (parentId: string, target: 'userstory' | 'task') => {
            if (!projectId) return;
            const type = target === 'userstory' ? 'USER_STORY' : 'TASK';
            const title = target === 'userstory' ? 'New User Story' : 'New Task';
            const newTask: TaskRecord = {
                id: makePendingId(),
                type,
                title,
                parents: [parentId],
            };
            lastSavedTasksRef.current.set(newTask.id, { ...newTask });
            setExpandedIds((prev) => new Set(prev).add(parentId));
            setTasks((prev) => {
                const next = [...prev, newTask];
                savePendingToStorage(projectId, next.filter((t) => isPendingId(t.id)));
                return next;
            });
        },
        [projectId],
    );

    const handleRemovePending = useCallback(
        (taskId: string) => {
            if (!projectId) return;
            setTasks((prev) => {
                const tree = buildTaskTree(prev);
                const toRemove = collectSubtreeIds(tree, taskId) ?? new Set([taskId]);
                const next = prev.filter((t) => !toRemove.has(t.id));
                const pending = next.filter((t) => isPendingId(t.id));
                savePendingToStorage(projectId, pending);
                return next;
            });
        },
        [projectId],
    );

    useEffect(() => {
        onAddChildRef.current = handleAddChild;
    }, [handleAddChild]);
    useEffect(() => {
        onRemoveRef.current = handleRemovePending;
    }, [handleRemovePending]);

    const handleAiStar = useCallback(
        async (taskId: string, target: AiTarget) => {
            const task = tasksRef.current.find((t) => t.id === taskId);
            if (!task || !projectId) return;
            const title = String(task.title ?? '').trim() || '';
            setAiLoadingTaskId(taskId);
            setError(null);
            try {
                if (target === 'userstory') {
                    const data = await AiAgentService.plannerSuggestUserStoriesForEpic(title, {});
                    const text = typeof data?.userStoriesText === 'string' ? data.userStoriesText : '';
                    const parsed = parseStructuredBulk(text);
                    const userStoryItems = Array.isArray(parsed) ? parsed.filter((p) => p && p.level === 1) : [];
                    const newTasks: TaskRecord[] = userStoryItems.map((item) => ({
                        id: makePendingId(),
                        type: 'USER_STORY',
                        title: String(item?.title ?? 'User Story').trim() || 'User Story',
                        parents: [taskId],
                    }));
                    setExpandedIds((prev) => new Set(prev).add(taskId));
                    setTasks((prev) => {
                        const next = [...prev, ...newTasks];
                        savePendingToStorage(projectId, next.filter((t) => isPendingId(t.id)));
                        return next;
                    });
                } else if (target === 'task') {
                    const data = await AiAgentService.plannerSuggestTasksForUserStory(title, {});
                    const text = typeof data?.tasksText === 'string' ? data.tasksText : '';
                    const parsed = parseStructuredBulk(text);
                    const taskItems = Array.isArray(parsed) ? parsed.filter((p) => p && p.level === 2) : [];
                    const newTasks: TaskRecord[] = taskItems.map((item) => ({
                        id: makePendingId(),
                        type: 'TASK',
                        title: String(item?.title ?? 'Task').trim() || 'Task',
                        parents: [taskId],
                    }));
                    setExpandedIds((prev) => new Set(prev).add(taskId));
                    setTasks((prev) => {
                        const next = [...prev, ...newTasks];
                        savePendingToStorage(projectId, next.filter((t) => isPendingId(t.id)));
                        return next;
                    });
                } else {
                    const data = await AiAgentService.plannerSuggestTodosForTask(title, {});
                    const rawTodos = data?.todos;
                    const todoItems = Array.isArray(rawTodos) ? rawTodos : [];
                    const newTasks: TaskRecord[] = todoItems
                        .map((t) => String(t ?? '').trim())
                        .filter(Boolean)
                        .map((todoTitle) => ({
                            id: makePendingId(),
                            type: 'TASK',
                            title: todoTitle,
                            parents: [taskId],
                        }));
                    if (newTasks.length > 0) {
                        setExpandedIds((prev) => new Set(prev).add(taskId));
                        setTasks((prev) => {
                            const next = [...prev, ...newTasks];
                            savePendingToStorage(projectId, next.filter((t) => isPendingId(t.id)));
                            return next;
                        });
                    }
                }
            } catch (e) {
                Errors.handle(e);
                setError((e as Error)?.message ?? 'AI request failed');
            } finally {
                setAiLoadingTaskId(null);
            }
        },
        [projectId],
    );

    useEffect(() => {
        onAiStarRef.current = handleAiStar;
    }, [handleAiStar]);

    const handleToggleDelete = useCallback((taskId: string) => {
        setDeletedTaskIds((prev) => {
            const next = new Set(prev);
            if (next.has(taskId)) next.delete(taskId);
            else next.add(taskId);
            return next;
        });
    }, []);

    useEffect(() => {
        onToggleDeleteRef.current = handleToggleDelete;
    }, [handleToggleDelete]);

    useEffect(() => {
        onUndoRowRef.current = handleUndoRow;
    }, [handleUndoRow]);

    const addButtonTemplate = useMemo(
        () => createAddButtonTemplate(onAddChildRef, onRemoveRef),
        [],
    );
    const aiButtonTemplate = useMemo(
        () => createAiButtonTemplate(onAiStarRef),
        [],
    );
    const deleteButtonTemplate = useMemo(
        () => createDeleteButtonTemplate(onToggleDeleteRef),
        [],
    );
    const rowNumberTemplate = useMemo(() => createRowNumberTemplate(onUndoRowRef), []);
    const titleWithSpeechTemplate = useMemo(
        () =>
            createTitleWithSpeechTemplate(
                getSpeechStateRef,
                onTitleChangeRef,
                onMicClickRef,
                browserSupportsSpeechRef,
            ),
        [],
    );
    const keyWithLinkTemplate = useMemo(() => createKeyWithLinkTemplate(), []);

    const columns = useMemo<Column[]>(
        () => [
            { columnId: ROW_NUM_COLUMN_ID, width: columnWidths[ROW_NUM_COLUMN_ID] ?? 44, resizable: false },
            { columnId: ADD_COLUMN_ID, width: columnWidths[ADD_COLUMN_ID] ?? 36, resizable: false },
            { columnId: AI_COLUMN_ID, width: columnWidths[AI_COLUMN_ID] ?? 36, resizable: false },
            { columnId: DELETE_COLUMN_ID, width: columnWidths[DELETE_COLUMN_ID] ?? 36, resizable: false },
            ...COLUMN_IDS.map((id) => ({
                columnId: id,
                width: columnWidths[id] ?? DEFAULT_COLUMN_WIDTHS[id],
                resizable: true as const,
            })),
        ],
        [columnWidths],
    );

    const handleColumnResized = useCallback((columnId: Id, width: number) => {
        setColumnWidths((prev) => ({ ...prev, [String(columnId)]: width }));
    }, []);

    const tree = useMemo(() => buildTaskTree(tasks), [tasks]);
    const visibleRowsData = useMemo(
        () => getVisibleWithDepth(tree, expandedIds, true, 0),
        [tree, expandedIds],
    );
    const taskOrderForSave = useMemo(() => flattenTree(tree), [tree]);

    const rows = useMemo(() => {
        const headerRow: Row = {
            rowId: 'header',
            cells: [
                { type: 'header', text: '#' } as HeaderCell,
                { type: 'header', text: '' } as HeaderCell,
                { type: 'header', text: '' } as HeaderCell,
                { type: 'header', text: '' } as HeaderCell,
                ...HEADERS.map(
                    (text): HeaderCell => ({
                        type: 'header',
                        text,
                    }),
                ),
            ],
        };

        const rowBg = (task: TaskRecord) => getRowBackground(task.type);
        const cellStyle = (task: TaskRecord, deleted?: boolean) => {
            const bg = rowBg(task);
            const base = bg ? { style: { background: bg } as React.CSSProperties } : { style: {} as React.CSSProperties };
            if (deleted) {
                base.style = { ...base.style, textDecoration: 'line-through', opacity: 0.65 };
            }
            return base;
        };

        const showDescendantTotalsForParent = estimatesLevel === 'tasks';
        const estimateEditableForParent = estimatesLevel === 'epics_and_stories' || estimatesLevel === 'all';
        const estimateEditableForTask = estimatesLevel === 'tasks' || estimatesLevel === 'all';

        const dataRows = visibleRowsData.map(({ node, depth }, rowIndex) => {
            const { task } = node;
            const isDeleted = deletedTaskIds.has(task.id);
            const isDirty = dirtyTaskIds.has(task.id);
            const isParentType = isEpicOrUserStory(task.type);
            const descendantTotals = isParentType ? sumDescendantEstimates(node) : null;
            const useOwnEstimates = !isParentType || !showDescendantTotalsForParent;
            const et = useOwnEstimates
                ? (task.estimatedTime || {})
                : (descendantTotals?.estimatedTime ?? {});
            const storyPointsDisplay = useOwnEstimates
                ? (task.storyPoints ?? '')
                : (descendantTotals && descendantTotals.storyPoints > 0 ? String(descendantTotals.storyPoints) : '');
            const hasChildren = node.children.length > 0;
            const isExpanded = expandedIds.has(task.id);
            const parentId = getParentIds(task)[0] as Id | undefined;
            const estimateCellProps = isParentType
                ? (estimateEditableForParent ? {} : { nonEditable: true as const })
                : (estimateEditableForTask ? {} : { nonEditable: true as const });
            const normalizedType = normalizeTaskType(task.type).replace(/\s/g, '_');
            const isPending = isPendingId(task.id);
            const aiLoading = aiLoadingTaskId === task.id;
            const rowNumCell: RowNumberCell = {
                type: 'rowNumber',
                rowIndex: rowIndex + 1,
                taskId: task.id,
                isDirty,
            };
      const addCell: AddButtonCell | TextCell =
        normalizedType === 'epic'
          ? ({ type: 'addButton', taskId: task.id, addTarget: 'userstory' as const, showRemove: isPending } as AddButtonCell)
          : (normalizedType === 'user_story' || normalizedType === 'userstory')
            ? ({ type: 'addButton', taskId: task.id, addTarget: 'task' as const, showRemove: isPending } as AddButtonCell)
            : isPending
              ? ({ type: 'addButton', taskId: task.id, showRemove: true } as AddButtonCell)
              : ({ type: 'text', text: '', nonEditable: true } as TextCell);
      const aiCell: AiButtonCell = (
        normalizedType === 'epic'
          ? { type: 'aiButton', taskId: task.id, aiTarget: 'userstory' as const, aiLoading }
          : (normalizedType === 'user_story' || normalizedType === 'userstory')
            ? { type: 'aiButton', taskId: task.id, aiTarget: 'task' as const, aiLoading }
            : isPending
              ? { type: 'aiButton', taskId: task.id }
              : { type: 'aiButton', taskId: task.id, aiTarget: 'todo' as const, aiLoading }
      ) as AiButtonCell;
      const deleteCell: DeleteButtonCell = {
        type: 'deleteButton',
        taskId: task.id,
        isDeleted,
      };

      return {
        rowId: task.id,
        cells: [
          rowNumCell,
          addCell,
          aiCell,
          deleteCell,
                    {
                        type: 'chevron',
                        text: task.type ?? '',
                        hasChildren,
                        isExpanded: hasChildren ? isExpanded : undefined,
                        parentId,
                        indent: depth,
                        ...cellStyle(task, isDeleted),
                    } as ChevronCell,
                    {
                        type: 'keyWithLink',
                        taskId: task.id,
                        text: task.key ?? '',
                        ...cellStyle(task, isDeleted),
                    } as KeyWithLinkCell,
                    {
                        type: 'titleWithSpeech',
                        taskId: task.id,
                        text: task.title ?? '',
                        ...cellStyle(task, isDeleted),
                    } as TitleWithSpeechCell,
                    {
                        type: 'text',
                        text: storyPointsDisplay,
                        ...cellStyle(task, isDeleted),
                        ...estimateCellProps,
                    } as TextCell,
                    {
                        type: 'number',
                        value: et.atchitect ?? NaN,
                        ...cellStyle(task, isDeleted),
                        ...estimateCellProps,
                    } as NumberCell,
                    {
                        type: 'number',
                        value: et.developer ?? NaN,
                        ...cellStyle(task, isDeleted),
                        ...estimateCellProps,
                    } as NumberCell,
                    {
                        type: 'number',
                        value: et.tester ?? NaN,
                        ...cellStyle(task, isDeleted),
                        ...estimateCellProps,
                    } as NumberCell,
                    {
                        type: 'number',
                        value: et.businessAnalyst ?? NaN,
                        ...cellStyle(task, isDeleted),
                        ...estimateCellProps,
                    } as NumberCell,
                    {
                        type: 'number',
                        value: et.UX ?? NaN,
                        ...cellStyle(task, isDeleted),
                        ...estimateCellProps,
                    } as NumberCell,
                    {
                        type: 'number',
                        value: et.PM ?? NaN,
                        ...cellStyle(task, isDeleted),
                        ...estimateCellProps,
                    } as NumberCell,
                ],
            };
        });

        return [headerRow, ...dataRows] as Row[];
    }, [visibleRowsData, expandedIds, aiLoadingTaskId, deletedTaskIds, dirtyTaskIds, estimatesLevel]);

    const handleCellsChanged = useCallback(
        (changes: CellChange[]) => {
            const chevronToggles: string[] = [];
            for (const ch of changes) {
                if (ch.type === 'chevron' && 'isExpanded' in ch.newCell) {
                    chevronToggles.push(ch.rowId as string);
                }
            }
            if (chevronToggles.length > 0) {
                setExpandedIds((set) => {
                    const nextSet = new Set(set);
                    for (const id of chevronToggles) {
                        if (nextSet.has(id)) nextSet.delete(id);
                        else nextSet.add(id);
                    }
                    return nextSet;
                });
            }

            const taskChanges = changes.filter((ch) => ch.type !== 'chevron');
            if (taskChanges.length === 0) return;

            setTasks((prev) => {
                const next = prev.map((t) => ({
                    ...t,
                    estimatedTime: t.estimatedTime ? { ...t.estimatedTime } : undefined,
                }));
                const byId = new Map(next.map((t) => [t.id, t]));
                for (const ch of taskChanges) {
                    const task = byId.get(ch.rowId as string);
                    if (!task) continue;
                    const isParentType = isEpicOrUserStory(task.type);
                    const allowEstimateEdit = estimatesLevel === 'all'
                        || (estimatesLevel === 'tasks' && !isParentType)
                        || (estimatesLevel === 'epics_and_stories' && isParentType);
                    if (ch.type === 'text' && 'text' in ch.newCell) {
                        const text = ch.newCell.text?.trim() ?? '';
                        if (ch.columnId === 'title') {
                            task.title = text || undefined;
                        } else if (ch.columnId === 'key') {
                            task.key = text || undefined;
                        } else if (ch.columnId === 'storyPoints' && allowEstimateEdit) {
                            task.storyPoints = text || undefined;
                        }
                    }
                    if (ch.type === 'number' && 'value' in ch.newCell && allowEstimateEdit) {
                        const idx = COLUMN_IDS.indexOf(ch.columnId as (typeof COLUMN_IDS)[number]);
                        if (idx >= 4 && idx <= 9) {
                            const key = ESTIMATED_KEYS[idx - 4];
                            const v = ch.newCell.value;
                            task.estimatedTime = task.estimatedTime ?? {};
                            if (v !== undefined && !Number.isNaN(v))
                                (task.estimatedTime as Record<string, number>)[key] = v;
                            else delete (task.estimatedTime as Record<string, unknown>)[key];
                        }
                    }
                }
                if (projectId) {
                    saveEstimatesToStorage(projectId, next);
                    const pending = next.filter((t) => isPendingId(t.id));
                    if (pending.length > 0) savePendingToStorage(projectId, pending);
                }
                return next;
            });
            const modifiedRowIds = Array.from(new Set(taskChanges.map((ch) => ch.rowId as string)));
            setDirtyTaskIds((prev) => {
                const next = new Set(prev);
                modifiedRowIds.forEach((id) => next.add(id));
                return next;
            });
        },
        [projectId, estimatesLevel],
    );

    const handleSave = useCallback(async () => {
        if (!projectId || !taskOrderForSave.length) return;
        setSaving(true);
        try {
            const pendingOrdered = taskOrderForSave.filter(
                (t) => isPendingId(t.id) && !deletedTaskIds.has(t.id),
            );
            const newTasks = pendingOrdered.map((task) => {
                const parentIds = getParentIds(task);
                const parentId = parentIds[0];
                const isParentPending = parentId != null && isPendingId(parentId);
                const item: {
                    tempId: string;
                    type: string;
                    title: string;
                    storyPoints?: string;
                    estimatedTime?: Record<string, number>;
                    parentTempId?: string;
                    parentId?: string;
                } = {
                    tempId: task.id,
                    type: task.type ?? 'TASK',
                    title: task.title ?? 'New Task',
                    storyPoints: task.storyPoints,
                    estimatedTime:
                        task.estimatedTime && Object.keys(task.estimatedTime).length > 0
                            ? task.estimatedTime
                            : undefined,
                };
                if (isParentPending) item.parentTempId = parentId;
                else if (parentId) item.parentId = parentId;
                return item;
            });

            const existingTasks = taskOrderForSave.filter((t) => !isPendingId(t.id));
            const dirtyExisting = existingTasks.filter(
                (task) => dirtyTaskIds.has(task.id) && !deletedTaskIds.has(task.id),
            );
            const includeEstimatesForTask = (t: TaskRecord) =>
                estimatesLevel === 'all'
                || (estimatesLevel === 'tasks' && !isEpicOrUserStory(t.type))
                || (estimatesLevel === 'epics_and_stories' && isEpicOrUserStory(t.type));
            const updates = dirtyExisting.map((task) => {
                const base: { id: string; title?: string; storyPoints?: string; estimatedTime?: Record<string, number> } = {
                    id: task.id,
                    title: task.title,
                };
                if (includeEstimatesForTask(task)) {
                    base.storyPoints = task.storyPoints;
                    base.estimatedTime =
                        task.estimatedTime && Object.keys(task.estimatedTime).length > 0
                            ? task.estimatedTime
                            : undefined;
                }
                return base;
            });

            const deleteTasks = Array.from(deletedTaskIds).filter((id) => !isPendingId(id));

            await TaskService.savePlan({
                projectId,
                newTasks,
                updates,
                deleteTasks,
            });
            setDirtyTaskIds(new Set());
            setDeletedTaskIds(new Set());
            clearEstimatesStorage(projectId);
            clearPendingStorage(projectId);
            loadTasks();
        } catch (e) {
            setError((e as Error)?.message ?? 'Failed to save');
        } finally {
            setSaving(false);
        }
    }, [projectId, taskOrderForSave, dirtyTaskIds, deletedTaskIds, loadTasks, estimatesLevel]);

    if (!projectId) return null;
    if (loading) return <Spinner />;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="mt-4">
            <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                <h5 className="mb-0">
                    <i className="fas fa-table me-2" />
                    {i18n('common.planner')} — Time plan (Epic / User Story / Task)
                </h5>
                <div>
                    <select
                        className="form-select form-select-sm"
                        value={estimatesLevel}
                        onChange={(e) => setEstimatesLevel(e.target.value as EstimatesLevel)}
                    >
                        {ESTIMATES_LEVEL_OPTIONS.map(({ value, label }) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <button
                        type="button"
                        className="btn btn-outline-success btn-sm"
                        disabled={loading}
                        onClick={handleAddEpic}
                        title="Add new Epic"
                    >
                        <i className="fas fa-plus me-1" />
                        Add Epic
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        disabled={saving || !tasks.length}
                        onClick={handleSave}
                    >
                        {saving ? <i className="fas fa-spinner fa-spin me-1" /> : <i className="fas fa-save me-1" />}
                        {saving ? 'Saving…' : `Save changes${dirtyTaskIds.size > 0 ? ` (${dirtyTaskIds.size})` : ''}`}
                    </button>
                </div>
            </div>
            <div
                className="border rounded reactgrid-wrapper"
                style={{
                    height: 'calc(100vh - 280px)',
                    minHeight: 0,
                    overflow: 'auto',
                    position: 'relative',
                }}
            >
                <ReactGrid
                    columns={columns}
                    rows={rows}
                    onCellsChanged={handleCellsChanged}
                    onColumnResized={handleColumnResized}
                    enableRangeSelection
                    enableColumnResizeOnAllHeaders
                    stickyTopRows={1}
                    customCellTemplates={{
                        rowNumber: rowNumberTemplate,
                        addButton: addButtonTemplate,
                        aiButton: aiButtonTemplate,
                        deleteButton: deleteButtonTemplate,
                        keyWithLink: keyWithLinkTemplate,
                        titleWithSpeech: titleWithSpeechTemplate,
                    }}
                />
            </div>
            <div>
                <div className="d-flex align-items-center gap-2">
                    <button
                        type="button"
                        className="btn btn-outline-success btn-sm"
                        disabled={loading}
                        onClick={handleAddEpic}
                        title="Add new Epic"
                    >
                        <i className="fas fa-plus me-1" />
                        Add Epic
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        disabled={saving || !tasks.length}
                        onClick={handleSave}
                    >
                        {saving ? <i className="fas fa-spinner fa-spin me-1" /> : <i className="fas fa-save me-1" />}
                        {saving ? 'Saving…' : `Save changes${dirtyTaskIds.size > 0 ? ` (${dirtyTaskIds.size})` : ''}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProjectTimePlanExcel;
