/**
 * Sample/placeholder text for the structured planner.
 * Used only as placeholder; AI planner does not load this from storage (no default link to sample).
 */
export const PLANNER_SAMPLE_PLACEHOLDER = `Epic Title
Short description for the epic.

- User Story Title
As a user I want to log in.
AC:
- Valid email and password
- Show error on invalid credentials

-- Task Title
Implement login form and API.
TODO:
- Add email field
- Add password field
- Submit handler

--- Subtask Title
Write unit tests for login.`;

/**
 * localStorage key = projectId so AI and Planner views share the same content.
 */
export function getPlannerContentKey(projectId: string): string {
  return projectId;
}

export function getPlannerBriefKey(projectId: string): string {
  return `planner-brief-${projectId}`;
}

export function loadPlannerContent(projectId: string): string | null {
  try {
    return localStorage.getItem(getPlannerContentKey(projectId));
  } catch {
    return null;
  }
}

export function savePlannerContent(projectId: string, formattedText: string): void {
  try {
    localStorage.setItem(getPlannerContentKey(projectId), formattedText);
  } catch {
    // ignore quota or security errors
  }
}

export function loadPlannerBrief(projectId: string): string | null {
  try {
    return localStorage.getItem(getPlannerBriefKey(projectId));
  } catch {
    return null;
  }
}

export function savePlannerBrief(projectId: string, brief: string): void {
  try {
    localStorage.setItem(getPlannerBriefKey(projectId), brief);
  } catch {
    // ignore
  }
}
