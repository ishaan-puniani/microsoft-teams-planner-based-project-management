import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ReactGrid,
  Column,
  Row,
  HeaderCell,
  TextCell,
  CellChange,
  CellTemplate,
  Compatible,
  Uncertain,
} from '@silevis/reactgrid';
import '@silevis/reactgrid/styles.css';
import { i18n } from 'src/i18n';
import Errors from 'src/modules/shared/error/errors';
import ProjectService from 'src/modules/project/projectService';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import PageTitle from 'src/view/shared/styles/PageTitle';
import Spinner from 'src/view/shared/Spinner';
type PlannerRow = {
  id: string;
  key: string;
  start: string;
  end: string;
  color: string;
};

type ColorPickerCell = {
  type: 'colorPicker';
  text: string;
  rowId: string;
};

function ensureHexColor(input: string | undefined): string {
  const value = (input ?? '').trim();
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#0ea5e9';
}

function createColorPickerTemplate(
  onColorChangeRef: React.MutableRefObject<((rowId: string, color: string) => void) | null>,
): CellTemplate<ColorPickerCell> {
  return {
    getCompatibleCell(uncertain: Uncertain<ColorPickerCell>): Compatible<ColorPickerCell> {
      return {
        ...uncertain,
        text: ensureHexColor(uncertain.text),
        value: 0,
        rowId: uncertain.rowId ?? '',
      } as Compatible<ColorPickerCell>;
    },
    isFocusable: () => false,
    render(cell: Compatible<ColorPickerCell>) {
      return (
        <input
          type="color"
          className="form-control form-control-color"
          value={ensureHexColor(cell.text)}
          title="Choose bar color"
          onChange={(event) => {
            event.stopPropagation();
            onColorChangeRef.current?.(cell.rowId, event.target.value);
          }}
        />
      );
    },
  };
}

const KEY_COLUMN_ID = 'key';
const START_COLUMN_ID = 'start';
const END_COLUMN_ID = 'end';
const COLOR_COLUMN_ID = 'color';
const TIMELINE_COLUMN_PREFIX = 'day:';

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_PROJECT_WINDOW_DAYS = 180;

function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateInput(value: string): Date | null {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

function buildTimelineDays(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  let cursor = new Date(start);
  while (cursor <= end) {
    days.push(new Date(cursor));
    cursor = addDays(cursor, 1);
  }
  return days;
}

function createRow(seed = 0): PlannerRow {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = addDays(today, seed * 4);
  const end = addDays(start, 6);

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    key: seed === 0 ? 'E-1' : `US-${seed}`,
    start: toLocalDateString(start),
    end: toLocalDateString(end),
    color: ['#22c55e', '#0ea5e9', '#f59e0b', '#ef4444'][seed % 4],
  };
}

