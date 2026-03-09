import PermissionChecker from '../../services/user/permissionChecker';
import ApiResponseHandler from '../apiResponseHandler';
import Permissions from '../../security/permissions';
import MongooseRepository from '../../database/repositories/mongooseRepository';
import TaskRepository from '../../database/repositories/taskRepository';
import ProjectRepository from '../../database/repositories/projectRepository';
import Error400 from '../../errors/Error400';

export default async (req, res, next) => {
  try {
    new PermissionChecker(req).validateHas(Permissions.values.taskCreate);

    const { projectId, tasks } = req.body.data || req.body;
    if (!projectId) {
      throw new Error400(req.language, 'validation.errors.required');
    }
    if (!Array.isArray(tasks) || tasks.length === 0) {
      throw new Error400(req.language, 'validation.errors.required');
    }

    const options = { ...req };
    const project = await ProjectRepository.filterIdInTenant(projectId, options);
    if (!project) {
      throw new Error400(req.language, 'entities.project.errors.notFound');
    }

    const session = await MongooseRepository.createSession(req.database);
    const optionsWithSession = { ...options, session };

    try {
      const clientIdToCreatedId: Record<string, string> = {};
      let created = 0;

      for (const task of tasks) {
        if (!task || typeof task !== 'object' || !task.template) continue;

        let parents = [];
        if (task.parents != null && Array.isArray(task.parents) && task.parents.length > 0) {
          parents = await TaskRepository.filterIdsInTenant(
            task.parents,
            optionsWithSession,
          );
        }

        const record = await TaskRepository.create(
          {
            project: projectId,
            template: task.template,
            type: task.type,
            title: task.title,
            description: task.description,
            templateData: task.templateData || {},
            ...(parents.length > 0 && { parents }),
          },
          optionsWithSession,
        );

        if (task.clientId) {
          clientIdToCreatedId[task.clientId] = record.id;
        }
        created += 1;
      }

      for (const task of tasks) {
        if (!task?.parentClientId || !task.clientId) continue;
        const parentId = clientIdToCreatedId[task.parentClientId];
        const taskId = clientIdToCreatedId[task.clientId];
        if (!parentId || !taskId) continue;

        await TaskRepository.update(
          taskId,
          { parents: [parentId] },
          optionsWithSession,
        );
      }

      await MongooseRepository.commitTransaction(session);
      await ApiResponseHandler.success(req, res, { count: created });
    } catch (error) {
      await MongooseRepository.abortTransaction(session);
      throw error;
    }
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
