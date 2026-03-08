import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactGrid,
  Column,
  Row,
  HeaderCell,
  CellChange,
  Id,
  TextCell,
  DropdownCell,
  CellTemplate,
  Compatible,
  Uncertain,
  CellStyle,
} from '@silevis/reactgrid';
import '@silevis/reactgrid/styles.css';
import '../../project/planner/planView/ProjectTimePlanExcel.css';
import { i18n } from 'src/i18n';
import TestCycleService from 'src/modules/testCycle/testCycleService';
import Spinner from 'src/view/shared/Spinner';
import Errors from 'src/modules/shared/error/errors';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const RESULT_OPTIONS = [
  { value: 'PASS', label: 'PASS' },
  { value: 'FAIL', label: 'FAIL' },
  { value: 'DO IT LATER', label: 'DO IT LATER' },
];

const TEST_CASE_COLUMN_ID = 'testCase';
const STEPS_COLUMN_ID = 'steps';
const EXPECTED_RESULT_COLUMN_ID = 'expectedResult';
const RESULT_COLUMN_ID = 'result';
const OUTCOME_COLUMN_ID = 'outcome';

const DEFAULT_ROW_HEIGHT = 88;
const DEFAULT_COLUMN_WIDTHS: Record<string, number> = {
  [TEST_CASE_COLUMN_ID]: 220,
  [STEPS_COLUMN_ID]: 220,
  [EXPECTED_RESULT_COLUMN_ID]: 200,
  [RESULT_COLUMN_ID]: 100,
  [OUTCOME_COLUMN_ID]: 260,
};

const COLUMN_IDS = [
  TEST_CASE_COLUMN_ID,
  STEPS_COLUMN_ID,
  EXPECTED_RESULT_COLUMN_ID,
  RESULT_COLUMN_ID,
  OUTCOME_COLUMN_ID,
] as const;

const STORAGE_KEY_PREFIX = 'testCycleResultDrafts:';

function getStorageKey(testCycleId: string): string {
  return `${STORAGE_KEY_PREFIX}${testCycleId}`;
}

type StoredDraft = Record<string, { result?: string; outcome?: string }>;

