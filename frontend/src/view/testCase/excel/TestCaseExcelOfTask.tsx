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
import '../../project/planner/planView/ProjectTimePlanExcel.css';
import { i18n } from 'src/i18n';
import TaskService from 'src/modules/task/taskService';
import Spinner from 'src/view/shared/Spinner';
import Errors from 'src/modules/shared/error/errors';
import AiAgentService from 'src/modules/aiAgent/aiAgentService';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

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

export type TestCaseRow = {
  id: string;
  task?: string;
  title?: string;
  preconditions?: string;
  steps?: string;
  expectedResult?: string;
  testType?: string;
};

const STORAGE_KEY_PREFIX = 'testCaseExcelDrafts:';

function getStorageKey(taskId: string): string {
  return `${STORAGE_KEY_PREFIX}${taskId}`;
}

type StoredDraft = {
  pending: TestCaseRow[];
  overrides: Record<string, { title?: string; preconditions?: string; steps?: string; expectedResult?: string; testType?: string }>;
  dirtyIds?: string[];
};

function loadDraftFromStorage(taskId: string): StoredDraft {
  try {
    const raw = localStorage.getItem(getStorageKey(taskId));
    if (!raw) return { pending: [], overrides: {} };
    const parsed = JSON.parse(raw) as StoredDraft;
    return {
      pending: Array.isArray(parsed?.pending) ? parsed.pending : [],
      overrides: parsed?.overrides && typeof parsed.overrides === 'object' ? parsed.overrides : {},
      dirtyIds: Array.isArray(parsed?.dirtyIds) ? parsed.dirtyIds : undefined,
    };
  } catch {
    return { pending: [], overrides: {}, dirtyIds: undefined };
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
  field: 'title' | 'preconditions' | 'steps' | 'expectedResult';
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

function createTextWithSpeechTemplate(
  getStateRef: React.MutableRefObject<
    () => { listening: boolean; dictatingFor: { rowId: string; field: string } | null }
  >,
  onChangeRef: React.MutableRefObject<
    ((rowId: string, field: 'title' | 'preconditions' | 'steps' | 'expectedResult', text: string) => void) | null
  >,
  onMicClickRef: React.MutableRefObject<
    ((rowId: string, field: 'title' | 'preconditions' | 'steps' | 'expectedResult') => void) | null
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
          target.setSelectionRange(start + text.length, start + text.length);
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
const DEFAULT_COLUMN_WIDTHS: Record<string, number> = {
  [ROW_NUM_COLUMN_ID]: 44,
  [DELETE_COLUMN_ID]: 80,
  [TITLE_COLUMN_ID]: 200,
  [PRECONDITIONS_COLUMN_ID]: 200,
  [STEPS_COLUMN_ID]: 240,
  [EXPECTED_RESULT_COLUMN_ID]: 200,
  [TEST_TYPE_COLUMN_ID]: 120,
};

const COLUMN_IDS = [
  ROW_NUM_COLUMN_ID,
  DELETE_COLUMN_ID,
  TITLE_COLUMN_ID,
  PRECONDITIONS_COLUMN_ID,
  STEPS_COLUMN_ID,
  EXPECTED_RESULT_COLUMN_ID,
  TEST_TYPE_COLUMN_ID,
] as const;

type Props = {
  taskId: string | undefined;
  projectId?: string | null;
  /** Project's test case template id; when set, new TEST_CASE tasks are created with this template */
  testCaseTemplateId?: string | null;
  taskTitle?: string;
  taskDescription?: string;
};

const TestCaseExcelOfTask = ({
  taskId,
  projectId,
  testCaseTemplateId,
  taskTitle = '',
  taskDescription = '',
}: Props) => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<TestCaseRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(() => new Set());
  const [deletedIds, setDeletedIds] = useState<Set<string>>(() => new Set());
  const [aiLoading, setAiLoading] = useState(false);
  const [aiLoadingRowId, setAiLoadingRowId] = useState<string | null>(null);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => ({
    ...DEFAULT_COLUMN_WIDTHS,
  }));
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
    ((rowId: string, field: 'title' | 'preconditions' | 'steps' | 'expectedResult', text: string) => void) | null
  >(null);
  const onMicClickRef = useRef<
    ((rowId: string, field: 'title' | 'preconditions' | 'steps' | 'expectedResult') => void) | null
  >(null);
  const onStarClickRef = useRef<((rowId: string) => void) | null>(null);
  const starLoadingRowIdRef = useRef<string | null>(null);
  const onTestTypeChangeRef = useRef<((rowId: string, value: string) => void) | null>(null);
  const browserSupportsSpeechRef = useRef(false);
  browserSupportsSpeechRef.current = browserSupportsSpeechRecognition;
  const rowsRef = useRef<TestCaseRow[]>([]);
  rowsRef.current = rows;

  getSpeechStateRef.current = () => ({ listening, dictatingFor });
  starLoadingRowIdRef.current = aiLoadingRowId;

  const persistDraft = useCallback(
    (tid: string | undefined, currentRows: TestCaseRow[]) => {
      if (!tid) return;
      const pending = currentRows.filter((r) => isPendingId(r.id));
      const saved = currentRows.filter((r) => !isPendingId(r.id));
      const dirty = dirtyIdsRef.current ?? new Set<string>();
      const overrides: Record<string, { title?: string; preconditions?: string; steps?: string; expectedResult?: string; testType?: string }> = {};
      saved.forEach((r) => {
        if (!dirty.has(r.id)) return;
        overrides[r.id] = {
          title: r.title,
          preconditions: r.preconditions,
          steps: r.steps,
          expectedResult: r.expectedResult,
          testType: r.testType,
        };
      });
      const dirtyIdsList = Array.from(dirty);
      saveDraftToStorage(tid, { pending, overrides, dirtyIds: dirtyIdsList });
    },
    [],
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
    (rowId: string, field: 'title' | 'preconditions' | 'steps' | 'expectedResult', text: string) => {
      setRows((prev) => {
        const next = prev.map((r) =>
          r.id === rowId ? { ...r, [field]: text } : r,
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

  const handleMicClick = useCallback(
    (rowId: string, field: 'title' | 'preconditions' | 'steps' | 'expectedResult') => {
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

  const handleStarClick = useCallback(
    async (rowId: string) => {
      if (!taskId || !taskTitle?.trim()) return;
      const row = rows.find((r) => r.id === rowId);
      if (!row) return;
      setAiLoadingRowId(rowId);
      setError(null);
      try {
        const data = await AiAgentService.suggestTestCasesForTask(taskTitle.trim(), {
          taskDescription: taskDescription?.trim() || undefined,
        });
        const list = data?.testCases ?? [];
        const first = list[0];
        if (first) {
          const updated: TestCaseRow = {
            ...row,
            title: first.title ?? row.title ?? 'Test case',
            preconditions: row.preconditions ?? '',
            steps: first.steps ?? row.steps ?? '',
            expectedResult: first.expectedResult ?? row.expectedResult ?? '',
            testType: row.testType ?? 'Functional',
          };
          setRows((prev) => {
            const next = prev.map((r) => (r.id === rowId ? updated : r));
            persistDraft(taskId, next);
            return next;
          });
          setDirtyIds((prev) => new Set(prev).add(rowId));
        }
      } catch (e) {
        Errors.handle(e);
        setError((e as Error)?.message ?? 'AI refine failed');
      } finally {
        setAiLoadingRowId(null);
      }
    },
    [taskId, taskTitle, taskDescription, rows, persistDraft],
  );

  useEffect(() => {
    onChangeRef.current = handleFieldChange;
    onMicClickRef.current = handleMicClick;
    onStarClickRef.current = handleStarClick;
    onTestTypeChangeRef.current = handleTestTypeChange;
  });

  const loadRows = useCallback(() => {
    if (!taskId) return;
    setLoading(true);
    setError(null);
    TaskService.list({ type: 'TEST_CASE', parents: taskId }, undefined, 500, 0)
      .then((res: { rows?: any[] }) => {
        const taskRows = res.rows ?? [];
        const td = (t: any) => t.templateData ?? {};
        const serverRows: TestCaseRow[] = taskRows.map((t: any) => ({
          id: t.id,
          task: taskId,
          title: t.title ?? '',
          preconditions: (td(t).preconditions ?? '') as string,
          steps: (td(t).testSteps ?? td(t).steps ?? '') as string,
          expectedResult: (td(t).expectedResult ?? '') as string,
          testType: (td(t).testType ?? 'Functional') as string,
        }));
        const draft = loadDraftFromStorage(taskId);
        const overridden = serverRows.map((r) => ({
          ...r,
          title: draft.overrides[r.id]?.title ?? r.title,
          preconditions: draft.overrides[r.id]?.preconditions ?? r.preconditions,
          steps: draft.overrides[r.id]?.steps ?? r.steps,
          expectedResult: draft.overrides[r.id]?.expectedResult ?? r.expectedResult,
          testType: draft.overrides[r.id]?.testType ?? r.testType,
        }));
        const merged = [...overridden, ...draft.pending];
        lastSavedRowsRef.current = new Map(merged.map((r) => [r.id, { ...r }]));
        setRows(merged);
        setDirtyIds(new Set(draft.dirtyIds ?? Object.keys(draft.overrides ?? {})));
        setDeletedIds(new Set());
      })
      .catch((e) => setError((e as Error)?.message ?? 'Failed to load test cases'))
      .finally(() => setLoading(false));
  }, [taskId]);

  useEffect(() => {
    if (!taskId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    TaskService.list({ type: 'TEST_CASE', parents: taskId }, undefined, 500, 0)
      .then((res: { rows?: any[] }) => {
        if (!cancelled) {
          const taskRows = res.rows ?? [];
          const td = (t: any) => t.templateData ?? {};
          const serverRows: TestCaseRow[] = taskRows.map((t: any) => ({
            id: t.id,
            task: taskId,
            title: t.title ?? '',
            preconditions: (td(t).preconditions ?? '') as string,
            steps: (td(t).testSteps ?? td(t).steps ?? '') as string,
            expectedResult: (td(t).expectedResult ?? '') as string,
            testType: (td(t).testType ?? 'Functional') as string,
          }));
          const draft = loadDraftFromStorage(taskId);
          const overridden = serverRows.map((r) => ({
            ...r,
            title: draft.overrides[r.id]?.title ?? r.title,
            preconditions: draft.overrides[r.id]?.preconditions ?? r.preconditions,
            steps: draft.overrides[r.id]?.steps ?? r.steps,
            expectedResult: draft.overrides[r.id]?.expectedResult ?? r.expectedResult,
            testType: draft.overrides[r.id]?.testType ?? r.testType,
          }));
          const merged = [...overridden, ...draft.pending];
          lastSavedRowsRef.current = new Map(merged.map((r) => [r.id, { ...r }]));
          setRows(merged);
          setDirtyIds(new Set(draft.dirtyIds ?? Object.keys(draft.overrides ?? {})));
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
  }, [taskId]);

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
    const newRow: TestCaseRow = {
      id: makePendingId(),
      task: taskId,
      title: '',
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
  }, [taskId, persistDraft]);

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
      const data = await AiAgentService.suggestTestCasesForTask(taskTitle.trim(), {
        taskDescription: taskDescription?.trim() || undefined,
      });
      const list = data?.testCases ?? [];
      const newRows: TestCaseRow[] = list.map((t) => ({
        id: makePendingId(),
        task: taskId,
        title: t.title ?? 'Test case',
        preconditions: '',
        steps: t.steps ?? '',
        expectedResult: t.expectedResult ?? '',
        testType: 'Functional',
      }));
      if (newRows.length > 0) {
        newRows.forEach((row) => lastSavedRowsRef.current.set(row.id, { ...row }));
        setRows((prev) => {
          const next = [...prev, ...newRows];
          persistDraft(taskId, next);
          return next;
        });
      }
    } catch (e) {
      Errors.handle(e);
      setError((e as Error)?.message ?? 'AI request failed');
    } finally {
      setAiLoading(false);
    }
  }, [taskId, taskTitle, taskDescription, persistDraft]);

  const handleSave = useCallback(async () => {
    if (!taskId || !projectId || !rows.length) return;
    setSaving(true);
    try {
      const pending = rows.filter((r) => isPendingId(r.id) && !deletedIds.has(r.id));
      const toCreatePayloads = pending.map((r) => ({
        type: 'TEST_CASE',
        ...(testCaseTemplateId && { template: testCaseTemplateId }),
        title: r.title ?? '',
        templateData: {
          preconditions: r.preconditions ?? '',
          testSteps: r.steps ?? '',
          expectedResult: r.expectedResult ?? '',
          testType: r.testType ?? 'Functional',
        },
        parents: [taskId],
      }));

      const existing = rows.filter((r) => !isPendingId(r.id));
      const toUpdate = existing.filter(
        (r) => dirtyIds.has(r.id) && !deletedIds.has(r.id),
      );
      const toDelete = Array.from(deletedIds).filter((id) => !isPendingId(id));

      if (toCreatePayloads.length > 0) {
        if (testCaseTemplateId && toCreatePayloads.every((p) => p.template)) {
          await TaskService.bulkCreate(projectId, toCreatePayloads);
        } else {
          for (const p of toCreatePayloads) {
            await TaskService.create({
              type: 'TEST_CASE',
              project: projectId,
              ...(testCaseTemplateId && { template: testCaseTemplateId }),
              parents: [taskId],
              title: p.title,
              templateData: p.templateData,
            });
          }
        }
      }
      for (const r of toUpdate) {
        await TaskService.update(r.id, {
          title: r.title,
          templateData: {
            preconditions: r.preconditions ?? '',
            testSteps: r.steps ?? '',
            expectedResult: r.expectedResult ?? '',
            testType: r.testType ?? 'Functional',
          },
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
  }, [taskId, projectId, testCaseTemplateId, rows, dirtyIds, deletedIds, loadRows]);

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

  const rowNumberTemplate = useMemo(() => createRowNumberTemplate(onUndoRowRef), []);

  const columns = useMemo<Column[]>(
    () =>
      COLUMN_IDS.map((id) => ({
        columnId: id,
        width: columnWidths[id] ?? DEFAULT_COLUMN_WIDTHS[id],
        resizable: id !== DELETE_COLUMN_ID && id !== ROW_NUM_COLUMN_ID,
      })),
    [columnWidths],
  );

  const gridRows = useMemo((): Row[] => {
    const headerRow: Row = {
      rowId: 'header',
      height: 36,
      resizable: false,
      cells: [
        { type: 'header', text: '#' } as HeaderCell,
        { type: 'header', text: '' } as HeaderCell,
        { type: 'header', text: i18n('entities.testCase.fields.title') } as HeaderCell,
        { type: 'header', text: 'Preconditions' } as HeaderCell,
        { type: 'header', text: 'Test Steps' } as HeaderCell,
        { type: 'header', text: 'Expected Result' } as HeaderCell,
        { type: 'header', text: 'Test Type' } as HeaderCell,
      ],
    };

    const dataRows = rows.map((r, rowIndex) => {
      const isDeleted = deletedIds.has(r.id);
      const isPending = isPendingId(r.id);
      const isDirty = dirtyIds.has(r.id);
      const style: React.CSSProperties = isDeleted
        ? { textDecoration: 'line-through', opacity: 0.65 }
        : {};
      const rowHeight = rowHeights[r.id] ?? DEFAULT_ROW_HEIGHT;
      const testTypeValue =
        r.testType && (TEST_TYPE_OPTIONS as readonly string[]).includes(r.testType)
          ? r.testType
          : 'Functional';

      return {
        rowId: r.id,
        height: rowHeight,
        resizable: true,
        cells: [
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
        ],
      } as unknown as Row;
    });

    return [headerRow, ...dataRows];
  // eslint-disable-next-line react-hooks/exhaustive-deps -- aiLoadingRowId needed so star spinner re-renders
  }, [rows, deletedIds, dirtyIds, rowHeights, aiLoadingRowId]);

  const handleCellsChanged = useCallback(
    (changes: CellChange[]) => {
      for (const ch of changes) {
        if (ch.rowId === 'header') continue;
        const c = ch as unknown as {
          type: string;
          rowId: Id;
          newCell: { field?: string; text?: string; value?: string };
        };
        if (c.type === 'textWithSpeech' && c.newCell?.field) {
          const field = c.newCell.field as 'title' | 'preconditions' | 'steps' | 'expectedResult';
          handleFieldChange(String(c.rowId), field, c.newCell.text ?? '');
        }
        if (c.type === 'testTypeDropdown' && c.newCell?.value != null) {
          handleTestTypeChange(String(c.rowId), c.newCell.value);
        }
      }
    },
    [handleFieldChange, handleTestTypeChange],
  );

  const handleColumnResized = useCallback((columnId: Id, width: number) => {
    setColumnWidths((prev) => ({ ...prev, [String(columnId)]: width }));
  }, []);

  const handleRowResized = useCallback((rowId: Id, height: number) => {
    setRowHeights((prev) => ({ ...prev, [String(rowId)]: height }));
  }, []);

  if (!taskId) return null;
  if (loading) return <Spinner />;
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
          {i18n('entities.testCase.menu')} — {i18n('entities.task.view.title')}
        </h5>
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-outline-success btn-sm"
            onClick={handleAddRow}
            title="Add test case row"
          >
            <i className="fas fa-plus me-1" />
            Add row
          </button>
          <button
            type="button"
            className="btn btn-outline-warning btn-sm"
            disabled={aiLoading || !taskTitle?.trim()}
            onClick={handleAiGenerate}
            title="Generate test cases with AI"
          >
            {aiLoading ? (
              <i className="fas fa-spinner fa-spin me-1" />
            ) : (
              <i className="fas fa-star me-1" />
            )}
            {aiLoading ? 'Generating…' : 'Generate with AI'}
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
          }}
        />
      </div>
    </div>
  );
};

export default TestCaseExcelOfTask;
