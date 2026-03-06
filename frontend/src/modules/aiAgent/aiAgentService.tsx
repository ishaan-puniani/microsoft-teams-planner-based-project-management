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
}
