import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const RRuleSchema = new Schema(
  {
    freq: {
      type: String,
      enum: ['SECONDLY', 'MINUTELY', 'HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'],
      required: true,
    },
    dtstart: { type: Date },
    until: { type: Date },
    count: { type: Number },
    interval: { type: Number },
    byday: [{ type: String }],
    bymonthday: [{ type: Number }],
    byyearday: [{ type: Number }],
    byweekno: [{ type: Number }],
    bymonth: [{ type: Number }],
    bysetpos: [{ type: Number }],
    byhour: [{ type: Number }],
    byminute: [{ type: Number }],
    bysecond: [{ type: Number }],
    wkst: {
      type: String,
      enum: ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'],
    },
    tzid: { type: String },
  },
  { _id: false },
);

export default (database) => {
  try {
    return database.model('scheduledEvent');
  } catch (error) {
    // continue, because model doesn't exist yet
  }

  const ScheduledEventSchema = new Schema(
    {
      title: {
        type: String,
        required: true,
      },

      description: {
        type: String,
      },

      startDate: {
        type: Date,
        required: true,
      },

      endDate: {
        type: Date,
      },

      // Canonical event length used by recurring "currently running" checks.
      durationMinutes: {
        type: Number,
        min: 1,
      },

      // Cached next occurrence window for quick reads.
      nextStart: {
        type: Date,
      },

      nextEnd: {
        type: Date,
      },

      allDay: {
        type: Boolean,
        default: false,
      },

      location: {
        type: String,
      },

      timezone: {
        type: String,
      },

      /** Structured RRULE configuration object */
      rrule: {
        type: RRuleSchema,
      },

      /**
       * Serialised RRULE string, e.g.
       * "FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR"
       */
      rruleString: {
        type: String,
        index: true,
      },

      /** Excluded occurrence dates */
      exdates: [{ type: Date }],

      /** Extra (added) occurrence dates */
      rdates: [{ type: Date }],

      tenant: {
        type: Schema.Types.ObjectId,
        ref: 'tenant',
        required: true,
      },
      createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
      updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
      importHash: { type: String },
    },
    { timestamps: true },
  );

  ScheduledEventSchema.index(
    { importHash: 1, tenant: 1 },
    {
      unique: true,
      partialFilterExpression: {
        importHash: { $type: 'string' },
      },
    },
  );

  ScheduledEventSchema.virtual('id').get(function () {
    // @ts-ignore
    return this._id.toHexString();
  });

  ScheduledEventSchema.set('toJSON', { getters: true });
  ScheduledEventSchema.set('toObject', { getters: true });

  return database.model('scheduledEvent', ScheduledEventSchema);
};
