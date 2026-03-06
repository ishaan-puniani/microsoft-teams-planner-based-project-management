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