function loadDraftFromStorage(testCycleId: string): StoredDraft {
  try {
    const raw = localStorage.getItem(getStorageKey(testCycleId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as StoredDraft;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function mergeRowsWithDraft(
  rows: TestResultRow[],
  draft: StoredDraft,
): TestResultRow[] {
  return rows.map((r) => ({
    ...r,
    result: draft[r.rowId]?.result ?? r.result,
    outcome: draft[r.rowId]?.outcome ?? r.outcome,
  }));
}

function saveDraftToStorage(testCycleId: string, rows: TestResultRow[]): void {
  try {
    const overrides: StoredDraft = {};
    rows.forEach((r) => {
      overrides[r.rowId] = { result: r.result, outcome: r.outcome };
    });
    localStorage.setItem(getStorageKey(testCycleId), JSON.stringify(overrides));
  } catch {
    // ignore
  }
}

function formatMixed(value: any): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map((v) => formatMixed(v)).join('\n');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

type ResultSelectCell = {
  type: 'resultSelect';
  rowId: string;
  selectedValue: string;
};

function createResultSelectTemplate(
  onCellChangedRef: React.MutableRefObject<
    ((rowId: string, selectedValue: string) => void) | null
  >,
): CellTemplate<ResultSelectCell> {
  return {
    getCompatibleCell(uncertain: Uncertain<ResultSelectCell>): Compatible<ResultSelectCell> {
      return {
        ...uncertain,
        rowId: uncertain.rowId ?? '',
        selectedValue: uncertain.selectedValue ?? '',
      } as Compatible<ResultSelectCell>;
    },
    isFocusable: () => true,
    render(
      cell: Compatible<ResultSelectCell>,
      _isInEditMode: boolean,
      onCellChanged: (cell: Compatible<ResultSelectCell>, commit: boolean) => void,
    ) {
      const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        onCellChangedRef.current?.(cell.rowId, value);
        onCellChanged({ ...cell, selectedValue: value }, true);
      };
      return (
        <div
          className="w-100 h-100 d-flex align-items-center p-1"
          onPointerDownCapture={(e) => e.stopPropagation()}
          onMouseDownCapture={(e) => e.stopPropagation()}
          onClickCapture={(e) => e.stopPropagation()}
        >
          <select
            className="form-select form-select-sm"
            value={cell.selectedValue}
            onChange={handleChange}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            style={{ minWidth: 0, width: '100%' }}
          >
            <option value="">--</option>
            {RESULT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );
    },
  };
}

type ReadOnlyMultilineCell = {
  type: 'readOnlyMultiline';
  text: string;
  style?: CellStyle;
};

function createReadOnlyMultilineTemplate(): CellTemplate<ReadOnlyMultilineCell> {
  return {
    getCompatibleCell(uncertain: Uncertain<ReadOnlyMultilineCell>): Compatible<ReadOnlyMultilineCell> {
      return {
        ...uncertain,
        text: uncertain.text ?? '',
      } as Compatible<ReadOnlyMultilineCell>;
    },
    isFocusable: () => false,
    render(cell: Compatible<ReadOnlyMultilineCell>, _isInEditMode: boolean) {
      return (
        <div
          className="w-100 h-100 overflow-auto p-1"
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            minHeight: '100%',
            ...(cell.style as React.CSSProperties),
          }}
        >
          {cell.text || '\u00A0'}
        </div>
      );
    },
  };
}

type TextWithSpeechCell = {
  type: 'textWithSpeech';
  rowId: string;
  field: 'outcome';
  text: string;
  style?: CellStyle;
  multiline?: boolean;
  rowHeight?: number;
};

function OutcomeCellInner(props: {
  cell: Compatible<TextWithSpeechCell>;
  isInEditMode: boolean;
  onCellChanged: (cell: Compatible<TextWithSpeechCell>, commit: boolean) => void;
  getStateRef: React.MutableRefObject<
    () => { listening: boolean; dictatingFor: { rowId: string; field: string } | null }
  >;
  onChangeRef: React.MutableRefObject<
    ((rowId: string, field: 'outcome', text: string) => void) | null
  >;
  onMicClickRef: React.MutableRefObject<((rowId: string, field: 'outcome') => void) | null>;
  browserSupportsSpeechRef: React.MutableRefObject<boolean>;
}) {
  const {
    cell,
    isInEditMode,
    onCellChanged,
    getStateRef,
    onChangeRef,
    onMicClickRef,
    browserSupportsSpeechRef,
  } = props;
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);

  useEffect(() => {
    if (isInEditMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isInEditMode]);

  const state = getStateRef.current?.();
  const listening = state?.listening ?? false;
  const dictatingFor = state?.dictatingFor ?? null;
  const isDictatingThis =
    dictatingFor?.rowId === cell.rowId && dictatingFor?.field === cell.field;
  const showMic = browserSupportsSpeechRef.current;
  const multiline = cell.multiline === true;
  const rowH = cell.rowHeight ?? DEFAULT_ROW_HEIGHT;
  const textareaMinHeight = rowH - 12;

  const handleChange = (value: string) => {
    onChangeRef.current?.(cell.rowId, 'outcome', value);
    onCellChanged({ ...cell, text: value }, true);
  };

  const wrapperRef = useRef<HTMLDivElement>(null);
  const isButtonOrSelect = (el: EventTarget | null) =>
    el && (el as HTMLElement).closest?.('button');
  const handleWrapperCapture = (e: React.PointerEvent | React.MouseEvent) => {
    if (isButtonOrSelect(e.target)) return;
    e.stopPropagation();
    if ('preventDefault' in e) e.preventDefault();
    inputRef.current?.focus();
  };
  const handleClickCapture = (e: React.MouseEvent) => {
    if (isButtonOrSelect(e.target)) return;
    e.stopPropagation();
  };

  return (
    <div
      ref={wrapperRef}
      className="d-flex align-items-start gap-1 w-100 h-100"
      style={{ minWidth: 0, ...(cell.style as React.CSSProperties) }}
      onPointerDownCapture={handleWrapperCapture}
      onMouseDownCapture={handleWrapperCapture}
      onClickCapture={handleClickCapture}
    >
      {multiline ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          className="form-control form-control-sm border-0 bg-transparent flex-grow-1"
          style={{ minWidth: 0, resize: 'none', minHeight: textareaMinHeight }}
          value={cell.text}
          onChange={(e) => handleChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          rows={3}
        />
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          className="form-control form-control-sm border-0 bg-transparent h-100 flex-grow-1"
          style={{ minWidth: 0 }}
          value={cell.text}
          onChange={(e) => handleChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        />
      )}
      {showMic && (
        <button
          type="button"
          className={`btn btn-sm btn-link p-0 border-0 flex-shrink-0 ${isDictatingThis && listening ? 'text-danger' : 'text-secondary'}`}
          style={{ minWidth: 22 }}
          title={
            listening && isDictatingThis
              ? 'Stop listening'
              : 'Dictate outcome (speech to text)'
          }
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onMicClickRef.current?.(cell.rowId, 'outcome');
          }}
        >
          <i className={`fas fa-microphone${listening && isDictatingThis ? '-slash' : ''}`} />
        </button>
      )}
    </div>
  );
}

function createTextWithSpeechTemplate(
  getStateRef: React.MutableRefObject<
    () => { listening: boolean; dictatingFor: { rowId: string; field: string } | null }
  >,
  onChangeRef: React.MutableRefObject<
    ((rowId: string, field: 'outcome', text: string) => void) | null
  >,
  onMicClickRef: React.MutableRefObject<
    ((rowId: string, field: 'outcome') => void) | null
  >,
  browserSupportsSpeechRef: React.MutableRefObject<boolean>,
): CellTemplate<TextWithSpeechCell> {
  return {
    getCompatibleCell(uncertain: Uncertain<TextWithSpeechCell>): Compatible<TextWithSpeechCell> {
      return {
        ...uncertain,
        text: uncertain.text ?? '',
        rowId: uncertain.rowId ?? '',
        field: uncertain.field ?? 'outcome',
        multiline: uncertain.multiline === true,
        rowHeight: uncertain.rowHeight,
      } as Compatible<TextWithSpeechCell>;
    },
    isFocusable: () => true,
    render(
      cell: Compatible<TextWithSpeechCell>,
      isInEditMode: boolean,
      onCellChanged: (cell: Compatible<TextWithSpeechCell>, commit: boolean) => void,
    ) {
      return (
        <OutcomeCellInner
          cell={cell}
          isInEditMode={isInEditMode}
          onCellChanged={onCellChanged}
          getStateRef={getStateRef}
          onChangeRef={onChangeRef}
          onMicClickRef={onMicClickRef}
          browserSupportsSpeechRef={browserSupportsSpeechRef}
        />
      );
    },
  };
}

export type TestResultRow = {
  rowId: string;
  testCaseId: string;
  testCaseTitle: string;
  steps: string;
  expectedResult: string;
  result: string;
  outcome: string;
  testedBy?: string;
};

function testResultsToRows(testResults: any[]): TestResultRow[] {
  if (!Array.isArray(testResults)) return [];
  return testResults.map((tr, i) => {
    const task = tr.task;
    const testCaseId =
      typeof task === 'object' && task?.id
        ? task.id
        : typeof task === 'string'
          ? task
          : `unknown-${i}`;
    const testCaseTitle =
      typeof task === 'object' && task?.title
        ? task.title
        : typeof task === 'string'
          ? task
          : '';
    const td = typeof task === 'object' ? task?.templateData : undefined;
    const steps = formatMixed(td?.testSteps ?? td?.steps);
    const expectedResult = formatMixed(td?.expectedResult);
    const testedBy =
      typeof tr.testedBy === 'object' && tr.testedBy?.id
        ? tr.testedBy.id
        : typeof tr.testedBy === 'string'
          ? tr.testedBy
          : undefined;
    return {
      rowId: testCaseId,
      testCaseId,
      testCaseTitle: testCaseTitle || `Test case ${i + 1}`,
      steps,
      expectedResult,
      result: tr.result ?? '',
      outcome: tr.outcome ?? '',
      testedBy,
    };
  });
}

function rowsToTestResults(rows: TestResultRow[]): Array<{
  task: string;
  result?: string;
  outcome?: string;
  testedBy?: string;
}> {
  return rows.map((r) => ({
    task: r.testCaseId,
    result: r.result || undefined,
    outcome: r.outcome || undefined,
    testedBy: r.testedBy || undefined,
  }));
}

type Props = {
  testCycleId: string | undefined;
};

const TestResultExcelView = ({ testCycleId }: Props) => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<TestResultRow[]>([]);
  const [initialRows, setInitialRows] = useState<TestResultRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
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

  const getSpeechStateRef = useRef<
    () => { listening: boolean; dictatingFor: { rowId: string; field: string } | null }
  >(() => ({ listening: false, dictatingFor: null }));
  const onChangeRef = useRef<((rowId: string, field: 'outcome', text: string) => void) | null>(null);
  const onMicClickRef = useRef<((rowId: string, field: 'outcome') => void) | null>(null);
  const resultSelectChangeRef = useRef<((rowId: string, selectedValue: string) => void) | null>(null);
  const browserSupportsSpeechRef = useRef(false);
  browserSupportsSpeechRef.current = browserSupportsSpeechRecognition;
  getSpeechStateRef.current = () => ({ listening, dictatingFor });

  const loadData = useCallback(
    (showLoading = true, clearDraft = false) => {
      if (!testCycleId) return;
      if (showLoading) {
        setLoading(true);
        setError(null);
      }
      TestCycleService.find(testCycleId)
        .then((record: any) => {
          const list = record?.testResults ?? [];
          const serverRows = testResultsToRows(list);
          const draft = clearDraft ? {} : loadDraftFromStorage(testCycleId);
          const merged = mergeRowsWithDraft(serverRows, draft);
          setRows(merged);
          setInitialRows(serverRows); // baseline for dirtyCount is server state, not merged
        })
        .catch((e) => {
          Errors.handle(e);
          setError((e as Error)?.message ?? 'Failed to load test results');
        })
        .finally(() => setLoading(false));
    },
    [testCycleId],
  );

  useEffect(() => {
    if (!testCycleId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    TestCycleService.find(testCycleId)
      .then((record: any) => {
        if (!cancelled) {
          const list = record?.testResults ?? [];
          const serverRows = testResultsToRows(list);
          const draft = loadDraftFromStorage(testCycleId);
          const merged = mergeRowsWithDraft(serverRows, draft);
          setRows(merged);
          setInitialRows(serverRows); // baseline for dirtyCount is server state, not merged
        }
      })
      .catch((e) => {
        if (!cancelled) {
          Errors.handle(e);
          setError((e as Error)?.message ?? 'Failed to load test results');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [testCycleId]);

  useEffect(() => {
    if (!testCycleId || !rows.length) return;
    saveDraftToStorage(testCycleId, rows);
  }, [testCycleId, rows]);

  useEffect(() => {
    if (!listening && dictatingFor != null && transcript.trim()) {
      const { rowId, field } = dictatingFor;
      if (field === 'outcome') {
        const value = transcript.trim();
        setRows((prev) =>
          prev.map((r) => (r.rowId !== rowId ? r : { ...r, outcome: value })),
        );
      }
      setDictatingFor(null);
      resetTranscript();
    }
  }, [listening, dictatingFor, transcript, resetTranscript]);

  const handleOutcomeChange = useCallback((rowId: string, _field: 'outcome', text: string) => {
    setRows((prev) =>
      prev.map((r) => (r.rowId !== rowId ? r : { ...r, outcome: text })),
    );
  }, []);

  const handleResultChange = useCallback((rowId: string, selectedValue: string) => {
    setRows((prev) =>
      prev.map((r) => (r.rowId !== rowId ? r : { ...r, result: selectedValue })),
    );
  }, []);

  const handleMicClick = useCallback((rowId: string, field: 'outcome') => {
    if (listening) {
      if (dictatingFor?.rowId === rowId && dictatingFor?.field === field) {
        SpeechRecognition.stopListening();
      }
      return;
    }
    setDictatingFor({ rowId, field });
    resetTranscript();
    SpeechRecognition.startListening({ continuous: false, language: 'en-US' });
  }, [listening, dictatingFor, resetTranscript]);

  useEffect(() => {
    onChangeRef.current = handleOutcomeChange;
    onMicClickRef.current = handleMicClick;
    resultSelectChangeRef.current = handleResultChange;
  });

  const handleCellsChanged = useCallback((changes: CellChange[]) => {
    setRows((prev) => {
      const next = [...prev];
      for (const ch of changes) {
        if (ch.rowId === 'header') continue;
        const rowIdx = next.findIndex((r) => String(r.rowId) === String(ch.rowId));
        if (rowIdx < 0) continue;
        const colId = String(ch.columnId);
        const newCell = (ch as any).newCell;
        if (colId === RESULT_COLUMN_ID) {
          if (newCell?.type === 'resultSelect' && 'selectedValue' in newCell) {
            next[rowIdx] = {
              ...next[rowIdx],
              result: (newCell as ResultSelectCell).selectedValue ?? '',
            };
          } else if (newCell?.type === 'dropdown') {
            next[rowIdx] = {
              ...next[rowIdx],
              result: (newCell as DropdownCell).selectedValue ?? '',
            };
          }
        }
        if (colId === OUTCOME_COLUMN_ID) {
          if (newCell?.type === 'text') {
            next[rowIdx] = {
              ...next[rowIdx],
              outcome: (newCell as TextCell).text ?? '',
            };
          } else if (newCell?.type === 'textWithSpeech' && 'text' in newCell) {
            next[rowIdx] = {
              ...next[rowIdx],
              outcome: (newCell as TextWithSpeechCell).text ?? '',
            };
          }
        }
      }
      return next;
    });
  }, []);

  const handleColumnResized = useCallback((columnId: Id, width: number) => {
    setColumnWidths((prev) => ({ ...prev, [String(columnId)]: width }));
  }, []);

  const handleRowResized = useCallback((rowId: Id, height: number) => {
    setRowHeights((prev) => ({ ...prev, [String(rowId)]: height }));
  }, []);

  const textWithSpeechTemplate = useMemo(
    () =>
      createTextWithSpeechTemplate(
        getSpeechStateRef,
        onChangeRef,
        onMicClickRef,
        browserSupportsSpeechRef,
      ),
    [],
  );

  const resultSelectTemplate = useMemo(
    () => createResultSelectTemplate(resultSelectChangeRef),
    [],
  );

  const readOnlyMultilineTemplate = useMemo(() => createReadOnlyMultilineTemplate(), []);

  const handleSave = useCallback(async () => {
    if (!testCycleId || !rows.length) return;
    setSaving(true);
    setError(null);
    try {
      const testResults = rowsToTestResults(rows);
      await TestCycleService.update(testCycleId, { testResults });
      try {
        localStorage.removeItem(getStorageKey(testCycleId));
      } catch {
        // ignore
      }
      loadData(false, true);
    } catch (e) {
      Errors.handle(e);
      setError((e as Error)?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  }, [testCycleId, rows, loadData]);

  const dirtyCount = useMemo(() => {
    const initialByRowId = new Map(initialRows.map((r) => [r.rowId, r]));
    return rows.filter((r) => {
      const init = initialByRowId.get(r.rowId);
      if (!init) return false;
      return init.result !== r.result || init.outcome !== r.outcome;
    }).length;
  }, [rows, initialRows]);

  const saveButtonLabel = saving ? 'Saving…' : `Save changes${dirtyCount > 0 ? ` (${dirtyCount})` : ''}`;

  const columns = useMemo<Column[]>(
    () =>
      COLUMN_IDS.map((id) => ({
        columnId: id,
        width: columnWidths[id] ?? DEFAULT_COLUMN_WIDTHS[id],
        resizable: true,
      })),
    [columnWidths],
  );

  const gridRows = useMemo((): Row[] => {
    const headerRow: Row = {
      rowId: 'header',
      height: 36,
      resizable: false,
      cells: [
        { type: 'header', text: i18n('entities.testCase.fields.title') } as HeaderCell,
        { type: 'header', text: i18n('entities.testCase.fields.steps') } as HeaderCell,
        { type: 'header', text: i18n('entities.testCase.fields.expectedResult') } as HeaderCell,
        { type: 'header', text: i18n('entities.testCycle.fields.result') } as HeaderCell,
        { type: 'header', text: i18n('entities.testCycle.fields.outcome') } as HeaderCell,
      ],
    };

    const dataRows = rows.map((r) => {
      const rowHeight = rowHeights[r.rowId] ?? DEFAULT_ROW_HEIGHT;
      return {
        rowId: r.rowId,
        height: rowHeight,
        resizable: true,
        cells: [
          { type: 'readOnlyMultiline', text: r.testCaseTitle } as ReadOnlyMultilineCell,
          { type: 'readOnlyMultiline', text: r.steps } as ReadOnlyMultilineCell,
          { type: 'readOnlyMultiline', text: r.expectedResult } as ReadOnlyMultilineCell,
          {
            type: 'resultSelect',
            rowId: r.rowId,
            selectedValue: r.result,
          } as ResultSelectCell,
          {
            type: 'textWithSpeech',
            rowId: r.rowId,
            field: 'outcome',
            text: r.outcome,
            multiline: true,
            rowHeight,
          } as TextWithSpeechCell,
        ],
      } as unknown as Row;
    });

    return [headerRow, ...dataRows];
  }, [rows, rowHeights]);

  if (!testCycleId) return null;
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
          {i18n('entities.testCycle.fields.testResults')} — Update result & outcome
        </h5>
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={saving || !rows.length}
            onClick={handleSave}
          >
            {saving ? (
              <i className="fas fa-spinner fa-spin me-1" />
            ) : (
              <i className="fas fa-save me-1" />
            )}
            {saveButtonLabel}
          </button>
        </div>
      </div>
      {rows.length === 0 ? (
        <div className="alert alert-info">
          No test cases in this cycle. Add test cases from the Test Cases list using &quot;Assign to Test Cycle&quot;.
        </div>
      ) : (
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
            enableRangeSelection={false}
            enableColumnResizeOnAllHeaders
            stickyTopRows={1}
            customCellTemplates={{
              readOnlyMultiline: readOnlyMultilineTemplate,
              resultSelect: resultSelectTemplate,
              textWithSpeech: textWithSpeechTemplate,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default TestResultExcelView;
