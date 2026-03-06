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
  let afterAC = false; // inside "AC:" section of current level-1 item
  let afterTodo = false; // inside "TODO:" section of current level-2 item
  let lastLineWasBlank = false; // so a following no-dash line can start a new epic (multi-epic document)

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
      afterAC = false;
      afterTodo = false;
      lastLineWasBlank = true;
      continue;
    }

    const { level, isHeader, title } = getLevelAndTitle(trimmed);
    const lineAfterBlank = lastLineWasBlank;
    lastLineWasBlank = false;

    // In a user story, lines after "AC:" that look like "- item" are acceptance criteria, not new user stories
    if (level === 1 && current?.level === 1 && afterAC && trimmed.match(/^-\s+.+/) && !trimmed.startsWith('--')) {
      currentContent.push(line);
      continue;
    }

    // In a task, lines after "TODO:" that look like "- item" are todo checklist, not new user stories
    if (level === 1 && current?.level === 2 && afterTodo && trimmed.match(/^-\s+.+/) && !trimmed.startsWith('--')) {
      currentContent.push(line);
      continue;
    }

    if (level === 1 || level === 2 || level === 3) {
      if (current) flush();
      afterAC = false;
      afterTodo = false;
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

    // Track when we enter AC section in a level-1 (user story) block
    if (current?.level === 1 && (trimmed.toLowerCase().startsWith('ac:') || trimmed.toLowerCase().startsWith('acceptance criteria:'))) {
      afterAC = true;
      currentContent.push(line);
      continue;
    }

    // Track when we enter TODO section in a level-2 (task) block
    if (current?.level === 2 && (trimmed.toLowerCase().startsWith('todo:') || trimmed.toLowerCase() === 'todo')) {
      afterTodo = true;
      currentContent.push(line);
      continue;
    }

    if (level === 0) {
      // First line, or a no-dash line after a blank line, starts a new Epic (supports multi-epic document)
      const startNewEpic = !current || lineAfterBlank;
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

/**
 * Serialize only level-2 (task) items to text. Used for the tasks-only textarea.
 */
export function serializeTasksOnly(items: ParsedItem[]): string {
  const lines: string[] = [];
  for (const item of items) {
    if (item.level === 2) {
      lines.push(`-- ${item.title}`);
      if (item.description) lines.push(item.description);
      if (item.todoChecklist.length > 0) {
        lines.push('TODO:');
        item.todoChecklist.forEach((t) => lines.push(`- ${t}`));
      }
    }
  }
  return lines.join('\n');
}

/**
 * Serialize parsed items (user story + tasks block) back to structured text.
 * Used to update one task's TODO list when we work with tasks-only content.
 */
export function serializeTasksBlock(items: ParsedItem[]): string {
  const lines: string[] = [];
  for (const item of items) {
    if (item.level === 1) {
      lines.push(`- ${item.title}`);
      if (item.description) lines.push(item.description);
      if (item.acceptanceCriteria.length > 0) {
        lines.push('AC:');
        item.acceptanceCriteria.forEach((c) => lines.push(`- ${c}`));
      }
    } else if (item.level === 2) {
      lines.push(`-- ${item.title}`);
      if (item.description) lines.push(item.description);
      if (item.todoChecklist.length > 0) {
        lines.push('TODO:');
        item.todoChecklist.forEach((t) => lines.push(`- ${t}`));
      }
    }
  }
  return lines.join('\n');
}

export const LEVEL_LABELS: Record<Level, string> = {
  0: 'Epic',
  1: 'User Story',
  2: 'Task',
  3: 'Subtask',
};

export const LEVEL_TYPES = ['EPIC', 'USER_STORY', 'TASK', 'SUBTASK'] as const;
