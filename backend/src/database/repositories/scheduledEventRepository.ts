import MongooseRepository from './mongooseRepository';
import MongooseQueryUtils from '../utils/mongooseQueryUtils';
import AuditLogRepository from './auditLogRepository';
import Error404 from '../../errors/Error404';
import { IRepositoryOptions } from './IRepositoryOptions';
import lodash from 'lodash';
import ScheduledEvent from '../models/scheduledEvent';
import { RRule, RRuleSet, rrulestr } from 'rrule';

class ScheduledEventRepository {
  static readonly DEFAULT_STALE_REFRESH_LIMIT = 200;

  static _getEventDurationMs(event: any): number {
    if (
      typeof event?.durationMs === 'number' &&
      Number.isFinite(event.durationMs) &&
      event.durationMs > 0
    ) {
      return event.durationMs;
    }

    if (
      typeof event?.duration === 'number' &&
      Number.isFinite(event.duration) &&
      event.duration > 0
    ) {
      return event.duration * 60 * 1000;
    }

    if (
      typeof event?.durationMinutes === 'number' &&
      Number.isFinite(event.durationMinutes) &&
      event.durationMinutes > 0
    ) {
      return event.durationMinutes * 60 * 1000;
    }

    if (event?.allDay) {
      return 24 * 60 * 60 * 1000;
    }

    return 0;
  }

  static _computeCachedNextWindow(
    event: any,
    now: Date,
  ): { nextStart: Date | null; nextEnd: Date | null } {
    const plain = event?.toObject ? event.toObject() : event;

    let nextStart: Date | null = null;
    let nextEnd: Date | null = null;

    const durationMs = this._getEventDurationMs(plain);

    if (!plain?.rruleString) {
      if (plain?.startDate) {
        const oneOffStart = new Date(plain.startDate);
        const oneOffEnd = plain.endDate
          ? new Date(plain.endDate)
          : durationMs > 0
            ? new Date(oneOffStart.getTime() + durationMs)
            : null;

        if (
          oneOffEnd &&
          oneOffStart.getTime() <= now.getTime() &&
          oneOffEnd.getTime() >= now.getTime()
        ) {
          nextStart = oneOffStart;
          nextEnd = oneOffEnd;
        } else if (oneOffStart.getTime() >= now.getTime()) {
          nextStart = oneOffStart;
          nextEnd = oneOffEnd;
        }
      }

      return { nextStart, nextEnd };
    }

    try {
      const ruleSet = new RRuleSet();
      const baseRule = rrulestr(plain.rruleString, {
        dtstart: plain.startDate || now,
      });
      ruleSet.rrule(baseRule);

      if (plain.exdates && plain.exdates.length) {
        for (const exdate of plain.exdates) {
          ruleSet.exdate(new Date(exdate));
        }
      }

      if (plain.rdates && plain.rdates.length) {
        for (const rdate of plain.rdates) {
          ruleSet.rdate(new Date(rdate));
        }
      }

      if (durationMs > 0) {
        const searchFrom = new Date(now.getTime() - durationMs);
        const recentOccurrences = ruleSet.between(
          searchFrom,
          now,
          true,
        );

        for (let i = recentOccurrences.length - 1; i >= 0; i--) {
          const occ = recentOccurrences[i];
          const occEnd = new Date(occ.getTime() + durationMs);

          if (occEnd.getTime() >= now.getTime()) {
            nextStart = occ;
            nextEnd = occEnd;
            break;
          }
        }
      }

      if (!nextStart) {
        const occurrence = ruleSet.after(now, true);

        if (occurrence) {
          nextStart = occurrence;

          if (durationMs > 0) {
            nextEnd = new Date(occurrence.getTime() + durationMs);
          }
        }
      }
    } catch (_) {
      // Malformed rruleString — clear cache for this record
    }

    return { nextStart, nextEnd };
  }

