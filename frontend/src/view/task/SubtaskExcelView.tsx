import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactGrid,
  Column,
  Row,
  HeaderCell,
  CellChange,
  Id,
  CellTemplate,
  Compatible,
  Uncertain,
  CellStyle,
} from '@silevis/reactgrid';
import '@silevis/reactgrid/styles.css';
import '../project/planner/planView/ProjectTimePlanExcel.css';
import { i18n } from 'src/i18n';
import TaskService from 'src/modules/task/taskService';
import TaskTemplateService from 'src/modules/taskTemplate/taskTemplateService';
import Spinner from 'src/view/shared/Spinner';
import Errors from 'src/modules/shared/error/errors';
import AiAgentService from 'src/modules/aiAgent/aiAgentService';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import type { TaskTemplateField } from 'src/view/task/form/DynamicTaskSchema';
import { parseStructuredBulk } from 'src/view/project/planner/structuredBulkParser';

const PENDING_ID_PREFIX = 'pending-';

function makePendingId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${PENDING_ID_PREFIX}${crypto.randomUUID()}`;
  }
  return `${PENDING_ID_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isPendingId(id: string): boolean {
  return id.startsWith(PENDING_ID_PREFIX);
}

export const TEST_TYPE_OPTIONS = ['Functional', 'UI', 'Critical'] as const;

/** Row data: id, task, title, acceptanceCriteria, checklist at root; plus legacy or template field ids */
export type TestCaseRow = {
  id: string;
  task?: string;
  title?: string;
  acceptanceCriteria?: string;
  checklist?: Array<{ label: string; done: boolean }>;
  preconditions?: string;
  steps?: string;
  expectedResult?: string;
  testType?: string;
  [fieldId: string]: any;
};

const STORAGE_KEY_PREFIX = 'testCaseExcelDrafts:';

function getStorageKey(taskId: string): string {
  return `${STORAGE_KEY_PREFIX}${taskId}`;
}

type StoredDraft = {
  pending: TestCaseRow[];
  overrides: Record<string, Record<string, any>>;
};

function loadDraftFromStorage(taskId: string): StoredDraft {
  try {
    const raw = localStorage.getItem(getStorageKey(taskId));
    if (!raw) return { pending: [], overrides: {} };
    const parsed = JSON.parse(raw) as StoredDraft;
    return {
      pending: Array.isArray(parsed?.pending) ? parsed.pending : [],
      overrides: parsed?.overrides && typeof parsed.overrides === 'object' ? parsed.overrides : {},
    };
  } catch {
    return { pending: [], overrides: {} };
  }
}

function saveDraftToStorage(taskId: string, draft: StoredDraft): void {
  try {
    localStorage.setItem(getStorageKey(taskId), JSON.stringify(draft));
  } catch {
    // ignore
  }
}

const ROW_NUM_COLUMN_ID = 'rowNum';
const DELETE_COLUMN_ID = 'delete';
const TITLE_COLUMN_ID = 'title';
const ACCEPTANCE_CRITERIA_COLUMN_ID = 'acceptanceCriteria';
const CHECKLIST_COLUMN_ID = 'checklist';
const PRECONDITIONS_COLUMN_ID = 'preconditions';
const STEPS_COLUMN_ID = 'steps';
const EXPECTED_RESULT_COLUMN_ID = 'expectedResult';
const TEST_TYPE_COLUMN_ID = 'testType';

type DeleteButtonCell = {
  type: 'deleteButton';
  rowId: string;
  isDeleted: boolean;
  showRemove: boolean;
};

function createDeleteButtonTemplate(
  onToggleDeleteRef: React.MutableRefObject<((rowId: string) => void) | null>,
  onRemoveRef: React.MutableRefObject<((rowId: string) => void) | null>,
): CellTemplate<DeleteButtonCell> {
  return {
    getCompatibleCell(uncertain: Uncertain<DeleteButtonCell>): Compatible<DeleteButtonCell> {
      return {
        ...uncertain,
        text: '',
        value: 0,
        rowId: uncertain.rowId ?? '',
        isDeleted: uncertain.isDeleted === true,
        showRemove: uncertain.showRemove === true,
      } as Compatible<DeleteButtonCell>;
    },
    isFocusable: () => false,
    render(cell: Compatible<DeleteButtonCell>) {
      return (
        <span className="d-inline-flex align-items-center gap-1">
          {cell.showRemove && (
            <button
              type="button"
              className="btn btn-sm btn-link p-0 text-danger border-0"
              style={{ minWidth: 22 }}
              title="Remove (local only)"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveRef.current?.(cell.rowId);
              }}
            >
              <i className="fas fa-minus" />
            </button>
          )}
          <button
            type="button"
            className={`btn btn-sm btn-link p-0 border-0 ${cell.isDeleted ? 'text-danger' : 'text-secondary'}`}
            style={{ minWidth: 22 }}
            title={cell.isDeleted ? 'Undo delete' : 'Mark for delete'}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onToggleDeleteRef.current?.(cell.rowId);
            }}
          >
            <i className={cell.isDeleted ? 'fas fa-undo' : 'fas fa-trash-alt'} />
          </button>
        </span>
      );
    },
  };
}

type RowNumberCell = {
  type: 'rowNumber';
  rowIndex: number;
  rowId: string;
  isDirty: boolean;
  style?: CellStyle;
};

