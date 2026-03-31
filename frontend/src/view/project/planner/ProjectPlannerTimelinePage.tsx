import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ReactGrid,
  Column,
  Row,
  TextCell,
  CellTemplate,
  Compatible,
  Uncertain,
} from '@silevis/reactgrid';
import '@silevis/reactgrid/styles.css';
import { i18n } from 'src/i18n';
import Errors from 'src/modules/shared/error/errors';
import ProjectService from 'src/modules/project/projectService';
import TaskService from 'src/modules/task/taskService';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import PageTitle from 'src/view/shared/styles/PageTitle';
import Spinner from 'src/view/shared/Spinner';

type TaskRecord = {
  id: string;
  key?: string;
  type?: string;
  title?: string;
  estimatedTime?: {
    architect?: number | string;
    developer?: number | string;
    tester?: number | string;
    businessAnalyst?: number | string;
    ux?: number | string;
    pm?: number | string;
  };
};

type SkillKey = 'architect' | 'developer' | 'tester' | 'businessAnalyst' | 'ux' | 'pm';

type ProjectRecord = {
  id: string;
  name?: string;
  teamSkillLevel?: Partial<Record<Exclude<SkillKey, 'team'>, string | number>>;
};

type TimelineRow = {
  id: string;
  type: string;
  key: string;
  title: string;
  color: string;
  estimatedTime?: TaskRecord['estimatedTime'];
  selectedDaysBySkill: Record<string, string[]>;
};

type ColorPickerCell = {
  type: 'colorPicker';
  text: string;
  rowId: string;
};

type TimelineToggleCell = {
  type: 'timelineToggle';
  text: string;
  rowId: string;
  dayKey: string;
  selected: boolean;
  color: string;
};

const TYPE_COLUMN_ID = 'type';
const KEY_COLUMN_ID = 'key';
const TITLE_COLUMN_ID = 'title';
const EFFORT_COUNT_COLUMN_ID = 'effortCount';
const COLOR_COLUMN_ID = 'color';
const TIMELINE_COLUMN_PREFIX = 'day:';

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_PROJECT_WINDOW_DAYS = 180;
const EPIC_ROW_BG = '#e3f2fd';
const USER_STORY_ROW_BG = '#f3e5f5';
const SKILL_LABELS: Record<SkillKey, string> = {
  team: 'Team',
  architect: 'Architect',
  developer: 'Developer',
  tester: 'Tester',
  businessAnalyst: 'Business Analyst',
  ux: 'UX',
  pm: 'PM',
};

function normalizeTaskType(type: string | undefined): string {
  if (!type) return '';
  return String(type).toLowerCase().replace(/\s+/g, ' ').trim();
}

function toTaskTypeLabel(type: string | undefined): string {
  const normalized = normalizeTaskType(type).replace(/\s/g, '_');
  if (normalized === 'user_story' || normalized === 'userstory') return 'USER_STORY';
  if (normalized === 'epic') return 'EPIC';
  if (!type) return '';
  return String(type).toUpperCase();
}

function getRowBackground(type: string): string | undefined {
  const normalized = normalizeTaskType(type).replace(/\s/g, '_');
  if (normalized === 'epic') return EPIC_ROW_BG;
  if (normalized === 'user_story' || normalized === 'userstory') return USER_STORY_ROW_BG;
  return undefined;
}

function defaultColorForType(type: string): string {
  const normalized = normalizeTaskType(type).replace(/\s/g, '_');
  if (normalized === 'epic') return '#2563eb';
  if (normalized === 'user_story' || normalized === 'userstory') return '#a855f7';
  return '#0ea5e9';
}

function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
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

function ensureHexColor(input: string | undefined): string {
  const value = (input ?? '').trim();
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#0ea5e9';
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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

function createTimelineToggleTemplate(
  onToggleRef: React.MutableRefObject<((rowId: string, dayKey: string) => void) | null>,
): CellTemplate<TimelineToggleCell> {
  return {
    getCompatibleCell(uncertain: Uncertain<TimelineToggleCell>): Compatible<TimelineToggleCell> {
      return {
        ...uncertain,
        text: uncertain.text ?? '',
        value: 0,
        rowId: uncertain.rowId ?? '',
        dayKey: uncertain.dayKey ?? '',
        selected: uncertain.selected === true,
        color: ensureHexColor(uncertain.color),
      } as Compatible<TimelineToggleCell>;
    },
    isFocusable: () => false,
    render(cell: Compatible<TimelineToggleCell>) {
      return (
        <button
          type="button"
          className="btn p-0 border-0 w-100 h-100"
          title={cell.dayKey}
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            onToggleRef.current?.(cell.rowId, cell.dayKey);
          }}
          style={{
            background: cell.selected ? cell.color : 'transparent',
            borderRadius: 4,
            minHeight: 24,
          }}
        />
      );
    },
  };
}