  static async _refreshStaleUpcomingCache(
    options: IRepositoryOptions,
    now: Date,
    maxToRefresh: number = ScheduledEventRepository.DEFAULT_STALE_REFRESH_LIMIT,
  ) {
    const currentTenant =
      MongooseRepository.getCurrentTenant(options);

    const boundedLimit = Math.max(
      1,
      Math.min(
        Number(maxToRefresh) ||
          ScheduledEventRepository.DEFAULT_STALE_REFRESH_LIMIT,
        2000,
      ),
    );

    // Targeted refresh for stale recurring rows:
    // 1) recurrence still relevant (endDate in future OR open-ended)
    // 2) cached window is stale (nextEnd passed or not initialized)
    const staleRecords = await ScheduledEvent(options.database)
      .find({
        tenant: currentTenant.id,
        rruleString: { $exists: true, $ne: '' },
        $and: [
          {
            $or: [
              { endDate: { $gt: now } },
              { endDate: { $exists: false } },
              { endDate: null },
            ],
          },
          {
            $or: [
              { nextEnd: { $lt: now } },
              { nextEnd: { $exists: false } },
              { nextEnd: null },
            ],
          },
        ],
      })
      .select([
        '_id',
        'startDate',
        'endDate',
        'durationMinutes',
        'duration',
        'durationMs',
        'allDay',
        'rruleString',
        'exdates',
        'rdates',
        'nextStart',
        'nextEnd',
      ])
      .sort({ nextEnd: 1, _id: 1 })
      .limit(boundedLimit);

    if (!staleRecords.length) {
      return 0;
    }

    const operations = staleRecords.map((record) => {
      const { nextStart, nextEnd } = this._computeCachedNextWindow(
        record,
        now,
      );

      return {
        updateOne: {
          filter: { _id: record._id },
          update: {
            $set: {
              nextStart,
              nextEnd,
            },
          },
        },
      };
    });

    await ScheduledEvent(options.database).bulkWrite(operations, {
      ordered: false,
    });

    return staleRecords.length;
  }

  static async refreshUpcomingCache(
    options: IRepositoryOptions,
    maxToRefresh: number = ScheduledEventRepository.DEFAULT_STALE_REFRESH_LIMIT,
  ) {
    const now = new Date();
    const refreshed = await this._refreshStaleUpcomingCache(
      options,
      now,
      maxToRefresh,
    );

    return {
      refreshed,
      refreshedAt: now,
      maxToRefresh,
    };
  }