function createRowNumberTemplate(
  onUndoRowRef: React.MutableRefObject<((rowId: string) => void) | null>,
): CellTemplate<RowNumberCell> {
  return {
    getCompatibleCell(uncertain: Uncertain<RowNumberCell>): Compatible<RowNumberCell> {
      return {
        ...uncertain,
        text: '',
        value: 0,
        rowIndex: uncertain.rowIndex ?? 0,
        rowId: uncertain.rowId ?? '',
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
                onUndoRowRef.current?.(cell.rowId);
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

type TextWithSpeechCell = {
  type: 'textWithSpeech';
  rowId: string;
  field: string;
  text: string;
  style?: CellStyle;
  multiline?: boolean;
  /** Row height in px (for multiline textarea minHeight) */
  rowHeight?: number;
};

type TestTypeDropdownCell = {
  type: 'testTypeDropdown';
  rowId: string;
  value: string;
  style?: CellStyle;
};

/** Generic dropdown cell driven by options (e.g. from task template SELECT field) */
type DropdownCell = {
  type: 'dropdown';
  rowId: string;
  fieldId: string;
  value: string;
  options: string[];
  style?: CellStyle;
};

function createTestTypeDropdownTemplate(
  onChangeRef: React.MutableRefObject<
    ((rowId: string, value: string) => void) | null
  >,
): CellTemplate<TestTypeDropdownCell> {
  return {
    getCompatibleCell(uncertain: Uncertain<TestTypeDropdownCell>): Compatible<TestTypeDropdownCell> {
      return {
        ...uncertain,
        rowId: uncertain.rowId ?? '',
        value: uncertain.value ?? 'Functional',
      } as Compatible<TestTypeDropdownCell>;
    },
    isFocusable: () => true,
    render(cell: Compatible<TestTypeDropdownCell>) {
      return (
        <select
          className="form-select form-select-sm border-0 bg-transparent h-100 w-100"
          value={cell.value}
          onChange={(e) => onChangeRef.current?.(cell.rowId, e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          style={cell.style as React.CSSProperties}
        >
          {TEST_TYPE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    },
  };
}

function createDropdownTemplate(
  onChangeRef: React.MutableRefObject<
    ((rowId: string, fieldId: string, value: string) => void) | null
  >,
): CellTemplate<DropdownCell> {
  return {
    getCompatibleCell(uncertain: Uncertain<DropdownCell>): Compatible<DropdownCell> {
      return {
        ...uncertain,
        rowId: uncertain.rowId ?? '',
        fieldId: uncertain.fieldId ?? '',
        value: uncertain.value ?? '',
        options: Array.isArray(uncertain.options) ? uncertain.options : [],
      } as Compatible<DropdownCell>;
    },
    isFocusable: () => true,
    render(cell: Compatible<DropdownCell>) {
      const opts = cell.options.length ? cell.options : [''];
      return (
        <select
          className="form-select form-select-sm border-0 bg-transparent h-100 w-100"
          value={cell.value}
          onChange={(e) => onChangeRef.current?.(cell.rowId, cell.fieldId, e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          style={cell.style as React.CSSProperties}
        >
          {opts.map((opt) => (
            <option key={opt} value={opt}>
              {opt || '—'}
            </option>
          ))}
        </select>
      );
    },
  };
}

function createTextWithSpeechTemplate(
  getStateRef: React.MutableRefObject<
    () => { listening: boolean; dictatingFor: { rowId: string; field: string } | null }
  >,
  onChangeRef: React.MutableRefObject<
    ((rowId: string, field: string, text: string) => void) | null
  >,
  onMicClickRef: React.MutableRefObject<
    ((rowId: string, field: string) => void) | null
  >,
  onStarClickRef: React.MutableRefObject<((rowId: string) => void) | null>,
  starLoadingRowIdRef: React.MutableRefObject<string | null>,
  browserSupportsSpeechRef: React.MutableRefObject<boolean>,
): CellTemplate<TextWithSpeechCell> {
  return {
    getCompatibleCell(uncertain: Uncertain<TextWithSpeechCell>): Compatible<TextWithSpeechCell> {
      return {
        ...uncertain,
        text: uncertain.text ?? '',
        rowId: uncertain.rowId ?? '',
        field: uncertain.field ?? 'title',
        multiline: uncertain.multiline === true,
        rowHeight: uncertain.rowHeight,
      } as Compatible<TextWithSpeechCell>;
    },
    isFocusable: () => true,
    render(cell: Compatible<TextWithSpeechCell>) {
      const state = getStateRef.current?.();
      const listening = state?.listening ?? false;
      const dictatingFor = state?.dictatingFor ?? null;
      const isDictatingThis =
        dictatingFor?.rowId === cell.rowId && dictatingFor?.field === cell.field;
      const showMic = browserSupportsSpeechRef.current;
      const multiline = cell.multiline === true;
      const rowH = cell.rowHeight ?? DEFAULT_ROW_HEIGHT;
      const textareaMinHeight = rowH - 12;

      const handlePaste = (e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        e.stopPropagation();
        const text = e.clipboardData?.getData?.('text/plain');
        if (text == null) return;
        e.preventDefault();
        const target = e.currentTarget;
        const start = target.selectionStart ?? 0;
        const end = target.selectionEnd ?? 0;
        const value = target.value;
        const newValue = value.slice(0, start) + text + value.slice(end);
        onChangeRef.current?.(cell.rowId, cell.field, newValue);
        setTimeout(() => {
          const newCursor = start + text.length;
          target.setSelectionRange(newCursor, newCursor);
        }, 0);
      };

      return (
        <div
          className="d-flex align-items-start gap-1 w-100 h-100"
          style={{ minWidth: 0, ...(cell.style as React.CSSProperties) }}
        >
          {multiline ? (
            <textarea
              className="form-control form-control-sm border-0 bg-transparent flex-grow-1"
              style={{
                minWidth: 0,
                resize: 'none',
                minHeight: textareaMinHeight,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}
              value={cell.text}
              onChange={(e) =>
                onChangeRef.current?.(cell.rowId, cell.field, e.target.value)
              }
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              onKeyUp={(e) => e.stopPropagation()}
              onCopy={(e) => e.stopPropagation()}
              onPaste={handlePaste}
              onCut={(e) => e.stopPropagation()}
              rows={3}
            />
          ) : (
            <input
              type="text"
              className="form-control form-control-sm border-0 bg-transparent h-100 flex-grow-1"
              style={{ minWidth: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
              value={cell.text}
              onChange={(e) =>
                onChangeRef.current?.(cell.rowId, cell.field, e.target.value)
              }
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              onKeyUp={(e) => e.stopPropagation()}
              onCopy={(e) => e.stopPropagation()}
              onPaste={handlePaste}
              onCut={(e) => e.stopPropagation()}
            />
          )}
          <div className="d-flex flex-column align-items-center gap-1">
            {showMic && (
              <button
                type="button"
                className={`btn btn-sm btn-link p-0 border-0 flex-shrink-0 ${isDictatingThis && listening ? 'text-danger' : 'text-secondary'}`}
                style={{ minWidth: 22 }}
                title={
                  listening && isDictatingThis
                    ? 'Stop listening'
                    : `Dictate ${cell.field} (speech to text)`
                }
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onMicClickRef.current?.(cell.rowId, cell.field);
                }}
              >
                <i className={`fas fa-microphone${listening && isDictatingThis ? '-slash' : ''}`} />
              </button>
            )}
            <button
              type="button"
              className="btn btn-sm btn-link p-0 border-0 flex-shrink-0 text-warning"
              style={{ minWidth: 22 }}
              title="Refine with AI"
              disabled={starLoadingRowIdRef.current === cell.rowId}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onStarClickRef.current?.(cell.rowId);
              }}
            >
              {starLoadingRowIdRef.current === cell.rowId ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
              ) : (
                <i className="far fa-star" />
              )}
            </button>
          </div>
        </div>
      );
    },
  };
}

const DEFAULT_ROW_HEIGHT = 88;
const DEFAULT_COLUMN_WIDTH = 180;
const LEGACY_DEFAULT_COLUMN_WIDTHS: Record<string, number> = {
  [ROW_NUM_COLUMN_ID]: 44,
  [DELETE_COLUMN_ID]: 80,
  [TITLE_COLUMN_ID]: 200,
  [ACCEPTANCE_CRITERIA_COLUMN_ID]: 220,
  [CHECKLIST_COLUMN_ID]: 220,
  [PRECONDITIONS_COLUMN_ID]: 200,
  [STEPS_COLUMN_ID]: 240,
  [EXPECTED_RESULT_COLUMN_ID]: 200,
  [TEST_TYPE_COLUMN_ID]: 120,
};

const ROOT_COLUMN_IDS = [
  DELETE_COLUMN_ID,
  TITLE_COLUMN_ID,
  ACCEPTANCE_CRITERIA_COLUMN_ID,
  CHECKLIST_COLUMN_ID,
] as const;

const LEGACY_COLUMN_IDS = [
  ...ROOT_COLUMN_IDS,
  PRECONDITIONS_COLUMN_ID,
  STEPS_COLUMN_ID,
  EXPECTED_RESULT_COLUMN_ID,
  TEST_TYPE_COLUMN_ID,
] as const;

function getDefaultColumnWidths(templateFields: TaskTemplateField[] | null): Record<string, number> {
  if (!templateFields?.length) return { ...LEGACY_DEFAULT_COLUMN_WIDTHS };
  const out: Record<string, number> = {
    [ROW_NUM_COLUMN_ID]: 44,
    [DELETE_COLUMN_ID]: 80,
    [TITLE_COLUMN_ID]: 200,
    [ACCEPTANCE_CRITERIA_COLUMN_ID]: 220,
    [CHECKLIST_COLUMN_ID]: 220,
  };
  templateFields.forEach((f) => {
    if (f.id !== ACCEPTANCE_CRITERIA_COLUMN_ID && f.id !== CHECKLIST_COLUMN_ID) {
      out[f.id] = DEFAULT_COLUMN_WIDTH;
    }
  });
  return out;
}

function getColumnIds(templateFields: TaskTemplateField[] | null): string[] {
  if (!templateFields?.length) return [ROW_NUM_COLUMN_ID, ...LEGACY_COLUMN_IDS];
  const rest = templateFields
    .filter((f) => f.id !== ACCEPTANCE_CRITERIA_COLUMN_ID && f.id !== CHECKLIST_COLUMN_ID)
    .map((f) => f.id);
  return [ROW_NUM_COLUMN_ID, ...ROOT_COLUMN_IDS, ...rest];
}

function formatCellValue(v: any): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return v.map((i) => (typeof i === 'object' && i?.label != null ? i.label : String(i))).join(', ');
  return String(v);
}

export type TaskChildrenType = 'USER_STORY' | 'TASK' | 'TEST_CASE' | 'BUG';

type Props = {
  taskId: string | undefined;
  projectId?: string | null;
  /** Type of child tasks to list and create (e.g. USER_STORY when viewing EPIC, TEST_CASE when viewing TASK). Defaults to TEST_CASE. */
  type?: TaskChildrenType;
  /** Project template id for this child type (userStoryTemplate, taskTemplate, or testCaseTemplate) */
  templateId?: string | null;
  taskTitle?: string;
  taskDescription?: string;
};

const SubtaskExcelView = ({
  taskId,
  projectId,
  type: childType = 'TEST_CASE',
  templateId,
  taskTitle = '',
  taskDescription = '',
}: Props) => {
  const [templateFields, setTemplateFields] = useState<TaskTemplateField[] | null>(null);
  const [templateLoading, setTemplateLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<TestCaseRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(() => new Set());
  const [deletedIds, setDeletedIds] = useState<Set<string>>(() => new Set());
  const [aiLoading, setAiLoading] = useState(false);
  const [aiLoadingRowId, setAiLoadingRowId] = useState<string | null>(null);
  const defaultWidths = useMemo(() => getDefaultColumnWidths(templateFields), [templateFields]);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => defaultWidths);
  const [rowHeights, setRowHeights] = useState<Record<string, number>>(() => ({}));
  const [dictatingFor, setDictatingFor] = useState<{ rowId: string; field: string } | null>(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const onToggleDeleteRef = useRef<((rowId: string) => void) | null>(null);
  const onRemoveRef = useRef<((rowId: string) => void) | null>(null);
  const onUndoRowRef = useRef<((rowId: string) => void) | null>(null);
  const lastSavedRowsRef = useRef<Map<string, TestCaseRow>>(new Map());
  const dirtyIdsRef = useRef<Set<string>>(new Set());
  dirtyIdsRef.current = dirtyIds;
  const getSpeechStateRef = useRef<
    () => { listening: boolean; dictatingFor: { rowId: string; field: string } | null }
  >(() => ({ listening: false, dictatingFor: null }));
  const onChangeRef = useRef<
    ((rowId: string, field: string, text: string) => void) | null
  >(null);
  const onMicClickRef = useRef<
    ((rowId: string, field: string) => void) | null
  >(null);
  const onStarClickRef = useRef<((rowId: string) => void) | null>(null);
  const starLoadingRowIdRef = useRef<string | null>(null);
  const onTestTypeChangeRef = useRef<((rowId: string, value: string) => void) | null>(null);
  const onDropdownChangeRef = useRef<((rowId: string, fieldId: string, value: string) => void) | null>(null);
  const browserSupportsSpeechRef = useRef(false);
  browserSupportsSpeechRef.current = browserSupportsSpeechRecognition;
  const rowsRef = useRef<TestCaseRow[]>([]);
  rowsRef.current = rows;

  getSpeechStateRef.current = () => ({ listening, dictatingFor });
  starLoadingRowIdRef.current = aiLoadingRowId;

  // Load task template from project (test case template) to drive columns
  useEffect(() => {
    if (!templateId) {
      setTemplateFields(null);
      setTemplateLoading(false);
      return;
    }
    let cancelled = false;
    setTemplateLoading(true);
    TaskTemplateService.find(templateId)
      .then((template: { fields?: TaskTemplateField[] }) => {
        if (cancelled) return;
        const raw = template?.fields ?? [];
        const normalized: TaskTemplateField[] = raw.map((f: TaskTemplateField, i: number) => ({
          ...f,
          id: f.id || (f.name ? String(f.name).replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '') : `field_${i}`),
        }));
        setTemplateFields(normalized.length ? normalized : null);
      })
      .catch(() => {
        if (!cancelled) setTemplateFields(null);
      })
      .finally(() => {
        if (!cancelled) setTemplateLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [templateId]);

  useEffect(() => {
    setColumnWidths((prev) => ({ ...getDefaultColumnWidths(templateFields), ...prev }));
  }, [templateFields]);

  const persistDraft = useCallback(
    (tid: string | undefined, currentRows: TestCaseRow[]) => {
      if (!tid) return;
      const pending = currentRows.filter((r) => isPendingId(r.id));
      const saved = currentRows.filter((r) => !isPendingId(r.id));
      const dirty = dirtyIdsRef.current ?? new Set<string>();
      const overrides: Record<string, Record<string, any>> = {};
      saved.forEach((r) => {
        if (!dirty.has(r.id)) return;
        if (templateFields?.length) {
          overrides[r.id] = {
            title: r.title,
            acceptanceCriteria: r.acceptanceCriteria,
            checklist: r.checklist,
            ...templateFields
              .filter((f) => f.id !== ACCEPTANCE_CRITERIA_COLUMN_ID && f.id !== CHECKLIST_COLUMN_ID)
              .reduce((acc, f) => ({ ...acc, [f.id]: r[f.id] }), {} as Record<string, any>),
          };
        } else {
          overrides[r.id] = {
            title: r.title,
            acceptanceCriteria: r.acceptanceCriteria,
            checklist: r.checklist,
            preconditions: r.preconditions,
            steps: r.steps,
            expectedResult: r.expectedResult,
            testType: r.testType,
          };
        }
      });
      saveDraftToStorage(tid, { pending, overrides });
    },
    [templateFields],
  );

  useEffect(() => {
    if (!listening && dictatingFor != null && transcript.trim()) {
      const { rowId, field } = dictatingFor;
      const value = transcript.trim();
      setRows((prev) => {
        const next = prev.map((r) => {
          if (r.id !== rowId) return r;
          return { ...r, [field]: value };
        });
        persistDraft(taskId, next);
        return next;
      });
      setDirtyIds((prev) => new Set(prev).add(rowId));
      setDictatingFor(null);
      resetTranscript();
    }
  }, [listening, dictatingFor, transcript, taskId, resetTranscript, persistDraft]);

  const handleFieldChange = useCallback(
    (rowId: string, field: string, text: string) => {
      setRows((prev) => {
        let value: string | Array<{ label: string; done: boolean }> = text;
        if (field === CHECKLIST_COLUMN_ID) {
          value = text
            .split(/\n/)
            .map((s) => s.trim())
            .filter(Boolean)
            .map((label) => ({ label, done: false }));
        }
        const next = prev.map((r) =>
          r.id === rowId ? { ...r, [field]: value } : r,
        );
        persistDraft(taskId, next);
        return next;
      });
      setDirtyIds((prev) => new Set(prev).add(rowId));
    },
    [taskId, persistDraft],
  );

  const handleTestTypeChange = useCallback(
    (rowId: string, value: string) => {
      setRows((prev) => {
        const next = prev.map((r) =>
          r.id === rowId ? { ...r, testType: value } : r,
        );
        persistDraft(taskId, next);
        return next;
      });
      setDirtyIds((prev) => new Set(prev).add(rowId));
    },
    [taskId, persistDraft],
  );

  const handleTemplateFieldChange = useCallback(
    (rowId: string, fieldId: string, value: string) => {
      setRows((prev) => {
        const next = prev.map((r) =>
          r.id === rowId ? { ...r, [fieldId]: value } : r,
        );
        persistDraft(taskId, next);
        return next;
      });
      setDirtyIds((prev) => new Set(prev).add(rowId));
    },
    [taskId, persistDraft],
  );

  const handleMicClick = useCallback(
    (rowId: string, field: string) => {
      if (listening) {
        if (dictatingFor?.rowId === rowId && dictatingFor?.field === field) {
          SpeechRecognition.stopListening();
        }
        return;
      }
      setDictatingFor({ rowId, field });
      resetTranscript();
      SpeechRecognition.startListening({ continuous: false, language: 'en-US' });
    },
    [listening, dictatingFor, resetTranscript],
  );

  useEffect(() => {
    onChangeRef.current = handleFieldChange;
    onMicClickRef.current = handleMicClick;
    onStarClickRef.current = handleStarClick;
    onTestTypeChangeRef.current = handleTestTypeChange;
    onDropdownChangeRef.current = handleTemplateFieldChange;
  });

  const loadRows = useCallback(() => {
    if (!taskId) return;
    setLoading(true);
    setError(null);
    TaskService.list({ type: childType, parents: taskId }, undefined, 500, 0)
      .then((res: { rows?: any[] }) => {
        const taskRows = res.rows ?? [];
        const td = (t: any) => t.templateData ?? {};
        const serverRows: TestCaseRow[] = taskRows.map((t: any) => {
          const base: Record<string, any> = {
            id: t.id,
            task: taskId,
            title: t.title ?? '',
            acceptanceCriteria: t.acceptanceCriteria ?? '',
            checklist: Array.isArray(t.checklist) ? t.checklist : [],
          };
          if (templateFields?.length) {
            templateFields.forEach((f) => {
              if (f.id === ACCEPTANCE_CRITERIA_COLUMN_ID || f.id === CHECKLIST_COLUMN_ID) return;
              const v = td(t)[f.id];
              base[f.id] = v !== undefined && v !== null
                ? v
                : (f.defaultValue ?? (f.type === 'CHECKLIST' ? [] : ''));
            });
            return base as TestCaseRow;
          }
          return {
            ...base,
            preconditions: (td(t).preconditions ?? '') as string,
            steps: (td(t).testSteps ?? td(t).steps ?? '') as string,
            expectedResult: (td(t).expectedResult ?? '') as string,
            testType: (td(t).testType ?? 'Functional') as string,
          } as TestCaseRow;
        });
        const draft = loadDraftFromStorage(taskId);
        const overridden = serverRows.map((r) => ({
          ...r,
          ...(draft.overrides[r.id] ?? {}),
        }));
        const allRows = [...overridden, ...draft.pending];
        lastSavedRowsRef.current = new Map(allRows.map((r) => [r.id, { ...r }]));
        setRows(allRows);
        setDirtyIds(new Set(Object.keys(draft.overrides ?? {})));
        setDeletedIds(new Set());
      })
      .catch((e) => setError((e as Error)?.message ?? 'Failed to load test cases'))
      .finally(() => setLoading(false));
  }, [taskId, templateFields, childType]);

  useEffect(() => {
    if (!taskId) return;
    if (templateId && templateLoading) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    TaskService.list({ type: childType, parents: taskId }, undefined, 500, 0)
      .then((res: { rows?: any[] }) => {
        if (!cancelled) {
          const taskRows = res.rows ?? [];
          const td = (t: any) => t.templateData ?? {};
          const serverRows: TestCaseRow[] = taskRows.map((t: any) => {
            const base: Record<string, any> = {
              id: t.id,
              task: taskId,
              title: t.title ?? '',
              acceptanceCriteria: t.acceptanceCriteria ?? '',
              checklist: Array.isArray(t.checklist) ? t.checklist : [],
            };
            if (templateFields?.length) {
              templateFields.forEach((f) => {
                if (f.id === ACCEPTANCE_CRITERIA_COLUMN_ID || f.id === CHECKLIST_COLUMN_ID) return;
                const v = td(t)[f.id];
                base[f.id] = v !== undefined && v !== null
                  ? v
                  : (f.defaultValue ?? (f.type === 'CHECKLIST' ? [] : ''));
              });
              return base as TestCaseRow;
            }
            return {
              ...base,
              preconditions: (td(t).preconditions ?? '') as string,
              steps: (td(t).testSteps ?? td(t).steps ?? '') as string,
              expectedResult: (td(t).expectedResult ?? '') as string,
              testType: (td(t).testType ?? 'Functional') as string,
            } as TestCaseRow;
          });
          const draft = loadDraftFromStorage(taskId);
          const overridden = serverRows.map((r) => ({
            ...r,
            ...(draft.overrides[r.id] ?? {}),
          }));
          const allRows = [...overridden, ...draft.pending];
          lastSavedRowsRef.current = new Map(allRows.map((r) => [r.id, { ...r }]));
          setRows(allRows);
          setDirtyIds(new Set(Object.keys(draft.overrides ?? {})));
          setDeletedIds(new Set());
        }
      })
      .catch((e) => {
        if (!cancelled) setError((e as Error)?.message ?? 'Failed to load test cases');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [taskId, templateFields, templateId, templateLoading, childType]);

  const handleUndoRow = useCallback(
    (rowId: string) => {
      const saved = lastSavedRowsRef.current.get(rowId);
      if (saved == null) return;
      setRows((prev) => {
        const next = prev.map((r) => (r.id === rowId ? { ...saved } : r));
        persistDraft(taskId, next);
        return next;
      });
      setDirtyIds((prev) => {
        const next = new Set(prev);
        next.delete(rowId);
        return next;
      });
    },
    [taskId, persistDraft],
  );

  const handleAddRow = useCallback(() => {
    if (!taskId) return;
    const newRow: TestCaseRow = templateFields?.length
      ? {
          id: makePendingId(),
          task: taskId,
          title: '',
          acceptanceCriteria: '',
          checklist: [],
          ...templateFields
            .filter((f) => f.id !== ACCEPTANCE_CRITERIA_COLUMN_ID && f.id !== CHECKLIST_COLUMN_ID)
            .reduce(
              (acc, f) => ({
                ...acc,
                [f.id]: f.defaultValue ?? (f.type === 'CHECKLIST' ? [] : ''),
              }),
              {} as Record<string, any>,
            ),
        }
      : {
          id: makePendingId(),
          task: taskId,
          title: '',
          acceptanceCriteria: '',
          checklist: [],
          preconditions: '',
          steps: '',
          expectedResult: '',
          testType: 'Functional',
        };
    lastSavedRowsRef.current.set(newRow.id, { ...newRow });
    setRows((prev) => {
      const next = [...prev, newRow];
      persistDraft(taskId, next);
      return next;
    });
  }, [taskId, templateFields, persistDraft]);

  const handleRemovePending = useCallback(
    (rowId: string) => {
      if (!taskId) return;
      setRows((prev) => {
        const next = prev.filter((r) => r.id !== rowId);
        persistDraft(taskId, next);
        return next;
      });
    },
    [taskId, persistDraft],
  );

  const handleToggleDelete = useCallback((rowId: string) => {
    setDeletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);
      return next;
    });
  }, []);

  useEffect(() => {
    onToggleDeleteRef.current = handleToggleDelete;
    onRemoveRef.current = handleRemovePending;
  }, [handleToggleDelete, handleRemovePending]);

  useEffect(() => {
    onUndoRowRef.current = handleUndoRow;
  }, [handleUndoRow]);

  const handleAiGenerate = useCallback(async () => {
    if (!taskId || !taskTitle?.trim()) return;
    setAiLoading(true);
    setError(null);
    try {
      if (childType === 'USER_STORY') {
        const data = await AiAgentService.plannerSuggestUserStoriesForEpic(taskTitle.trim(), {
          epicDescription: taskDescription?.trim() || undefined,
        });
        const text = typeof data?.userStoriesText === 'string' ? data.userStoriesText : '';
        const parsed = parseStructuredBulk(text);
        const items = Array.isArray(parsed) ? parsed.filter((p) => p && p.level === 1) : [];
        const newRows: TestCaseRow[] = items.map((item) => ({
          id: makePendingId(),
          task: taskId,
          title: String(item?.title ?? 'User Story').trim() || 'User Story',
          acceptanceCriteria: item?.acceptanceCriteria?.join?.('\n') ?? '',
          checklist: (item?.todoChecklist ?? []).map((label: string) => ({ label, done: false })),
          ...(templateFields?.length
            ? templateFields
                .filter((f) => f.id !== ACCEPTANCE_CRITERIA_COLUMN_ID && f.id !== CHECKLIST_COLUMN_ID)
                .reduce(
                  (acc, f) => ({
                    ...acc,
                    [f.id]: f.defaultValue ?? (f.type === 'CHECKLIST' ? [] : ''),
                  }),
                  {} as Record<string, any>,
                )
            : {}),
        }));
        if (newRows.length > 0) {
          newRows.forEach((row) => lastSavedRowsRef.current.set(row.id, { ...row }));
          setRows((prev) => {
            const next = [...prev, ...newRows];
            persistDraft(taskId, next);
            return next;
          });
        }
      } else if (childType === 'TASK') {
        const data = await AiAgentService.plannerSuggestTasksForUserStory(taskTitle.trim(), {});
        const text = typeof data?.tasksText === 'string' ? data.tasksText : '';
        const parsed = parseStructuredBulk(text);
        const items = Array.isArray(parsed) ? parsed.filter((p) => p && p.level === 2) : [];
        const newRows: TestCaseRow[] = items.map((item) => ({
          id: makePendingId(),
          task: taskId,
          title: String(item?.title ?? 'Task').trim() || 'Task',
          acceptanceCriteria: item?.acceptanceCriteria?.join?.('\n') ?? '',
          checklist: (item?.todoChecklist ?? []).map((label: string) => ({ label, done: false })),
          ...(templateFields?.length
            ? templateFields
                .filter((f) => f.id !== ACCEPTANCE_CRITERIA_COLUMN_ID && f.id !== CHECKLIST_COLUMN_ID)
                .reduce(
                  (acc, f) => ({
                    ...acc,
                    [f.id]: f.defaultValue ?? (f.type === 'CHECKLIST' ? [] : ''),
                  }),
                  {} as Record<string, any>,
                )
            : {}),
        }));
        if (newRows.length > 0) {
          newRows.forEach((row) => lastSavedRowsRef.current.set(row.id, { ...row }));
          setRows((prev) => {
            const next = [...prev, ...newRows];
            persistDraft(taskId, next);
            return next;
          });
        }
      } else {
        const data = await AiAgentService.suggestTestCasesForTask(taskTitle.trim(), {
          taskDescription: taskDescription?.trim() || undefined,
        });
        const list = data?.testCases ?? [];
        const newRows: TestCaseRow[] = list.map((t) => {
          const base: TestCaseRow = {
            id: makePendingId(),
            task: taskId,
            title: t.title ?? 'Test case',
            acceptanceCriteria: '',
            checklist: [],
          };
          if (templateFields?.length) {
            templateFields
              .filter((f) => f.id !== ACCEPTANCE_CRITERIA_COLUMN_ID && f.id !== CHECKLIST_COLUMN_ID)
              .forEach((f) => {
                const aiValue =
                  f.id === 'steps' || f.id === 'testSteps' ? (t.steps ?? '')
                  : f.id === 'expectedResult' ? (t.expectedResult ?? '')
                  : f.id === 'preconditions' ? ''
                  : f.defaultValue ?? (f.type === 'CHECKLIST' ? [] : '');
                (base as any)[f.id] = aiValue;
              });
            return base;
          }
          return {
            ...base,
            preconditions: '',
            steps: t.steps ?? '',
            expectedResult: t.expectedResult ?? '',
            testType: 'Functional',
          };
        });
        if (newRows.length > 0) {
          newRows.forEach((row) => lastSavedRowsRef.current.set(row.id, { ...row }));
          setRows((prev) => {
            const next = [...prev, ...newRows];
            persistDraft(taskId, next);
            return next;
          });
        }
      }
    } catch (e) {
      Errors.handle(e);
      setError((e as Error)?.message ?? 'AI request failed');
    } finally {
      setAiLoading(false);
    }
  }, [taskId, taskTitle, taskDescription, childType, templateFields, persistDraft]);

  const handleStarClick = useCallback(
    async (rowId: string) => {
      if (!taskId || !taskTitle?.trim()) return;
      const row = rows.find((r) => r.id === rowId);
      if (!row) return;
      setAiLoadingRowId(rowId);
      setError(null);
      try {
        if (childType === 'USER_STORY') {
          const data = await AiAgentService.plannerSuggestUserStoriesForEpic(taskTitle.trim(), {
            epicDescription: taskDescription?.trim() || undefined,
          });
          const text = typeof data?.userStoriesText === 'string' ? data.userStoriesText : '';
          const parsed = parseStructuredBulk(text);
          const items = Array.isArray(parsed) ? parsed.filter((p) => p && p.level === 1) : [];
          const first = items[0];
          if (first) {
            const updated: TestCaseRow = {
              ...row,
              title: String(first?.title ?? row.title ?? 'User Story').trim() || 'User Story',
              acceptanceCriteria: first?.acceptanceCriteria?.join?.('\n') ?? row.acceptanceCriteria ?? '',
              checklist: (first?.todoChecklist ?? []).map((label: string) => ({ label, done: false })),
            };
            setRows((prev) => {
              const next = prev.map((r) => (r.id === rowId ? updated : r));
              persistDraft(taskId, next);
              return next;
            });
            setDirtyIds((prev) => new Set(prev).add(rowId));
          }
        } else if (childType === 'TASK') {
          const data = await AiAgentService.plannerSuggestTasksForUserStory(taskTitle.trim(), {});
          const text = typeof data?.tasksText === 'string' ? data.tasksText : '';
          const parsed = parseStructuredBulk(text);
          const items = Array.isArray(parsed) ? parsed.filter((p) => p && p.level === 2) : [];
          const first = items[0];
          if (first) {
            const updated: TestCaseRow = {
              ...row,
              title: String(first?.title ?? row.title ?? 'Task').trim() || 'Task',
              acceptanceCriteria: first?.acceptanceCriteria?.join?.('\n') ?? row.acceptanceCriteria ?? '',
              checklist: (first?.todoChecklist ?? []).map((label: string) => ({ label, done: false })),
            };
            setRows((prev) => {
              const next = prev.map((r) => (r.id === rowId ? updated : r));
              persistDraft(taskId, next);
              return next;
            });
            setDirtyIds((prev) => new Set(prev).add(rowId));
          }
        } else {
          const data = await AiAgentService.suggestTestCasesForTask(taskTitle.trim(), {
            taskDescription: taskDescription?.trim() || undefined,
          });
          const list = data?.testCases ?? [];
          const first = list[0];
          if (first) {
            const updated: TestCaseRow = {
              ...row,
              title: first.title ?? row.title ?? 'Test case',
              ...(templateFields?.length
                ? templateFields
                    .filter((f) => f.id !== ACCEPTANCE_CRITERIA_COLUMN_ID && f.id !== CHECKLIST_COLUMN_ID)
                    .reduce(
                      (acc, f) => ({
                        ...acc,
                        [f.id]:
                          f.id === 'steps' || f.id === 'testSteps'
                            ? (first.steps ?? '')
                            : f.id === 'expectedResult'
                              ? (first.expectedResult ?? '')
                              : row[f.id] ?? (f.defaultValue ?? (f.type === 'CHECKLIST' ? [] : '')),
                      }),
                      {} as Record<string, any>,
                    )
                : {
                    preconditions: row.preconditions ?? '',
                    steps: first.steps ?? row.steps ?? '',
                    expectedResult: first.expectedResult ?? row.expectedResult ?? '',
                    testType: row.testType ?? 'Functional',
                  }),
            };
            setRows((prev) => {
              const next = prev.map((r) => (r.id === rowId ? updated : r));
              persistDraft(taskId, next);
              return next;
            });
            setDirtyIds((prev) => new Set(prev).add(rowId));
          }
        }
      } catch (e) {
        Errors.handle(e);
        setError((e as Error)?.message ?? 'AI refine failed');
      } finally {
        setAiLoadingRowId(null);
      }
    },
    [taskId, taskTitle, taskDescription, childType, rows, templateFields, persistDraft],
  );

  const buildTemplateData = useCallback(
    (r: TestCaseRow) => {
      if (templateFields?.length) {
        return templateFields
          .filter((f) => f.id !== ACCEPTANCE_CRITERIA_COLUMN_ID && f.id !== CHECKLIST_COLUMN_ID)
          .reduce(
            (acc, f) => ({
              ...acc,
              [f.id]: r[f.id] !== undefined && r[f.id] !== null
                ? r[f.id]
                : (f.defaultValue ?? (f.type === 'CHECKLIST' ? [] : '')),
            }),
            {} as Record<string, any>,
          );
      }
      return {
        preconditions: r.preconditions ?? '',
        testSteps: r.steps ?? '',
        expectedResult: r.expectedResult ?? '',
        testType: r.testType ?? 'Functional',
      };
    },
    [templateFields],
  );

  const handleSave = useCallback(async () => {
    if (!taskId || !projectId || !rows.length) return;
    setSaving(true);
    try {
      const pending = rows.filter((r) => isPendingId(r.id) && !deletedIds.has(r.id));
      const toCreatePayloads = pending.map((r) => ({
        type: childType,
        ...(templateId && { template: templateId }),
        title: r.title ?? '',
        ...(r.acceptanceCriteria != null && r.acceptanceCriteria !== '' && { acceptanceCriteria: r.acceptanceCriteria }),
        ...(r.checklist != null && r.checklist.length > 0 && { checklist: r.checklist }),
        templateData: buildTemplateData(r),
        parents: [taskId],
      }));

      const existing = rows.filter((r) => !isPendingId(r.id));
      const toUpdate = existing.filter(
        (r) => dirtyIds.has(r.id) && !deletedIds.has(r.id),
      );
      const toDelete = Array.from(deletedIds).filter((id) => !isPendingId(id));

      if (toCreatePayloads.length > 0) {
        if (templateId && toCreatePayloads.every((p) => p.template)) {
          await TaskService.bulkCreate(projectId, toCreatePayloads);
        } else {
          for (const p of toCreatePayloads) {
            await TaskService.create({
              type: childType,
              project: projectId,
              ...(templateId && { template: templateId }),
              parents: [taskId],
              title: p.title,
              ...(p.acceptanceCriteria != null && { acceptanceCriteria: p.acceptanceCriteria }),
              ...(p.checklist != null && { checklist: p.checklist }),
              templateData: p.templateData,
            });
          }
        }
      }
      for (const r of toUpdate) {
        await TaskService.update(r.id, {
          title: r.title,
          ...(r.acceptanceCriteria != null && { acceptanceCriteria: r.acceptanceCriteria }),
          ...(r.checklist != null && { checklist: r.checklist }),
          templateData: buildTemplateData(r),
        });
      }
      if (toDelete.length > 0) {
        await TaskService.destroyAll(toDelete);
      }

      setDirtyIds(new Set());
      setDeletedIds(new Set());
      localStorage.removeItem(getStorageKey(taskId));
      loadRows();
    } catch (e) {
      setError((e as Error)?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  }, [taskId, projectId, childType, templateId, rows, dirtyIds, deletedIds, buildTemplateData, loadRows]);

  const deleteButtonTemplate = useMemo(
    () => createDeleteButtonTemplate(onToggleDeleteRef, onRemoveRef),
    [],
  );
  const textWithSpeechTemplate = useMemo(
    () =>
      createTextWithSpeechTemplate(
        getSpeechStateRef,
        onChangeRef,
        onMicClickRef,
        onStarClickRef,
        starLoadingRowIdRef,
        browserSupportsSpeechRef,
      ),
    [],
  );
  const testTypeDropdownTemplate = useMemo(
    () => createTestTypeDropdownTemplate(onTestTypeChangeRef),
    [],
  );
  const dropdownTemplate = useMemo(
    () => createDropdownTemplate(onDropdownChangeRef),
    [],
  );

  const columnIds = useMemo(() => getColumnIds(templateFields), [templateFields]);
  const columns = useMemo<Column[]>(
    () =>
      columnIds.map((id) => ({
        columnId: id,
        width: columnWidths[id] ?? defaultWidths[id] ?? DEFAULT_COLUMN_WIDTH,
        resizable: id !== DELETE_COLUMN_ID && id !== ROW_NUM_COLUMN_ID,
      })),
    [columnWidths, columnIds, defaultWidths],
  );

  const rowNumberTemplate = useMemo(() => createRowNumberTemplate(onUndoRowRef), []);

  const gridRows = useMemo((): Row[] => {
    const headerCells: HeaderCell[] = [
      { type: 'header', text: '#' },
      { type: 'header', text: '' },
      { type: 'header', text: i18n('entities.testCase.fields.title') },
      { type: 'header', text: i18n('entities.requirement.fields.acceptanceCriteria') },
      { type: 'header', text: 'Checklist' },
    ];
    if (templateFields?.length) {
      templateFields
        .filter((f) => f.id !== ACCEPTANCE_CRITERIA_COLUMN_ID && f.id !== CHECKLIST_COLUMN_ID)
        .forEach((f) => {
          headerCells.push({ type: 'header', text: f.name || f.id });
        });
    } else {
      headerCells.push(
        { type: 'header', text: 'Preconditions' },
        { type: 'header', text: 'Test Steps' },
        { type: 'header', text: 'Expected Result' },
        { type: 'header', text: 'Test Type' },
      );
    }
    const headerRow: Row = {
      rowId: 'header',
      height: 36,
      resizable: false,
      cells: headerCells as any,
    };

    const dataRows = rows.map((r, rowIndex) => {
      const isDeleted = deletedIds.has(r.id);
      const isPending = isPendingId(r.id);
      const isDirty = dirtyIds.has(r.id);
      const style: React.CSSProperties = isDeleted
        ? { textDecoration: 'line-through', opacity: 0.65 }
        : {};
      const rowHeight = rowHeights[r.id] ?? DEFAULT_ROW_HEIGHT;

      const cells: any[] = [
        {
          type: 'rowNumber',
          rowIndex: rowIndex + 1,
          rowId: r.id,
          isDirty,
        } as RowNumberCell,
        {
          type: 'deleteButton',
          rowId: r.id,
          isDeleted,
          showRemove: isPending,
        } as DeleteButtonCell,
        {
          type: 'textWithSpeech',
          rowId: r.id,
          field: 'title',
          text: r.title ?? '',
          style,
          multiline: true,
          rowHeight,
        } as TextWithSpeechCell,
        {
          type: 'textWithSpeech',
          rowId: r.id,
          field: ACCEPTANCE_CRITERIA_COLUMN_ID,
          text: r.acceptanceCriteria ?? '',
          style,
          multiline: true,
          rowHeight,
        } as TextWithSpeechCell,
        {
          type: 'textWithSpeech',
          rowId: r.id,
          field: CHECKLIST_COLUMN_ID,
          text: formatCellValue(r.checklist),
          style,
          multiline: true,
          rowHeight,
        } as TextWithSpeechCell,
      ];

      if (templateFields?.length) {
        templateFields
          .filter((f) => f.id !== ACCEPTANCE_CRITERIA_COLUMN_ID && f.id !== CHECKLIST_COLUMN_ID)
          .forEach((f) => {
            if (f.type === 'SELECT') {
              const opts = f.options ?? [];
              cells.push({
                type: 'dropdown',
                rowId: r.id,
                fieldId: f.id,
                value: String(r[f.id] ?? (opts[0] ?? '')),
                options: opts,
                style,
              } as DropdownCell);
            } else {
              const multiline = f.type === 'TEXTAREA';
              cells.push({
                type: 'textWithSpeech',
                rowId: r.id,
                field: f.id,
                text: formatCellValue(r[f.id]),
                style,
                multiline,
                rowHeight: multiline ? rowHeight : undefined,
              } as TextWithSpeechCell);
            }
          });
      } else {
        const testTypeValue =
          r.testType && (TEST_TYPE_OPTIONS as readonly string[]).includes(r.testType)
            ? r.testType
            : 'Functional';
        cells.push(
          {
            type: 'textWithSpeech',
            rowId: r.id,
            field: 'preconditions',
            text: r.preconditions ?? '',
            style,
            multiline: true,
            rowHeight,
          } as TextWithSpeechCell,
          {
            type: 'textWithSpeech',
            rowId: r.id,
            field: 'steps',
            text: r.steps ?? '',
            style,
            multiline: true,
            rowHeight,
          } as TextWithSpeechCell,
          {
            type: 'textWithSpeech',
            rowId: r.id,
            field: 'expectedResult',
            text: r.expectedResult ?? '',
            style,
            multiline: true,
            rowHeight,
          } as TextWithSpeechCell,
          {
            type: 'testTypeDropdown',
            rowId: r.id,
            value: testTypeValue,
            style,
          } as TestTypeDropdownCell,
        );
      }

      return {
        rowId: r.id,
        height: rowHeight,
        resizable: true,
        cells,
      } as unknown as Row;
    });

    return [headerRow, ...dataRows];
  // eslint-disable-next-line react-hooks/exhaustive-deps -- aiLoadingRowId needed so star spinner re-renders
  }, [rows, deletedIds, dirtyIds, rowHeights, templateFields, aiLoadingRowId]);

  const handleCellsChanged = useCallback(
    (changes: CellChange[]) => {
      for (const ch of changes) {
        if (ch.rowId === 'header') continue;
        const c = ch as unknown as {
          type: string;
          rowId: Id;
          newCell: { field?: string; fieldId?: string; text?: string; value?: string };
        };
        if (c.type === 'textWithSpeech' && c.newCell?.field != null) {
          handleFieldChange(String(c.rowId), c.newCell.field, c.newCell.text ?? '');
        }
        if (c.type === 'testTypeDropdown' && c.newCell?.value != null) {
          handleTestTypeChange(String(c.rowId), c.newCell.value);
        }
        if (c.type === 'dropdown' && c.newCell?.fieldId != null && c.newCell?.value != null) {
          handleTemplateFieldChange(String(c.rowId), c.newCell.fieldId, c.newCell.value);
        }
      }
    },
    [handleFieldChange, handleTestTypeChange, handleTemplateFieldChange],
  );

  const handleColumnResized = useCallback((columnId: Id, width: number) => {
    setColumnWidths((prev) => ({ ...prev, [String(columnId)]: width }));
  }, []);

  const handleRowResized = useCallback((rowId: Id, height: number) => {
    setRowHeights((prev) => ({ ...prev, [String(rowId)]: height }));
  }, []);

  if (!taskId) return null;
  if (loading || (templateId && templateLoading)) return <Spinner />;
  if (error) {
    return (
      <div className="mt-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
          <h5 className="mb-0">
          <i className="fas fa-vial me-2" />
          {childType === 'BUG'
            ? 'Bugs'
            : childType === 'TEST_CASE'
              ? i18n('entities.testCase.menu')
              : childType === 'USER_STORY'
                ? 'User Stories'
                : 'Tasks'}{' '}
          — {i18n('entities.task.view.title')}
        </h5>
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-outline-success btn-sm"
            onClick={handleAddRow}
            title={childType === 'BUG' ? 'Add bug row' : 'Add test case row'}
          >
            <i className="fas fa-plus me-1" />
            Add row
          </button>
          <button
            type="button"
            className="btn btn-outline-warning btn-sm"
            disabled={aiLoading || !taskTitle?.trim() || childType === 'BUG'}
            onClick={handleAiGenerate}
            title={
              childType === 'USER_STORY'
                ? 'Generate user stories with AI'
                : childType === 'TASK'
                  ? 'Generate tasks with AI'
                  : childType === 'BUG'
                    ? 'Add bug rows manually'
                    : 'Generate test cases with AI'
            }
          >
            {aiLoading ? (
              <i className="fas fa-spinner fa-spin me-1" />
            ) : (
              <i className="fas fa-star me-1" />
            )}
            {aiLoading
              ? 'Generating…'
              : childType === 'USER_STORY'
                ? 'Generate user stories'
                : childType === 'TASK'
                  ? 'Generate tasks'
                  : childType === 'BUG'
                    ? 'Add bug'
                    : 'Generate test cases'}
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={saving || !rows.length || !projectId}
            onClick={handleSave}
          >
            {saving ? (
              <i className="fas fa-spinner fa-spin me-1" />
            ) : (
              <i className="fas fa-save me-1" />
            )}
            {saving ? 'Saving…' : `Save changes${dirtyIds.size > 0 ? ` (${dirtyIds.size})` : ''}`}
          </button>
        </div>
      </div>
      <div
        className="border rounded reactgrid-wrapper"
        style={{
          height: 'min(400px, 50vh)',
          minHeight: 200,
          overflow: 'auto',
          position: 'relative',
        }}
      >
        <ReactGrid
          columns={columns}
          rows={gridRows}
          onCellsChanged={handleCellsChanged}
          onColumnResized={handleColumnResized}
          onRowResized={handleRowResized}
          minRowHeight={40}
          enableRangeSelection
          enableColumnResizeOnAllHeaders
          stickyTopRows={1}
          customCellTemplates={{
            rowNumber: rowNumberTemplate,
            deleteButton: deleteButtonTemplate,
            textWithSpeech: textWithSpeechTemplate,
            testTypeDropdown: testTypeDropdownTemplate,
            dropdown: dropdownTemplate,
          }}
        />
      </div>
    </div>
  );
};

export default SubtaskExcelView;