/// File is generated from https://studio.fabbuilder.com - task

import MongooseRepository from './mongooseRepository';
import MongooseQueryUtils from '../utils/mongooseQueryUtils';
import AuditLogRepository from './auditLogRepository';
import Error404 from '../../errors/Error404';
import { IRepositoryOptions } from './IRepositoryOptions';
import lodash from 'lodash';
import Task from '../models/task';

import FileRepository from './fileRepository';
import UserRepository from './userRepository';
import ProjectRepository from './projectRepository';

class TaskRepository {
  static async create(data, options: IRepositoryOptions) {
    const currentTenant =
      MongooseRepository.getCurrentTenant(options);
    const currentUser =
      MongooseRepository.getCurrentUser(options);

    data.key = await ProjectRepository.getNewCounter(
      data.project,
      options,
    );

    const [record] = await Task(options.database).create(
      [
        {
          ...data,
          tenant: currentTenant.id,
          createdBy: currentUser.id,
          updatedBy: currentUser.id,
        },
      ],
      options,
    );

    await this._createAuditLog(
      AuditLogRepository.CREATE,
      record.id,
      data,
      options,
    );

    return this.findById(record.id, options);
  }

  static async update(
    id,
    data,
    options: IRepositoryOptions,
  ) {
    const currentTenant =
      MongooseRepository.getCurrentTenant(options);
    let record =
      await MongooseRepository.wrapWithSessionIfExists(
        Task(options.database).findOne({
          _id: id,
          tenant: currentTenant.id,
        }),
        options,
      );

    if (!record) {
      throw new Error404();
    }

    await Task(options.database).updateOne(
      { _id: id },
      {
        ...data,
        updatedBy:
          MongooseRepository.getCurrentUser(options).id,
      },
      options,
    );

    await this._createAuditLog(
      AuditLogRepository.UPDATE,
      id,
      data,
      options,
    );

    record = await this.findById(id, options);

    return record;
  }

  static async bulkUpdateEstimates(
    updates: Array<{
      id: string;
      title?: string;
      storyPoints?: string;
      estimatedTime?: Record<string, number>;
    }>,
    options: IRepositoryOptions,
  ) {
    const currentTenant =
      MongooseRepository.getCurrentTenant(options);
    const currentUser =
      MongooseRepository.getCurrentUser(options);

    for (const item of updates) {
      const data: Record<string, unknown> = {
        updatedBy: currentUser.id,
      };
      if (item.title !== undefined) data.title = item.title;
      if (item.storyPoints !== undefined)
        data.storyPoints = item.storyPoints;
      if (item.estimatedTime !== undefined)
        data.estimatedTime = item.estimatedTime;

      await Task(options.database).updateOne(
        { _id: item.id, tenant: currentTenant.id },
        data,
        options,
      );

      await this._createAuditLog(
        AuditLogRepository.UPDATE,
        item.id,
        data,
        options,
      );
    }

    return updates.length;
  }

