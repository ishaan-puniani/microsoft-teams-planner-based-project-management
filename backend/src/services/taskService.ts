/// File is generated from https://studio.fabbuilder.com - task

import Error400 from '../errors/Error400';
import MongooseRepository from '../database/repositories/mongooseRepository';
import { IServiceOptions } from './IServiceOptions';
import TaskRepository from '../database/repositories/taskRepository';
import UserRepository from '../database/repositories/userRepository';
import ProjectRepository from '../database/repositories/projectRepository';

export default class TaskService {
  options: IServiceOptions;

  constructor(options) {
    this.options = options;
  }

  async create(data) {
    const session = await MongooseRepository.createSession(
      this.options.database,
    );

    try {
      data.leadBy = await UserRepository.filterIdInTenant(
        data.leadBy,
        { ...this.options, session },
      );
      data.reviewedBy =
        await UserRepository.filterIdInTenant(
          data.reviewedBy,
          { ...this.options, session },
        );
      if (data.parents != null && Array.isArray(data.parents)) {
        data.parents = await TaskRepository.filterIdsInTenant(
          data.parents,
          { ...this.options, session },
        );
      }

      // When creating a TEST_CASE task, set template from project.testCaseTemplate if not already set
      if (
        data.project &&
        !data.template &&
        (data.type === 'TEST_CASE' || String(data.type).toUpperCase() === 'TEST_CASE')
      ) {
        const project = await ProjectRepository.findById(data.project, {
          ...this.options,
          session,
        });
        const templateId = project?.testCaseTemplate?.id ?? project?.testCaseTemplate;
        if (templateId) {
          data.template = templateId;
        }
      }

      const record = await TaskRepository.create(data, {
        ...this.options,
        session,
      });

      await MongooseRepository.commitTransaction(session);

      return record;
    } catch (error) {
      await MongooseRepository.abortTransaction(session);

      MongooseRepository.handleUniqueFieldError(
        error,
        this.options.language,
        'task',
      );

      throw error;
    }
  }

  async update(id, data) {
    const session = await MongooseRepository.createSession(
      this.options.database,
    );

    try {
      data.leadBy = await UserRepository.filterIdInTenant(
        data.leadBy,
        { ...this.options, session },
      );
      data.reviewedBy =
        await UserRepository.filterIdInTenant(
          data.reviewedBy,
          { ...this.options, session },
        );
      if (data.parents != null && Array.isArray(data.parents)) {
        data.parents = await TaskRepository.filterIdsInTenant(
          data.parents,
          { ...this.options, session },
        );
      }

      const record = await TaskRepository.update(id, data, {
        ...this.options,
        session,
      });

      await MongooseRepository.commitTransaction(session);

      return record;
    } catch (error) {
      await MongooseRepository.abortTransaction(session);

      MongooseRepository.handleUniqueFieldError(
        error,
        this.options.language,
        'task',
      );

      throw error;
    }
  }

  async bulkUpdateEstimates(updates: Array<{ id: string; title?: string; storyPoints?: string; estimatedTime?: Record<string, number> }>) {
    const session = await MongooseRepository.createSession(
      this.options.database,
    );

    try {
      const count = await TaskRepository.bulkUpdateEstimates(
        updates,
        { ...this.options, session },
      );
      await MongooseRepository.commitTransaction(session);
      return { count };
    } catch (error) {
      await MongooseRepository.abortTransaction(session);
      throw error;
    }
  }

  /**
   * Single call: create new tasks, bulk-update estimates, delete tasks.
   * Payload: { projectId, newTasks, updates, deleteTasks?: string[] }
   */
  async savePlan(payload: {
    projectId: string;
    newTasks: Array<{
      tempId: string;
      type: string;
      title: string;
      storyPoints?: string;
      estimatedTime?: Record<string, number>;
      parentTempId?: string;
      parentId?: string;
    }>;
    updates: Array<{
      id: string;
      title?: string;
      storyPoints?: string;
      estimatedTime?: Record<string, number>;
    }>;
    deleteTasks?: string[];
  }) {
    const session = await MongooseRepository.createSession(
      this.options.database,
    );
    const { projectId, newTasks = [], updates = [], deleteTasks = [] } = payload;
    const idMap = new Map<string, string>();

    try {
      for (const id of deleteTasks) {
        await TaskRepository.destroy(id, {
          ...this.options,
          session,
        });
      }

      for (const item of newTasks) {
        let parentIds: string[] = [];
        if (item.parentId) {
          parentIds = await TaskRepository.filterIdsInTenant(
            [item.parentId],
            { ...this.options, session },
          );
        } else if (item.parentTempId) {
          const resolved = idMap.get(item.parentTempId);
          if (resolved) parentIds = [resolved];
        }
        const data: Record<string, unknown> = {
          project: projectId,
          type: item.type || 'TASK',
          title: item.title || 'New Task',
          storyPoints: item.storyPoints,
          estimatedTime:
            item.estimatedTime &&
            Object.keys(item.estimatedTime).length > 0
              ? item.estimatedTime
              : undefined,
        };
        if (parentIds.length > 0) {
          data.parents = parentIds;
        }
        const record = await TaskRepository.create(data, {
          ...this.options,
          session,
        });
        if (record && record.id) {
          idMap.set(item.tempId, record.id);
        }
      }

      if (updates.length > 0) {
        await TaskRepository.bulkUpdateEstimates(updates, {
          ...this.options,
          session,
        });
      }

      await MongooseRepository.commitTransaction(session);
      return {
        createdIds: Object.fromEntries(idMap),
        count: updates.length,
        deletedCount: deleteTasks.length,
      };
    } catch (error) {
      await MongooseRepository.abortTransaction(session);
      MongooseRepository.handleUniqueFieldError(
        error,
        this.options.language,
        'task',
      );
      throw error;
    }
  }

  async destroyAll(ids) {
    const session = await MongooseRepository.createSession(
      this.options.database,
    );

    try {
      for (const id of ids) {
        await TaskRepository.destroy(id, {
          ...this.options,
          session,
        });
      }

      await MongooseRepository.commitTransaction(session);
    } catch (error) {
      await MongooseRepository.abortTransaction(session);
      throw error;
    }
  }

  async findById(id) {
    return TaskRepository.findById(id, this.options);
  }

  async findAllAutocomplete(search, limit) {
    return TaskRepository.findAllAutocomplete(
      search,
      limit,
      this.options,
    );
  }

  async findAndCountAll(args) {
    return TaskRepository.findAndCountAll(
      args,
      this.options,
    );
  }

  async getAggregateEstimates(projectId: string) {
    return TaskRepository.aggregateEstimatesByProject(
      projectId,
      this.options,
    );
  }

  async import(data, importHash) {
    if (!importHash) {
      throw new Error400(
        this.options.language,
        'importer.errors.importHashRequired',
      );
    }

    if (await this._isImportHashExistent(importHash)) {
      throw new Error400(
        this.options.language,
        'importer.errors.importHashExistent',
      );
    }

    const dataToCreate = {
      ...data,
      importHash,
    };

    return this.create(dataToCreate);
  }

  async _isImportHashExistent(importHash) {
    const count = await TaskRepository.count(
      {
        importHash,
      },
      this.options,
    );

    return count > 0;
  }
}
/// File is generated from https://studio.fabbuilder.com - task
