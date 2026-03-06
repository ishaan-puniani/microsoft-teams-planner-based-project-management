import AuthCurrentTenant from 'src/modules/auth/authCurrentTenant';
import authAxios from 'src/modules/shared/axios/authAxios';

export type PlannerStep = 'epics' | 'user_stories' | 'tasks';

export default class AiAgentService {
  static async refinePlannerStep(
    step: PlannerStep,
    projectBrief: string,
    options?: { currentStructuredText?: string; userFeedback?: string },
  ) {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.post(
      `/tenant/${tenantId}/ai-agent/planner-refine`,
      {
        step,
        projectBrief,
        currentStructuredText: options?.currentStructuredText ?? '',
        userFeedback: options?.userFeedback,
      },
    );
    return response.data as { structuredText: string; step: PlannerStep };
  }

  static async plannerSuggestEpics(projectBrief: string) {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.post(
      `/tenant/${tenantId}/ai-agent/planner-suggest-epics`,
      { projectBrief },
    );
    return response.data as { epicsText: string };
  }

  static async plannerSuggestUserStoriesForEpic(
    epicName: string,
    options?: { projectBrief?: string; epicDescription?: string },
  ) {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.post(
      `/tenant/${tenantId}/ai-agent/planner-suggest-user-story-for-epic`,
      {
        epicName,
        projectBrief: options?.projectBrief,
        epicDescription: options?.epicDescription,
      },
    );
    return response.data as { userStoriesText: string };
  }

  static async plannerSuggestTasksForUserStory(
    userStoryText: string,
    options?: { projectBrief?: string; epicName?: string },
  ) {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.post(
      `/tenant/${tenantId}/ai-agent/planner-suggest-tasks-for-user-story-of-epic`,
      {
        userStoryText,
        projectBrief: options?.projectBrief,
        epicName: options?.epicName,
      },
    );
    return response.data as { tasksText: string };
  }

  static async plannerSuggestTodosForTask(
    taskTitle: string,
    options?: {
      taskDescription?: string;
      projectBrief?: string;
      userStoryTitle?: string;
    },
  ) {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.post(
      `/tenant/${tenantId}/ai-agent/planner-suggest-todos-for-task`,
      {
        taskTitle,
        taskDescription: options?.taskDescription,
        projectBrief: options?.projectBrief,
        userStoryTitle: options?.userStoryTitle,
      },
    );
    return response.data as { todos: string[] };
  }
}