  /**
   * Bulk insert tasks from MS Planner sync, skipping any task whose
   * msPlannerTaskId is already referred to by an existing task in the tenant.
   */
  static async insertBulkTasksIgnoreAlreadyReferredByMsPlannerTaskId(
    projectId,
    tasksData: Array<{
      msPlannerTaskId: string;
      title: string;
      categories: string[];
      description?: string;
      estimatedStart?: Date;
      estimatedEnd?: Date;
      assignedTo?: string[];
      status?: string;
      bucket?: string;
    }>,
    options: IRepositoryOptions,
  ): Promise<number> {
    if (!tasksData || tasksData.length === 0) {
      return 0;
    }

    const currentTenant =
      MongooseRepository.getCurrentTenant(options);
    const currentUser =
      MongooseRepository.getCurrentUser(options);

    const msPlannerTaskIds = tasksData.map((t) => t.msPlannerTaskId);
    const existingMsPlannerTaskIds = await MongooseRepository.wrapWithSessionIfExists(
      Task(options.database)
        .find({
          msPlannerTaskId: { $in: msPlannerTaskIds },
          tenant: currentTenant.id,
        })
        .distinct('msPlannerTaskId'),
      options,
    );
    const existingSet = new Set(
      (existingMsPlannerTaskIds || []).map(String),
    );
    const toInsert = tasksData.filter((t) => !existingSet.has(t.msPlannerTaskId));
    if (toInsert.length === 0) {
      return 0;
    }

    const docs: any[] = [];
    for (const item of toInsert) {
      const key = await ProjectRepository.getNewCounter(
        projectId,
        options,
      );
      docs.push({
        project: projectId,
        key,
        title: item.title,
        categories: item.categories || [],
        msPlannerTaskId: item.msPlannerTaskId,
        status: item.status ?? 'OPEN',
        tenant: currentTenant.id,
        createdBy: currentUser.id,
        updatedBy: currentUser.id,
        ...(item.description != null && { description: item.description }),
        ...(item.estimatedStart != null && {
          estimatedStart: item.estimatedStart,
        }),
        ...(item.estimatedEnd != null && {
          estimatedEnd: item.estimatedEnd,
        }),
        ...(item.assignedTo != null &&
          item.assignedTo.length > 0 && { assignedTo: item.assignedTo }),
        ...(item.bucket != null && item.bucket !== '' && { bucket: item.bucket }),
      });
    }

    await Task(options.database).insertMany(docs, options);
    return toInsert.length;
  }

  static async destroy(id, options: IRepositoryOptions) {
    const currentTenant =
      MongooseRepository.getCurrentTenant(options);
    let record =
      await MongooseRepository.wrapWithSessionIfExists(
        Task(options.database).findOne({
          _id: id,
          tenant: currentTenant.id,
        }),
        options,
      );

    if (!record) {
      throw new Error404();
    }

    await Task(options.database).deleteOne(
      { _id: id },
      options,
    );

    await this._createAuditLog(
      AuditLogRepository.DELETE,
      id,
      record,
      options,
    );
  }
  static async filterIdInTenant(
    id,
    options: IRepositoryOptions,
  ) {
    return lodash.get(
      await this.filterIdsInTenant([id], options),
      '[0]',
      null,
    );
  }

  static async filterIdsInTenant(
    ids,
    options: IRepositoryOptions,
  ) {
    if (!ids || !ids.length) {
      return [];
    }

    const currentTenant =
      MongooseRepository.getCurrentTenant(options);

    const records = await Task(options.database)
      .find({
        _id: { $in: ids },
        tenant: currentTenant.id,
      })
      .select(['_id']);

    return records.map((record) => record._id);
  }

  static async count(filter, options: IRepositoryOptions) {
    const currentTenant =
      MongooseRepository.getCurrentTenant(options);

    return MongooseRepository.wrapWithSessionIfExists(
      Task(options.database).countDocuments({
        ...filter,
        tenant: currentTenant.id,
      }),
      options,
    );
  }

  static async findById(id, options: IRepositoryOptions) {
    const currentTenant =
      MongooseRepository.getCurrentTenant(options);
    const tenantCriteria = { tenant: currentTenant.id };
    const isObjectId =
      typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id);
    const orConditions: any[] = [{ key: id }];
    if (isObjectId) {
      orConditions.unshift({ _id: id });
    }
    let record =
      await MongooseRepository.wrapWithSessionIfExists(
        Task(options.database)
          .findOne({
            $or: orConditions,
            ...tenantCriteria,
          })
          .populate('project')
          .populate('template')
          .populate('parents')
          .populate('leadBy')
          .populate('reviewedBy'),
        options,
      );

    if (!record) {
      throw new Error404();
    }

