import { i18n } from 'src/i18n';
import schemas from 'src/modules/shared/yup/yupImporterSchemas';

export default [
  {
    name: 'title',
    label: i18n('entities.scheduledEvent.fields.title'),
    schema: schemas.string(
      i18n('entities.scheduledEvent.fields.title'),
      { required: true },
    ),
  },
  {
    name: 'startDate',
    label: i18n('entities.scheduledEvent.fields.startDate'),
    schema: schemas.string(
      i18n('entities.scheduledEvent.fields.startDate'),
      {},
    ),
  },
  {
    name: 'endDate',
    label: i18n('entities.scheduledEvent.fields.endDate'),
    schema: schemas.string(
      i18n('entities.scheduledEvent.fields.endDate'),
      {},
    ),
  },
  {
    name: 'durationMinutes',
    label: i18n('entities.scheduledEvent.fields.durationMinutes'),
    schema: schemas.integer(
      i18n('entities.scheduledEvent.fields.durationMinutes'),
      { min: 1 },
    ),
  },
  {
    name: 'timezone',
    label: i18n('entities.scheduledEvent.fields.timezone'),
    schema: schemas.string(
      i18n('entities.scheduledEvent.fields.timezone'),
      {},
    ),
  },
  {
    name: 'rruleString',
    label: i18n('entities.scheduledEvent.fields.rruleString'),
    schema: schemas.string(
      i18n('entities.scheduledEvent.fields.rruleString'),
      {},
    ),
  },
];
