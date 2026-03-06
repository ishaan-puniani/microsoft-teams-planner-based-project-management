/**
 * Parses structured bulk text into hierarchy:
 * - No leading dash = Epic (first line), or description line
 * - "- " = User Story; use "AC:" then "- item" lines for Acceptance Criteria (like TODO:)
 * - "-- " = Task; "TODO:" then "- item" lines = checklist
 * - "--- " = Subtask
 */
export type Level = 0 | 1 | 2 | 3; // Epic, User Story, Task, Subtask

export interface ParsedItem {
  level: Level;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  todoChecklist: string[];
}

function getLevelAndTitle(line: string): { level: Level; isHeader: boolean; title: string } {
  const trimmed = line.trim();
  if (!trimmed) return { level: 0, isHeader: false, title: '' };

  const oneDash = /^-\s+(.+)$/.exec(trimmed);
  const twoDash = /^--\s+(.+)$/.exec(trimmed);
  const threeDash = /^---\s+(.+)$/.exec(trimmed);

  if (threeDash) return { level: 3, isHeader: true, title: threeDash[1].trim() };
  if (twoDash) return { level: 2, isHeader: true, title: twoDash[1].trim() };
  if (oneDash) return { level: 1, isHeader: true, title: oneDash[1].trim() };
  return { level: 0, isHeader: true, title: trimmed };
}

export function parseStructuredBulk(text: string): ParsedItem[] {
  const lines = text.split(/\n/);
  const items: ParsedItem[] = [];
  let current: ParsedItem | null = null;
  let currentContent: string[] = [];
  let lastWasHeader = false;

  function flush() {
    if (!current) return;
    const descLines: string[] = [];
    const ac: string[] = [];
    const todo: string[] = [];
    let afterAC = false;
    let afterTodo = false;

    for (const raw of currentContent) {
      const line = raw.trimEnd();
      const t = line.trim();
      if (!t) {
        descLines.push('');
        afterAC = false;
        continue;
      }

      if (current.level === 1) {
        if (t.toLowerCase().startsWith('ac:') || t.toLowerCase().startsWith('acceptance criteria:')) {
          afterAC = true;
          continue;
        }
        if (afterAC && t.match(/^(-|\*)\s+.+/) && !t.startsWith('--')) {
          ac.push(t.replace(/^[-*]\s*/, ''));
          continue;
        }
        if (afterAC) afterAC = false;
      }
      if (current.level === 2) {
        if (t.toLowerCase().startsWith('todo:') || t.toLowerCase() === 'todo') {
          afterTodo = true;
          continue;
        }
        if (afterTodo && t.match(/^(-|\*)\s+.+/)) {
          todo.push(t.replace(/^[-*]\s*/, ''));
          continue;
        }
        if (afterTodo) afterTodo = false;
      }
      descLines.push(line);
    }

    current.description = descLines.join('\n').trim();
    current.acceptanceCriteria = ac;
    current.todoChecklist = todo;
    items.push(current);
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) {
      if (current) currentContent.push('');
      continue;
    }

    const { level, isHeader, title } = getLevelAndTitle(trimmed);

    if (level === 1 || level === 2 || level === 3) {
      if (current) flush();
      current = {
        level,
        title,
        description: '',
        acceptanceCriteria: [],
        todoChecklist: [],
      };
      currentContent = [];
      lastWasHeader = true;
      continue;
    }

    if (level === 0) {
      // Only the very first line starts an Epic; all other no-dash lines are description content
      const startNewEpic = !current;
      if (startNewEpic) {
        if (current) flush();
        current = { level: 0, title: trimmed, description: '', acceptanceCriteria: [], todoChecklist: [] };
        currentContent = [];
        lastWasHeader = true;
      } else {
        if (current) currentContent.push(line);
        lastWasHeader = false;
      }
      continue;
    }

    lastWasHeader = false;
  }

  if (current) flush();
  return items;
}

export const LEVEL_LABELS: Record<Level, string> = {
  0: 'Epic',
  1: 'User Story',
  2: 'Task',
  3: 'Subtask',
};

export const LEVEL_TYPES = ['EPIC', 'USER_STORY', 'TASK', 'SUBTASK'] as const;