    return this._mapRelationshipsAndFillDownloadUrl(record);
  }

  static async findAndCountAll(
    {
      filter,
      limit = 0,
      offset = 0,
      orderBy = '',
      countOnly = false,
    },
    options: IRepositoryOptions,
  ) {
    let criteriaAnd: any = [];

    const currentTenant =
      MongooseRepository.getCurrentTenant(options);
    const defaultFilter: any = {
      tenant: currentTenant.id,
    };

    if (options.projectId) {
      defaultFilter.project = MongooseQueryUtils.uuid(
        options.projectId,
      );
    }

    criteriaAnd.push(defaultFilter);

    if (filter) {
      if (filter.id) {
        criteriaAnd.push({
          ['_id']: MongooseQueryUtils.uuid(filter.id),
        });
      }
      if (filter.project) {
        criteriaAnd.push({
          project: MongooseQueryUtils.uuid(filter.project),
        });
      }
      if (filter.title) {
        criteriaAnd.push({
          title: {
            $regex: MongooseQueryUtils.escapeRegExp(
              filter.title,
            ),
            $options: 'i',
          },
        });
      }

      if (filter.type) {
        criteriaAnd.push({
          type: {
            $regex: MongooseQueryUtils.escapeRegExp(
              filter.type,
            ),
            $options: 'i',
          },
        });
      }

      if (filter.parents != null && filter.parents !== '') {
        const parentId = MongooseQueryUtils.uuid(
          filter.parents,
        );
        if (parentId) {
          criteriaAnd.push({ parents: parentId });
        }
      }

      if (filter.description) {
        criteriaAnd.push({
          description: {
            $regex: MongooseQueryUtils.escapeRegExp(
              filter.description,
            ),
            $options: 'i',
          },
        });
      }

      if (filter.status) {
        criteriaAnd.push({
          status: filter.status,
        });
      }

      if (
        filter.tags != null &&
        Array.isArray(filter.tags) &&
        filter.tags.length > 0
      ) {
        const tagIds = filter.tags
          .map((id) => MongooseQueryUtils.uuid(id))
          .filter(Boolean);
        if (tagIds.length > 0) {
          criteriaAnd.push({
            tags: { $in: tagIds },
          });
        }
      }

      if (filter.leadBy) {
        criteriaAnd.push({
          leadBy: MongooseQueryUtils.uuid(filter.leadBy),
        });
      }

      if (filter.reviewedBy) {
        criteriaAnd.push({
          reviewedBy: MongooseQueryUtils.uuid(
            filter.reviewedBy,
          ),
        });
      }

      if (filter.estimatedStartRange) {
        const [start, end] = filter.estimatedStartRange;

        if (
          start !== undefined &&
          start !== null &&
          start !== ''
        ) {
          criteriaAnd.push({
            estimatedStart: {
              $gte: start,
            },
          });
        }

        if (
          end !== undefined &&
          end !== null &&
          end !== ''
        ) {
          criteriaAnd.push({
            estimatedStart: {
              $lte: end,
            },
          });
        }
      }

      if (filter.estimatedEndRange) {
        const [start, end] = filter.estimatedEndRange;

        if (
          start !== undefined &&
          start !== null &&
          start !== ''
        ) {
          criteriaAnd.push({
            estimatedEnd: {
              $gte: start,
            },
          });
        }

        if (
          end !== undefined &&
          end !== null &&
          end !== ''
        ) {
          criteriaAnd.push({
            estimatedEnd: {
              $lte: end,
            },
          });
        }
      }

      if (filter.workStartRange) {
        const [start, end] = filter.workStartRange;

        if (
          start !== undefined &&
          start !== null &&
          start !== ''
        ) {
          criteriaAnd.push({
            workStart: {
              $gte: start,
            },
          });
        }

        if (
          end !== undefined &&
          end !== null &&
          end !== ''
        ) {
          criteriaAnd.push({
            workStart: {
              $lte: end,
            },
          });
        }
      }

      if (filter.workEndRange) {
        const [start, end] = filter.workEndRange;

        if (
          start !== undefined &&
          start !== null &&
          start !== ''
        ) {
          criteriaAnd.push({
            workEnd: {
              $gte: start,
            },
          });
        }

        if (
          end !== undefined &&
          end !== null &&
          end !== ''
        ) {
          criteriaAnd.push({
            workEnd: {
              $lte: end,
            },
          });
        }
      }

      if (filter.createdAtRange) {
        const [start, end] = filter.createdAtRange;

        if (
          start !== undefined &&
          start !== null &&
          start !== ''
        ) {
          criteriaAnd.push({
            ['createdAt']: {
              $gte: start,
            },
          });
        }

        if (
          end !== undefined &&
          end !== null &&
          end !== ''
        ) {
          criteriaAnd.push({
            ['createdAt']: {
              $lte: end,
            },
          });
        }
      }
    }

    const sort = MongooseQueryUtils.sort(
      orderBy || 'createdAt_DESC',
    );

    const skip = Number(offset || 0) || undefined;
    const limitEscaped = Number(limit || 0) || undefined;
    const criteria = criteriaAnd.length
      ? { $and: criteriaAnd }
      : null;

    if (countOnly) {
      const count = await Task(
        options.database,
      ).countDocuments(criteria);
      return { count };
    }

    let rows = await Task(options.database)
      .find(criteria)
      .skip(skip)
      .limit(limitEscaped)
      .sort(sort)
      .populate('leadBy')
      .populate('reviewedBy');
    const count = await Task(
      options.database,
    ).countDocuments(criteria);

    rows = await Promise.all(
      rows.map(this._mapRelationshipsAndFillDownloadUrl),
    );

    return { rows, count };
  }

  static async findAllAutocomplete(
    search,
    limit,
    options: IRepositoryOptions,
  ) {
    const currentTenant =
      MongooseRepository.getCurrentTenant(options);

    let criteriaAnd: Array<any> = [
      {
        tenant: currentTenant.id,
      },
    ];

    if (search) {
      criteriaAnd.push({
        $or: [
          {
            _id: MongooseQueryUtils.uuid(search),
          },
        ],
      });
    }

    const sort = MongooseQueryUtils.sort('id_ASC');
    const limitEscaped = Number(limit || 0) || undefined;

    const criteria = { $and: criteriaAnd };

    const records = await Task(options.database)
      .find(criteria)
      .limit(limitEscaped)
      .sort(sort);

    return records.map((record) => ({
      id: record.id,
      label: record.id,
    }));
  }

  static async aggregateEstimatesByProject(
    projectId: string,
    options: IRepositoryOptions,
  ) {
    const currentTenant =
      MongooseRepository.getCurrentTenant(options);
    const criteria = {
      tenant: currentTenant.id,
      project: MongooseQueryUtils.uuid(projectId),
    };
    const rows = await Task(options.database)
      .find(criteria)
      .select('estimatedTime')
      .lean();
    const totals = {
      architect: 0,
      developer: 0,
      tester: 0,
      businessAnalyst: 0,
      ux: 0,
      pm: 0,
    };
    const keyMap: Record<string, keyof typeof totals> = {
      atchitect: 'architect',
      developer: 'developer',
      tester: 'tester',
      businessAnalyst: 'businessAnalyst',
      UX: 'ux',
      PM: 'pm',
    };
    for (const row of rows) {
      const et = row.estimatedTime;
      if (!et || typeof et !== 'object') continue;
      for (const [dbKey, outKey] of Object.entries(
        keyMap,
      )) {
        const v = et[dbKey];
        if (typeof v === 'number' && !Number.isNaN(v)) {
          totals[outKey] += v;
        }
      }
    }
    return totals;
  }

  static async _createAuditLog(
    action,
    id,
    data,
    options: IRepositoryOptions,
  ) {
    await AuditLogRepository.log(
      {
        entityName: Task(options.database).modelName,
        entityId: id,
        action,
        values: data,
      },
      options,
    );
  }

  static async _mapRelationshipsAndFillDownloadUrl(record) {
    if (!record) {
      return null;
    }

    const output = record.toObject
      ? record.toObject()
      : record;

    output.attachment =
      await FileRepository.fillDownloadUrl(
        output.attachment,
      );

    output.leadBy = UserRepository.cleanupForRelationships(
      output.leadBy,
    );

    output.reviewedBy =
      UserRepository.cleanupForRelationships(
        output.reviewedBy,
      );

    return output;
  }
}

export default TaskRepository;
/// File is generated from https://studio.fabbuilder.com - task
