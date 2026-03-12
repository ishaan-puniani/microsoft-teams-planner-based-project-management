import { i18n } from 'src/i18n';
import exporterRenders from 'src/modules/shared/exporter/exporterRenders';

export default [
  { name: 'id', label: i18n('entities.scheduledEvent.fields.id') },
  { name: 'title', label: i18n('entities.scheduledEvent.fields.title') },
  { name: 'description', label: i18n('entities.scheduledEvent.fields.description') },
  {
    name: 'startDate',
    label: i18n('entities.scheduledEvent.fields.startDate'),
    render: exporterRenders.datetime(),
  },
  {
    name: 'endDate',
    label: i18n('entities.scheduledEvent.fields.endDate'),
    render: exporterRenders.datetime(),
  },
  { name: 'allDay', label: i18n('entities.scheduledEvent.fields.allDay') },
  { name: 'location', label: i18n('entities.scheduledEvent.fields.location') },
  { name: 'timezone', label: i18n('entities.scheduledEvent.fields.timezone') },
  { name: 'rruleString', label: i18n('entities.scheduledEvent.fields.rruleString') },
  {
    name: 'createdAt',
    label: i18n('entities.scheduledEvent.fields.createdAt'),
    render: exporterRenders.datetime(),
  },
  {
    name: 'updatedAt',
    label: i18n('entities.scheduledEvent.fields.updatedAt'),
    render: exporterRenders.datetime(),
  },
];