const ProjectPlannerPage = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const [project, setProject] = useState<{ id: string; name?: string } | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [rows, setRows] = useState<PlannerRow[]>([createRow(0), createRow(1)]);
  const onColorChangeRef = useRef<((rowId: string, color: string) => void) | null>(null);

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

  const { timelineStart, timelineEnd, timelineDays } = useMemo(() => {
    const validRanges = rows
      .map((row) => {
        const start = parseDateInput(row.start);
        const end = parseDateInput(row.end);
        if (!start || !end || start > end) return null;
        return { start, end };
      })
      .filter(Boolean) as Array<{ start: Date; end: Date }>;

    const defaultStart = new Date();
    defaultStart.setHours(0, 0, 0, 0);
    const defaultEnd = addDays(defaultStart, DEFAULT_PROJECT_WINDOW_DAYS);

    const start =
      validRanges.length > 0
        ? validRanges.reduce((min, item) => (item.start < min ? item.start : min), validRanges[0].start)
        : defaultStart;
    const end =
      validRanges.length > 0
        ? validRanges.reduce((max, item) => (item.end > max ? item.end : max), validRanges[0].end)
        : defaultEnd;

    return {
      timelineStart: start,
      timelineEnd: end,
      timelineDays: buildTimelineDays(start, end),
    };
  }, [rows]);

  const updateRow = useCallback((rowId: string, field: keyof PlannerRow, value: string) => {
    setRows((current) =>
      current.map((row) => {
        if (row.id !== rowId) return row;
        return { ...row, [field]: value };
      }),
    );
  }, []);

  const handleColorChange = useCallback((rowId: string, color: string) => {
    updateRow(rowId, 'color', ensureHexColor(color));
  }, [updateRow]);

  useEffect(() => {
    onColorChangeRef.current = handleColorChange;
  }, [handleColorChange]);

  const addRow = useCallback(() => {
    setRows((current) => [...current, createRow(current.length + 1)]);
  }, []);

  const saveTimeline = useCallback(() => {
    const payload = rows
      .filter((row) => row.key.trim() && row.start && row.end)
      .map((row) => ({
        key: row.key.trim(),
        start: row.start,
        end: row.end,
        color: row.color,
      }));

    console.log(payload);
  }, [rows]);

  const columns = useMemo<Column[]>(() => {
    const baseColumns: Column[] = [
      { columnId: KEY_COLUMN_ID, width: 180, resizable: true },
      { columnId: START_COLUMN_ID, width: 120, resizable: true },
      { columnId: END_COLUMN_ID, width: 120, resizable: true },
      { columnId: COLOR_COLUMN_ID, width: 90, resizable: false },
    ];

    const timelineColumns: Column[] = timelineDays.map((day) => ({
      columnId: `${TIMELINE_COLUMN_PREFIX}${toLocalDateString(day)}`,
      width: 26,
      resizable: false,
    }));

    return [...baseColumns, ...timelineColumns];
  }, [timelineDays]);

  const gridRows = useMemo<Row[]>(() => {
    const header: Row = {
      rowId: 'header',
      cells: [
        { type: 'header', text: 'Key' } as HeaderCell,
        { type: 'header', text: 'Start (YYYY-MM-DD)' } as HeaderCell,
        { type: 'header', text: 'End (YYYY-MM-DD)' } as HeaderCell,
        { type: 'header', text: 'Color' } as HeaderCell,
        ...timelineDays.map(
          (day): HeaderCell => ({
            type: 'header',
            text: String(day.getDate()),
          }),
        ),
      ],
    };

    const dataRows = rows.map((row) => {
      const start = parseDateInput(row.start);
      const end = parseDateInput(row.end);

      return {
        rowId: row.id,
        cells: [
          {
            type: 'text',
            text: row.key,
          } as TextCell,
          {
            type: 'text',
            text: row.start,
          } as TextCell,
          {
            type: 'text',
            text: row.end,
          } as TextCell,
          {
            type: 'colorPicker',
            text: row.color,
            rowId: row.id,
          } as ColorPickerCell,
          ...timelineDays.map((day) => {
            const inRange = !!start && !!end && day >= start && day <= end;
            const isStart = !!start && day.getTime() === start.getTime();
            const isEnd = !!end && day.getTime() === end.getTime();
            return {
              type: 'text',
              text: '',
              nonEditable: true,
              style: {
                background: inRange ? ensureHexColor(row.color) : '#ffffff',
                opacity: inRange ? 0.88 : 1,
                borderTopLeftRadius: isStart ? 6 : 0,
                borderBottomLeftRadius: isStart ? 6 : 0,
                borderTopRightRadius: isEnd ? 6 : 0,
                borderBottomRightRadius: isEnd ? 6 : 0,
              },
            } as TextCell;
          }),
        ],
      };
    });

    return [header, ...dataRows] as Row[];
  }, [rows, timelineDays]);

  const handleCellsChanged = useCallback((changes: CellChange[]) => {
    if (changes.length === 0) return;

    setRows((current) => {
      const next = [...current];

      for (const change of changes) {
        const rowId = String(change.rowId);
        if (rowId === 'header') continue;
        const rowIndex = next.findIndex((row) => row.id === rowId);
        if (rowIndex < 0) continue;

        const columnId = String(change.columnId);
        if (columnId === KEY_COLUMN_ID && change.type === 'text') {
          next[rowIndex] = { ...next[rowIndex], key: change.newCell.text ?? '' };
        }
        if (columnId === START_COLUMN_ID && change.type === 'text') {
          next[rowIndex] = { ...next[rowIndex], start: change.newCell.text ?? '' };
        }
        if (columnId === END_COLUMN_ID && change.type === 'text') {
          next[rowIndex] = { ...next[rowIndex], end: change.newCell.text ?? '' };
        }
      }

      return next;
    });
  }, []);

  const colorPickerTemplate = useMemo(
    () => createColorPickerTemplate(onColorChangeRef),
    [],
  );



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
          [i18n('common.planner')],
        ]}
      />

      <ContentWrapper>
        <PageTitle>
          {i18n('common.planner')} - {project.name || projectId}
        </PageTitle>

        <div className="mb-2 text-muted small">
          Timeline: {toLocalDateString(timelineStart)} to {toLocalDateString(timelineEnd)}
        </div>

        <div className="border rounded" style={{ overflow: 'hidden' }}>
          <ReactGrid
            columns={columns}
            rows={gridRows}
            stickyTopRows={1}
            stickyLeftColumns={4}
            onCellsChanged={handleCellsChanged}
            enableRangeSelection
            enableFillHandle
            customCellTemplates={{ colorPicker: colorPickerTemplate }}
          />
        </div>

        <div className="mt-3 d-flex gap-2">
          <button type="button" className="btn btn-outline-primary btn-sm" onClick={addRow}>
            Add row
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={saveTimeline}>
            Save
          </button>
        </div>
      </ContentWrapper>
    </>
  );
};

export default ProjectPlannerPage;
