import ApiResponseHandler from '../apiResponseHandler';
import ProjectService from '../../services/projectService';
import TaskRepository from '../../database/repositories/taskRepository';
import MsTaskService from '../../integrations/msGraph/msTaskService';
import { getMsPlannerAuth } from '../msPlanner/getMsPlannerAuth';

export default async (req, res, next) => {
  try {
    const projectId = req.params.projectId;
    const projectService = new ProjectService(req);
    const project = await projectService.findById(projectId);

    const msPlanId = project.msPlan;
    if (!msPlanId) {
      return ApiResponseHandler.error(
        req,
        res,
        new Error('Project has no Microsoft Planner plan linked'),
      );
    }

    const msAuth = getMsPlannerAuth(req);
    if (!msAuth) {
      return ApiResponseHandler.error(
        req,
        res,
        new Error('Microsoft Planner credentials not configured for this tenant'),
      );
    }

    const [msPlannerDetails, msPlannerTasks, msPlannerUsers] = await Promise.all([
      MsTaskService.getBoardDetails(msPlanId, msAuth),
      MsTaskService.getTasksOfBoard(msPlanId, msAuth),
      MsTaskService.getAllUsers(msAuth),
    ]);

    const categoryDescriptions = msPlannerDetails.categories || {};
    const buckets = msPlannerDetails.buckets || [];
    const bucketIdToName: Record<string, string> = {};
    for (const b of buckets) {
      if (b?.id != null && b?.name != null) bucketIdToName[b.id] = String(b.name);
    }

    // Map Planner percentComplete to task status: 0 -> OPEN, 50 -> IN_PROGRESS, 100 -> DONE
    const percentToStatus = (p: number | undefined): string => {
      if (p === 100) return 'DONE';
      if (p === 50) return 'IN_PROGRESS';
      return 'OPEN';
    };

    // Maintain id -> email map from msPlannerUsers (single pass, no per-assignee API calls)
    const userIdToEmail: Record<string, string> = {};
    const users = Array.isArray(msPlannerUsers) ? msPlannerUsers : [];
    for (const user of users) {
      const id = user?.id;
      const email = user?.mail || user?.userPrincipalName;
      if (id && email) userIdToEmail[id] = email;
    }

    const tasksToInsert = msPlannerTasks.map((plannerTask: any) => {
      const categories: string[] = [];
      const applied = plannerTask.appliedCategories || {};
      for (const key of Object.keys(applied)) {
        if (applied[key] && categoryDescriptions[key]) {
          categories.push(String(categoryDescriptions[key]));
        }
      }
      const assignments = plannerTask.assignments || {};
      const assignedTo = Object.keys(assignments)
        .map((uid) => userIdToEmail[uid])
        .filter(Boolean) as string[];
      const bucketName = plannerTask.bucketId
        ? (bucketIdToName[plannerTask.bucketId] ?? '')
        : '';
      const status = percentToStatus(plannerTask.percentComplete);
      return {
        msPlannerTaskId: plannerTask.id,
        title: plannerTask.title != null ? String(plannerTask.title).trim() : '',
        categories,
        description: undefined,
        estimatedStart: plannerTask.startDateTime
          ? new Date(plannerTask.startDateTime)
          : undefined,
        estimatedEnd: plannerTask.dueDateTime
          ? new Date(plannerTask.dueDateTime)
          : undefined,
        assignedTo,
        status,
        bucket: bucketName,
      };
    });

    const inserted = await TaskRepository.insertBulkTasksIgnoreAlreadyReferredByMsPlannerTaskId(
      projectId,
      tasksToInsert,
      { ...req },
    );

    await ApiResponseHandler.success(req, res, {
      synced: inserted,
      totalFromPlanner: msPlannerTasks.length,
    });
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
