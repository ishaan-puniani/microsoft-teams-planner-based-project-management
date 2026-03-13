import MongooseRepository from './mongooseRepository';
import MongooseQueryUtils from '../utils/mongooseQueryUtils';
import AuditLogRepository from './auditLogRepository';
import Error404 from '../../errors/Error404';
import { IRepositoryOptions } from './IRepositoryOptions';
import lodash from 'lodash';
import ScheduledEvent from '../models/scheduledEvent';
import { RRule, RRuleSet, rrulestr } from 'rrule';

class ScheduledEventRepository {
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
   * Returns all events that have an occurrence in the window [now, now + hours].
   * For recurring events the rrule string is expanded; for one-off events the
   * startDate is compared directly.
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

    // Fetch all events for this tenant that could possibly fire in the window.
    // We do a broad DB pre-filter to avoid loading everything:
    //  - one-off events whose startDate falls in the window, OR
    //  - recurring events (have rruleString) whose startDate <= windowEnd
    //    (recurrence may have started in the past and fire again soon)
    const candidates = await ScheduledEvent(options.database).find({
      tenant: currentTenant.id,
      $or: [
        // One-off: startDate in window
        {
          rruleString: { $in: [null, ''] },
          startDate: { $gte: now, $lte: windowEnd },
        },
        // Recurring: started at or before windowEnd (could fire again)
        {
          rruleString: { $exists: true, $ne: '' },
          startDate: { $lte: windowEnd },
        },
      ],
    });

    const results: Array<{ event: any; nextOccurrence: Date }> = [];

    for (const record of candidates) {
      const plain = record.toObject ? record.toObject() : record;

      if (!plain.rruleString) {
        // Simple one-off event
        results.push({ event: plain, nextOccurrence: plain.startDate });
        continue;
      }

      try {
        // Build an RRuleSet so we can respect exdates / rdates
        const ruleSet = new RRuleSet();

        // Parse the base rule; rrulestr can handle full DTSTART+RRULE strings
        const baseRule = rrulestr(plain.rruleString, {
          // If DTSTART is not embedded in the string, fall back to startDate
          dtstart: plain.startDate || now,
        });
        ruleSet.rrule(baseRule);

        // Apply excluded dates
        if (plain.exdates && plain.exdates.length) {
          for (const exdate of plain.exdates) {
            ruleSet.exdate(new Date(exdate));
          }
        }
        // Apply extra (added) dates
        if (plain.rdates && plain.rdates.length) {
          for (const rdate of plain.rdates) {
            ruleSet.rdate(new Date(rdate));
          }
        }

        // Find the next occurrence in the window
        const occurrences = ruleSet.between(now, windowEnd, true /* inclusive */);

        if (occurrences.length > 0) {
          results.push({ event: plain, nextOccurrence: occurrences[0] });
        }
      } catch (_) {
        // Malformed rruleString — skip this record
      }
    }

    // Sort by nextOccurrence ascending
    results.sort(
      (a, b) => a.nextOccurrence.getTime() - b.nextOccurrence.getTime(),
    );

    return results;
  }

  /**
   * Returns all events that are currently in progress at the moment this is called.
    * - One-off events: startDate <= now <= (endDate || startDate + durationMinutes)
    *   (including allDay events starting today).
    * - Recurring events: the most recent occurrence started before now and its
    *   computed end time (occurrenceStart + durationMinutes) is still in the future.
   * Each result entry is: { event, occurrenceStart: Date, occurrenceEnd: Date | null }
   */
  static async findCurrentlyRunning(options: IRepositoryOptions) {
    const currentTenant = MongooseRepository.getCurrentTenant(options);

    const now = new Date();

    // For allDay events without an endDate, treat them as spanning the whole day.
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const getEventDurationMs = (event: any): number => {
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
    };

    // Broad DB pre-filter — we refine further in memory for recurring events.
    const candidates = await ScheduledEvent(options.database).find({
      tenant: currentTenant.id,
      startDate: { $lte: now },
      $or: [
        // One-off with explicit endDate still in the future
        { rruleString: { $in: [null, ''] }, endDate: { $gte: now } },
        // One-off with explicit duration (minutes)
        { rruleString: { $in: [null, ''] }, durationMinutes: { $gt: 0 } },
        // Backward compatibility for existing numeric duration fields.
        { rruleString: { $in: [null, ''] }, duration: { $gt: 0 } },
        { rruleString: { $in: [null, ''] }, durationMs: { $gt: 0 } },
        // One-off allDay without endDate — started today
        { rruleString: { $in: [null, ''] }, allDay: true, startDate: { $gte: todayStart } },
        // Recurring — could have an active occurrence (started before now)
        { rruleString: { $exists: true, $ne: '' } },
      ],
    });

    const results: Array<{
      event: any;
      occurrenceStart: Date;
      occurrenceEnd: Date | null;
    }> = [];

    for (const record of candidates) {
      const plain = record.toObject ? record.toObject() : record;

      if (!plain.rruleString) {
        // One-off — verify it's still active when duration is used instead of endDate.
        const oneOffDurationMs = getEventDurationMs(plain);
        const occurrenceStart = new Date(plain.startDate);
        const derivedEndDate =
          oneOffDurationMs > 0
            ? new Date(occurrenceStart.getTime() + oneOffDurationMs)
            : null;
        const occurrenceEnd = plain.endDate
          ? new Date(plain.endDate)
          : derivedEndDate;

        // Without an end boundary (endDate or duration), we cannot assert "currently running".
        if (!occurrenceEnd) {
          continue;
        }

        if (occurrenceEnd.getTime() < now.getTime()) {
          continue;
        }

        results.push({
          event: plain,
          occurrenceStart,
          occurrenceEnd,
        });
        continue;
      }

      // Recurring: compute duration, then look for an occurrence in [now - duration, now]
      try {
        const durationMs = getEventDurationMs(plain);

        if (durationMs <= 0) {
          continue;
        }

        // An occurrence is "active" when: occurrence <= now <= occurrence + durationMs
        // i.e., occurrence must be in [now - durationMs, now]
        const searchFrom = new Date(now.getTime() - Math.max(durationMs, 0));

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

        const occurrences = ruleSet.between(searchFrom, now, true /* inclusive */);

        // Walk from most recent backwards — first one that is still in progress wins
        for (let i = occurrences.length - 1; i >= 0; i--) {
          const occ = occurrences[i];
          const occEnd = new Date(occ.getTime() + durationMs);

          if (occEnd.getTime() >= now.getTime()) {
            results.push({
              event: plain,
              occurrenceStart: occ,
              occurrenceEnd: occEnd,
            });
            break; // Only one active occurrence per event
          }
        }
      } catch (_) {
        // Malformed rruleString — skip
      }
    }

    // Sort by occurrenceStart ascending
    results.sort(
      (a, b) => a.occurrenceStart.getTime() - b.occurrenceStart.getTime(),
    );

    return results;
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
