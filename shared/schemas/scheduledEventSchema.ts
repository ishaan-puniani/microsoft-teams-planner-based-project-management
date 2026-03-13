import * as yup from 'yup';

const rruleSchema = yup.object({
  freq: yup
    .string()
    .oneOf(['SECONDLY', 'MINUTELY', 'HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'])
    .required(),
  dtstart: yup.date().optional(),
  until: yup.date().optional(),
  count: yup.number().integer().min(1).optional(),
  interval: yup.number().integer().min(1).optional(),
  byday: yup.array().of(yup.string()).optional(),
  bymonthday: yup.array().of(yup.number().integer()).optional(),
  byyearday: yup.array().of(yup.number().integer()).optional(),
  byweekno: yup.array().of(yup.number().integer()).optional(),
  bymonth: yup.array().of(yup.number().integer().min(1).max(12)).optional(),
  bysetpos: yup.array().of(yup.number().integer()).optional(),
  byhour: yup.array().of(yup.number().integer().min(0).max(23)).optional(),
  byminute: yup.array().of(yup.number().integer().min(0).max(59)).optional(),
  bysecond: yup.array().of(yup.number().integer().min(0).max(60)).optional(),
  wkst: yup.string().oneOf(['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']).optional(),
  tzid: yup.string().optional(),
});

export const scheduledEventSchema = yup.object({
  title: yup.string().required(),
  description: yup.string().optional(),
  startDate: yup.date().required(),
  endDate: yup.date().optional(),
  durationMinutes: yup.number().integer().min(1).optional(),
  allDay: yup.boolean().optional(),
  location: yup.string().optional(),
  timezone: yup.string().optional(),
  rrule: rruleSchema.optional().nullable(),
  rruleString: yup.string().optional(),
  exdates: yup.array().of(yup.date()).optional(),
  rdates: yup.array().of(yup.date()).optional(),
  nextStart: yup.date().optional(),
  nextEnd: yup.date().optional(),
  tenant: yup.string().required(),
  createdBy: yup.string().optional(),
  updatedBy: yup.string().optional(),
  importHash: yup.string().optional(),
});

export const scheduledEventCreateSchema = scheduledEventSchema.omit([
  'createdBy',
  'updatedBy',
  'importHash',
  'nextStart',
  'nextEnd',
]);

export const scheduledEventUpdateSchema = scheduledEventSchema
  .partial()
  .omit(['createdBy', 'updatedBy', 'importHash', 'nextStart', 'nextEnd']);

export const scheduledEventFilterSchema = yup.object({
  title: yup.string().optional(),
  startDateRange: yup.array().of(yup.date()).max(2).optional(),
  endDateRange: yup.array().of(yup.date()).max(2).optional(),
  timezone: yup.string().optional(),
  tenant: yup.string().optional(),
  importHash: yup.string().optional(),
});