  static async create(data, options: IRepositoryOptions) {
    const currentTenant =
      MongooseRepository.getCurrentTenant(options);
    const currentUser =
      MongooseRepository.getCurrentUser(options);

    const [record] = await ScheduledEvent(
      options.database,
    ).create(
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
        ScheduledEvent(options.database).findOne({
          _id: id,
          tenant: currentTenant.id,
        }),
        options,
      );

    if (!record) {
      throw new Error404();
    }

    await ScheduledEvent(options.database).updateOne(
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

    return this.findById(id, options);
  }

  static async destroy(id, options: IRepositoryOptions) {
    const currentTenant =
      MongooseRepository.getCurrentTenant(options);
    let record =
      await MongooseRepository.wrapWithSessionIfExists(
        ScheduledEvent(options.database).findOne({
          _id: id,
          tenant: currentTenant.id,
        }),
        options,
      );

    if (!record) {
      throw new Error404();
    }

    await ScheduledEvent(options.database).deleteOne(
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

    const records = await ScheduledEvent(options.database)
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
      ScheduledEvent(options.database).countDocuments({
        ...filter,
        tenant: currentTenant.id,
      }),
      options,
    );
  }

  static async findById(id, options: IRepositoryOptions) {
    const currentTenant =
      MongooseRepository.getCurrentTenant(options);
    let record =
      await MongooseRepository.wrapWithSessionIfExists(
        ScheduledEvent(options.database).findOne({
          _id: id,
          tenant: currentTenant.id,
        }),
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
    criteriaAnd.push({ tenant: currentTenant.id });

    if (filter) {
      if (filter.id) {
        criteriaAnd.push({
          ['_id']: MongooseQueryUtils.uuid(filter.id),
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

      if (filter.timezone) {
        criteriaAnd.push({
          timezone: {
            $regex: MongooseQueryUtils.escapeRegExp(
              filter.timezone,
            ),
            $options: 'i',
          },
        });
      }

      if (filter.startDateRange) {
        const [start, end] = filter.startDateRange;
        if (start !== undefined && start !== null && start !== '') {
          criteriaAnd.push({ startDate: { $gte: start } });
        }
        if (end !== undefined && end !== null && end !== '') {
          criteriaAnd.push({ startDate: { $lte: end } });
        }
      }

      if (filter.endDateRange) {
        const [start, end] = filter.endDateRange;
        if (start !== undefined && start !== null && start !== '') {
          criteriaAnd.push({ endDate: { $gte: start } });
        }
        if (end !== undefined && end !== null && end !== '') {
          criteriaAnd.push({ endDate: { $lte: end } });
        }
      }

      if (filter.createdAtRange) {
        const [start, end] = filter.createdAtRange;
        if (start !== undefined && start !== null && start !== '') {
          criteriaAnd.push({ ['createdAt']: { $gte: start } });
        }
        if (end !== undefined && end !== null && end !== '') {
          criteriaAnd.push({ ['createdAt']: { $lte: end } });
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
      const count = await ScheduledEvent(
        options.database,
      ).countDocuments(criteria);
      return { count };
    }

    let rows = await ScheduledEvent(options.database)
      .find(criteria)
      .skip(skip)
      .limit(limitEscaped)
      .sort(sort);

    const count = await ScheduledEvent(
      options.database,
    ).countDocuments(criteria);

    rows = await Promise.all(
      rows.map(this._mapRelationshipsAndFillDownloadUrl),
    );

    return { rows, count };
  }

  /**
   * Returns all events whose cached nextStart is in the window [now, now + hours].
   * Each result entry is: { event, nextOccurrence: Date }
   */
  static async findUpcoming(
    hours: number,
    options: IRepositoryOptions,
  ) {
    const currentTenant =
      MongooseRepository.getCurrentTenant(options);

    const now = new Date();
    const windowEnd = new Date(now.getTime() + hours * 60 * 60 * 1000);

    await this._refreshStaleUpcomingCache(
      options,
      now,
      ScheduledEventRepository.DEFAULT_STALE_REFRESH_LIMIT,
    );

    const records = await ScheduledEvent(options.database)
      .find({
      tenant: currentTenant.id,
      nextStart: { $gte: now, $lte: windowEnd },
    })
      .sort({ nextStart: 1 });

    return records.map((record) => {
      const plain = record.toObject ? record.toObject() : record;
      return {
        event: plain,
        nextOccurrence: new Date(plain.nextStart),
      };
    });
  }

  /**
   * Computes and stores the next occurrence window for all tenant scheduled events.
   * If an occurrence is currently running, it is cached as [nextStart, nextEnd].
   * Otherwise, the next future occurrence is cached.
   */
  static async updateNextOccurance(
    options: IRepositoryOptions,
  ) {
    const currentTenant =
      MongooseRepository.getCurrentTenant(options);

    const now = new Date();

    const records = await ScheduledEvent(options.database).find({
      tenant: currentTenant.id,
    });

    const operations: Array<any> = [];

    for (const record of records) {
      const { nextStart, nextEnd } = this._computeCachedNextWindow(
        record,
        now,
      );

      operations.push({
        updateOne: {
          filter: { _id: record._id },
          update: {
            $set: {
              nextStart,
              nextEnd,
            },
          },
        },
      });
    }

    if (operations.length) {
      await ScheduledEvent(options.database).bulkWrite(operations, {
        ordered: false,
      });
    }

    return {
      total: records.length,
      updated: operations.length,
      updatedAt: now,
    };
  }

  /**
   * Returns all events currently running based on cached nextStart/nextEnd window.
   * Each result entry is: { event, occurrenceStart: Date, occurrenceEnd: Date | null }
   */
  static async findCurrentlyRunning(options: IRepositoryOptions) {
    const currentTenant = MongooseRepository.getCurrentTenant(options);

    const now = new Date();

    const records = await ScheduledEvent(options.database)
      .find({
      tenant: currentTenant.id,
      nextStart: { $lte: now },
      nextEnd: { $gte: now },
    })
      .sort({ nextStart: 1 });

    return records.map((record) => {
      const plain = record.toObject ? record.toObject() : record;
      return {
        event: plain,
        occurrenceStart: new Date(plain.nextStart),
        occurrenceEnd: plain.nextEnd ? new Date(plain.nextEnd) : null,
      };
    });
  }

  static async findAllAutocomplete(
    search,
    limit,
    options: IRepositoryOptions,
  ) {
    const currentTenant =
      MongooseRepository.getCurrentTenant(options);

    let criteriaAnd: Array<any> = [
      { tenant: currentTenant.id },
    ];

    if (search) {
      criteriaAnd.push({
        $or: [
          { _id: MongooseQueryUtils.uuid(search) },
          {
            title: {
              $regex: MongooseQueryUtils.escapeRegExp(search),
              $options: 'i',
            },
          },
        ],
      });
    }

    const sort = MongooseQueryUtils.sort('title_ASC');
    const limitEscaped = Number(limit || 0) || undefined;
    const criteria = { $and: criteriaAnd };

    const records = await ScheduledEvent(options.database)
      .find(criteria)
      .limit(limitEscaped)
      .sort(sort);

    return records.map((record) => ({
      id: record.id,
      label: record.title,
    }));
  }

  static async _createAuditLog(
    action,
    id,
    data,
    options: IRepositoryOptions,
  ) {
    await AuditLogRepository.log(
      {
        entityName: ScheduledEvent(options.database).modelName,
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

    return output;
  }
}

export default ScheduledEventRepository;
