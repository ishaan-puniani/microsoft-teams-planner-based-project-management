import { i18n } from 'src/i18n';
import exporterRenders from 'src/modules/shared/exporter/exporterRenders';

export default [
  {
    name: 'id',
    label: i18n('entities.task.fields.id'),
  },
  {
    name: 'title',
    label: i18n('entities.task.fields.title'),
  },
  {
    name: 'description',
    label: i18n('entities.task.fields.description'),
  },
  {
    name: 'attachment',
    label: i18n('entities.task.fields.attachment'),
    render: exporterRenders.filesOrImages(),
  },
  {
    name: 'leadBy',
    label: i18n('entities.task.fields.leadBy'),
    render: exporterRenders.relationToOne(),
  },
  {
    name: 'reviewedBy',
    label: i18n('entities.task.fields.reviewedBy'),
    render: exporterRenders.relationToOne(),
  },
  {
    name: 'estimatedStart',
    label: i18n('entities.task.fields.estimatedStart'),
    render: exporterRenders.datetime(),
  },
  {
    name: 'estimatedEnd',
    label: i18n('entities.task.fields.estimatedEnd'),
    render: exporterRenders.datetime(),
  },
  {
    name: 'workStart',
    label: i18n('entities.task.fields.workStart'),
    render: exporterRenders.datetime(),
  },
  {
    name: 'workEnd',
    label: i18n('entities.task.fields.workEnd'),
    render: exporterRenders.datetime(),
  },
  {
    name: 'createdAt',
    label: i18n('entities.task.fields.createdAt'),
    render: exporterRenders.datetime(),
  },
  {
    name: 'updatedAt',
    label: i18n('entities.task.fields.updatedAt'),
    render: exporterRenders.datetime(),
  },
];