type PlanningMode = 'general' | 'team';

const ProjectPlannerTimelinePage = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [loadingRows, setLoadingRows] = useState(true);
  const [rows, setRows] = useState<TimelineRow[]>([]);
  const [planningMode, setPlanningMode] = useState<PlanningMode>('general');
  const [selectedSkill, setSelectedSkill] = useState<SkillKey>('team');

  const onColorChangeRef = useRef<((rowId: string, color: string) => void) | null>(null);
  const onToggleRef = useRef<((rowId: string, dayKey: string) => void) | null>(null);

  const timelineStart = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return start;
  }, []);

  const timelineEnd = useMemo(() => addDays(timelineStart, DEFAULT_PROJECT_WINDOW_DAYS), [timelineStart]);

  const timelineDays = useMemo(() => buildTimelineDays(timelineStart, timelineEnd), [timelineStart, timelineEnd]);

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

  const loadTasks = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoadingRows(true);
      const response = await TaskService.list({ project: projectId }, undefined, 500, 0);
      const taskRows = (response?.rows ?? []) as TaskRecord[];
      const nextRows = taskRows.map((task) => {
        const taskType = toTaskTypeLabel(task.type);
        return {
          id: task.id,
          type: taskType,
          key: task.key ?? '',
          title: task.title ?? '',
          color: defaultColorForType(taskType),
          estimatedTime: task.estimatedTime,
          selectedDaysBySkill: {},
        } as TimelineRow;
      });
      setRows(nextRows);
    } catch (e) {
      Errors.handle(e);
      setRows([]);
    } finally {
      setLoadingRows(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleColorChange = useCallback((rowId: string, color: string) => {
    // Team view is read-only (when in team mode and viewing combined team view)
    if (planningMode === 'team' && selectedSkill === 'team') return;
    setRows((current) =>
      current.map((row) => (row.id === rowId ? { ...row, color: ensureHexColor(color) } : row)),
    );
  }, [planningMode, selectedSkill]);

  const toggleDaySelection = useCallback((rowId: string, dayKey: string) => {
    // Team view is read-only (when in team mode and viewing combined team view)
    if (planningMode === 'team' && selectedSkill === 'team') return;
    
    const skillKey = planningMode === 'general' ? 'general' : selectedSkill;
    
    setRows((current) =>
      current.map((row) => {
        if (row.id !== rowId) return row;
        const selectedDays = row.selectedDaysBySkill[skillKey] ?? [];
        const hasDay = selectedDays.includes(dayKey);
        const nextDays = hasDay
          ? selectedDays.filter((d) => d !== dayKey)
          : [...selectedDays, dayKey].sort();
        return {
          ...row,
          selectedDaysBySkill: {
            ...row.selectedDaysBySkill,
            [skillKey]: nextDays,
          },
        };
      }),
    );
  }, [planningMode, selectedSkill]);

  useEffect(() => {
    onColorChangeRef.current = handleColorChange;
    onToggleRef.current = toggleDaySelection;
  }, [handleColorChange, toggleDaySelection]);

  const skillsInProject = useMemo<SkillKey[]>(() => {
    const available = project?.teamSkillLevel ?? {};
    const options: SkillKey[] = ['team'];
    (Object.keys(SKILL_LABELS) as SkillKey[])
      .filter((key) => key !== 'team')
      .forEach((key) => {
        if (available[key] != null && String(available[key]).trim() !== '') {
          options.push(key);
        }
      });
    return options;
  }, [project]);

  useEffect(() => {
    if (!skillsInProject.includes(selectedSkill)) {
      setSelectedSkill('team');
    }
  }, [selectedSkill, skillsInProject]);

  const displayedRows = rows;

  // Helper to get selected days for a row
  const getSelectedDaysForRow = useCallback(
    (row: TimelineRow): string[] => {
      if (planningMode === 'general') {
        // General mode: get days from 'general' key
        return row.selectedDaysBySkill['general'] ?? [];
      }
      // Team mode
      if (selectedSkill === 'team') {
        // Combine all selected days from all skills
        const allDays = new Set<string>();
        Object.values(row.selectedDaysBySkill).forEach((days) => {
          days?.forEach((day) => allDays.add(day));
        });
        return Array.from(allDays).sort();
      }
      return row.selectedDaysBySkill[selectedSkill] ?? [];
    },
    [planningMode, selectedSkill],
  );

  const saveTimeline = useCallback(() => {
    const payload = displayedRows
      .filter((row) => {
        const selectedDays = getSelectedDaysForRow(row);
        return row.key.trim() && selectedDays.length > 0;
      })
      .map((row) => {
        const selectedDays = getSelectedDaysForRow(row);
        const baseData = {
          key: row.key.trim(),
          start: selectedDays[0],
          end: selectedDays[selectedDays.length - 1],
          color: row.color,
        };
        
        if (planningMode === 'general') {
          return baseData;
        } else {
          // Team mode
          return {
            ...baseData,
            skill: selectedSkill,
          };
        }
      });

    console.log(payload);
  }, [displayedRows, planningMode, selectedSkill, getSelectedDaysForRow]);

  const exportColoredExcel = useCallback(() => {
    if (!displayedRows.length) return;

    const tableHeader = [
      'Type',
      'Key',
      'Title',
      'Effort',
      'Color',
      ...timelineDays.map((d) => toLocalDateString(d)),
    ];

    const headerHtml = `<tr>${tableHeader
      .map((cell) => `<th style="border:1px solid #ddd;padding:6px 8px;background:#f4f6f8;">${escapeHtml(cell)}</th>`)
      .join('')}</tr>`;

    const rowHtml = displayedRows
      .map((row) => {
        const selectedDays = getSelectedDaysForRow(row);
        const rowBg = getRowBackground(row.type);
        const baseStyle = rowBg ? `background:${rowBg};` : '';
        const fixedCells = [
          `<td style="border:1px solid #ddd;padding:6px 8px;${baseStyle}">${escapeHtml(row.type)}</td>`,
          `<td style="border:1px solid #ddd;padding:6px 8px;${baseStyle}">${escapeHtml(row.key)}</td>`,
          `<td style="border:1px solid #ddd;padding:6px 8px;${baseStyle}">${escapeHtml(row.title)}</td>`,
          `<td style="border:1px solid #ddd;padding:6px 8px;${baseStyle}">${selectedDays.length}</td>`,
          `<td style="border:1px solid #ddd;padding:6px 8px;${baseStyle}">${escapeHtml(ensureHexColor(row.color))}</td>`,
        ];

        const dateCells = timelineDays.map((day) => {
          const dayKey = toLocalDateString(day);
          const selected = selectedDays.includes(dayKey);
          const cellColor = ensureHexColor(row.color);
          return selected
            ? `<td style="border:1px solid #ddd;padding:6px 8px;background:${cellColor};color:#ffffff;">${escapeHtml(cellColor)}</td>`
            : '<td style="border:1px solid #ddd;padding:6px 8px;"></td>';
        });

        return `<tr>${[...fixedCells, ...dateCells].join('')}</tr>`;
      })
      .join('');

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
        </head>
        <body>
          <table cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
            ${headerHtml}
            ${rowHtml}
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const filename = `timeline-${projectId || 'project'}.xls`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }, [displayedRows, timelineDays, projectId, getSelectedDaysForRow]);

  const columns = useMemo<Column[]>(() => {
    const baseColumns: Column[] = [
      { columnId: TYPE_COLUMN_ID, width: 120, resizable: true },
      { columnId: KEY_COLUMN_ID, width: 120, resizable: true },
      { columnId: TITLE_COLUMN_ID, width: 260, resizable: true },
      { columnId: EFFORT_COUNT_COLUMN_ID, width: 110, resizable: true },
      { columnId: COLOR_COLUMN_ID, width: 90, resizable: false },
    ];

    const dayColumns: Column[] = timelineDays.map((day) => ({
      columnId: `${TIMELINE_COLUMN_PREFIX}${toLocalDateString(day)}`,
      width: 28,
      resizable: false,
    }));

    return [...baseColumns, ...dayColumns];
  }, [timelineDays]);

  const gridRows = useMemo(() => {
    const row0: Row = {
      rowId: 'row-0',
      cells: [
        { type: 'text', text: 'Type', nonEditable: true } as TextCell,
        { type: 'text', text: 'Key', nonEditable: true } as TextCell,
        { type: 'text', text: 'Title', nonEditable: true } as TextCell,
        { type: 'text', text: 'Effort', nonEditable: true } as TextCell,
        { type: 'text', text: 'Color', nonEditable: true } as TextCell,
        ...timelineDays.map((day) => ({
          type: 'text',
          text: toLocalDateString(day),
          nonEditable: true,
        }) as TextCell),
      ],
    };

    const dataRows = displayedRows.map((row) => {
      const selectedDays = getSelectedDaysForRow(row);
      const rowBg = getRowBackground(row.type);
      const rowStyle = rowBg ? { style: { background: rowBg } } : {};

      return {
        rowId: row.id,
        cells: [
          { type: 'text', text: row.type, nonEditable: true, ...rowStyle } as TextCell,
          { type: 'text', text: row.key, nonEditable: true, ...rowStyle } as TextCell,
          { type: 'text', text: row.title, nonEditable: true, ...rowStyle } as TextCell,
          { type: 'text', text: String(selectedDays.length), nonEditable: true, ...rowStyle } as TextCell,
          {
            type: 'colorPicker',
            text: row.color,
            rowId: row.id,
          } as ColorPickerCell,
          ...timelineDays.map((day) => {
            const dayKey = toLocalDateString(day);
            const selected = selectedDays.includes(dayKey);
            return {
              type: 'timelineToggle',
              text: selected ? ensureHexColor(row.color) : '',
              rowId: row.id,
              dayKey,
              selected,
              color: row.color,
            } as TimelineToggleCell;
          }),
        ],
      } as Row;
    });

    return [row0, ...dataRows] as Row[];
  }, [displayedRows, getSelectedDaysForRow, timelineDays]);

  const colorPickerTemplate = useMemo(() => createColorPickerTemplate(onColorChangeRef), []);
  const timelineToggleTemplate = useMemo(() => createTimelineToggleTemplate(onToggleRef), []);

  if (loadingProject || loadingRows || !projectId) {
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
          ['Plan Timeline'],
        ]}
      />

      <ContentWrapper>
        <PageTitle>
          {i18n('common.planner')} - Plan Timeline - {project.name || projectId}
        </PageTitle>

        <div className="mb-3">
          <Link to={`/project-planner/${projectId}/estimates-report`} className="btn btn-outline-secondary btn-sm me-2">
            <i className="fas fa-chart-pie me-1" />
            Estimates report
          </Link>
          <Link to={`/project-planner/${projectId}/estimate`} className="btn btn-outline-secondary btn-sm me-2">
            <i className="fas fa-table-cells-large me-1" />
            Estimate / Time plan
          </Link>
          <Link to={`/project-planner/${projectId}`} className="btn btn-outline-secondary btn-sm me-2">
            <i className="fas fa-list-check me-1" />
            Structured planner
          </Link>
          <Link to={`/project/${projectId}`} className="btn btn-light btn-sm">
            <i className="fas fa-arrow-left me-1" />
            {i18n('common.view')} {i18n('entities.project.menu')}
          </Link>

          <select
            className="form-select form-select-sm d-inline-block ms-3"
            style={{ width: 150 }}
            value={planningMode}
            onChange={(event) => setPlanningMode(event.target.value as PlanningMode)}
          >
            <option value="general">General</option>
            <option value="team">Team</option>
          </select>

          {planningMode === 'team' && (
            <select
              className="form-select form-select-sm d-inline-block ms-2"
              style={{ width: 190 }}
              value={selectedSkill}
              onChange={(event) => setSelectedSkill(event.target.value as SkillKey)}
            >
              {skillsInProject.map((skill) => (
                <option key={skill} value={skill}>
                  {SKILL_LABELS[skill]}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="mb-2 text-muted small">
          Click date cells to assign effort. Timeline: {toLocalDateString(timelineStart)} to {toLocalDateString(timelineEnd)}
        </div>

        <div
          className="border rounded"
          style={{
            height: 'calc(100vh - 320px)',
            minHeight: 300,
            overflow: 'auto',
            position: 'relative',
          }}
        >
          <ReactGrid
            columns={columns}
            rows={gridRows}
            stickyTopRows={1}
            stickyLeftColumns={5}
            enableRangeSelection
            customCellTemplates={{
              colorPicker: colorPickerTemplate,
              timelineToggle: timelineToggleTemplate,
            }}
          />
        </div>

        <div className="mt-3 d-flex gap-2">
          <button type="button" className="btn btn-primary btn-sm" onClick={saveTimeline}>
            Save Estimates
            {planningMode === 'general'
              ? ' (General)'
              : ` (Team: ${SKILL_LABELS[selectedSkill]})`}
          </button>
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={exportColoredExcel}>
            Export Colored Excel
          </button>
        </div>
      </ContentWrapper>
    </>
  );
};

export default ProjectPlannerTimelinePage;
