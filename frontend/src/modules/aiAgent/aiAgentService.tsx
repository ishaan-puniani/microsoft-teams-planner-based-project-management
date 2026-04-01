import AuthCurrentTenant from 'src/modules/auth/authCurrentTenant';
import authAxios from 'src/modules/shared/axios/authAxios';

export type AiChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type AiSuggestedTask = {
  id: string;
  name: string;
  description?: string;
  type?: string;
};

export type AiChatResponse = {
  success: boolean;
  generation: AiChatSession;
  suggestedTasksType?: string | null;
  suggestedTasks?: AiSuggestedTask[];
  debug?: {
    toolTrace?: any[];
    agentError?: string;
  };
};

export type AiChatSession = {
  _id?: string;
  id?: string;
  tenantId?: string;
  tenant?: string;
  eventUri?: string;
  userId?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  data: {
    request: { userInput: string };
    response: {
      success: boolean;
      message: string;
      error?: string | null;
      suggestedTasksType?: string | null;
      suggestedTasks?: AiSuggestedTask[];
    };
    tokensUsed?: number;
  };
  history: Array<{
    request: { userInput: string };
    response: {
      success: boolean;
      message: string;
      error?: string | null;
      suggestedTasksType?: string | null;
      suggestedTasks?: AiSuggestedTask[];
    };
    tokensUsed?: number;
  }>;
};

/** Optional PDF or image (base64 + MIME) for planner / test-case suggestion APIs. */
export type AiSuggestionAttachment = {
  attachmentBase64: string;
  attachmentMimeType: string;
};

export type PlannerStep = 'epics' | 'user_stories' | 'tasks';

function attachmentFields(attachment?: AiSuggestionAttachment | null) {
  if (!attachment?.attachmentBase64?.trim() || !attachment?.attachmentMimeType?.trim()) {
    return {};
  }
  return {
    attachmentBase64: attachment.attachmentBase64.trim(),
    attachmentMimeType: attachment.attachmentMimeType.trim(),
  };
}

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

  static async plannerSuggestEpics(
    projectBrief: string,
    options?: { projectId?: string; attachment?: AiSuggestionAttachment | null },
  ) {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.post(
      `/tenant/${tenantId}/ai-agent/planner-suggest-epics`,
      {
        projectBrief,
        projectId: options?.projectId,
        ...attachmentFields(options?.attachment),
      },
    );
    return response.data as { epicsText: string };
  }

  static async plannerSuggestUserStoriesForEpic(
    epicName: string,
    options?: {
      projectBrief?: string;
      epicDescription?: string;
      projectId?: string;
      attachment?: AiSuggestionAttachment | null;
    },
  ) {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.post(
      `/tenant/${tenantId}/ai-agent/planner-suggest-user-story-for-epic`,
      {
        epicName,
        projectBrief: options?.projectBrief,
        epicDescription: options?.epicDescription,
        projectId: options?.projectId,
        ...attachmentFields(options?.attachment),
      },
    );
    return response.data as { userStoriesText: string };
  }

  static async plannerSuggestTasksForUserStory(
    userStoryText: string,
    options?: {
      projectBrief?: string;
      epicName?: string;
      projectId?: string;
      attachment?: AiSuggestionAttachment | null;
    },
  ) {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.post(
      `/tenant/${tenantId}/ai-agent/planner-suggest-tasks-for-user-story-of-epic`,
      {
        userStoryText,
        projectBrief: options?.projectBrief,
        epicName: options?.epicName,
        projectId: options?.projectId,
        ...attachmentFields(options?.attachment),
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
      projectId?: string;
      attachment?: AiSuggestionAttachment | null;
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
        projectId: options?.projectId,
        ...attachmentFields(options?.attachment),
      },
    );
    return response.data as { todos: string[] };
  }

  static async suggestTestCasesForTask(
    taskTitle: string,
    options?: { taskDescription?: string; attachment?: AiSuggestionAttachment | null },
  ) {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.post(
      `/tenant/${tenantId}/ai-agent/suggest-test-cases-for-task`,
      {
        taskTitle,
        taskDescription: options?.taskDescription,
        ...attachmentFields(options?.attachment),
      },
    );
    return response.data as {
      testCases: Array<{ title?: string; steps?: string; expectedResult?: string }>;
    };
  }

  static async suggestProjectDescription(description: string) {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.post(
      `/tenant/${tenantId}/ai-agent/suggest-project-description`,
      {
        description,
      },
    );
    return response.data as { suggestion: string };
  }

  static async suggestProjectIntegrations(description: string) {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.post(
      `/tenant/${tenantId}/ai-agent/suggest-project-integrations`,
      {
        description,
      },
    );
    return response.data as { suggestion: string };
  }

  static async organizeProjectTasks(projectId: string) {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.get(
      `/tenant/${tenantId}/ai-agent/organize-project-tasks/${projectId}`,
    );
    return response.data as { message: string; updated: number; skipped: number };
  }

  static async suggestEstimationsForTask(projectId: string, taskId: string) {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.get(
      `/tenant/${tenantId}/ai-agent/suggest-estimations-for-task/${projectId}/${taskId}`,
    );
    return response.data as {
      suggestedEstimatedTime: {
        low: Record<string, number>;
        ideal: Record<string, number>;
        high: Record<string, number>;
      };
    };
  }

  static async suggestEstimationsForProject(projectId: string) {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.get(
      `/tenant/${tenantId}/ai-agent/suggest-estimations-for-project/${projectId}`,
    );
    return response.data as { processed: number; results: Array<{ taskId: string; title: string; type: string }> };
  }

  static async chat(
    projectId: string,
    message: string,
    sessionId?: string,
  ): Promise<AiChatResponse> {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.post(
      `/tenant/${tenantId}/ai-agent/chat/${projectId}`,
      {
        message,
        sessionId,
      },
    );
    return response.data as AiChatResponse;
  }

  static async chatHistory(
    projectId: string,
  ): Promise<{ success: boolean; generation: AiChatSession | null }> {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.get(
      `/tenant/${tenantId}/ai-agent/chat-session/${projectId}`,
    );
    return response.data as { success: boolean; generation: AiChatSession | null };
  }
}
