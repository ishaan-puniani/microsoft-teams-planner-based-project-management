import { i18n } from 'src/i18n';
import exporterRenders from 'src/modules/shared/exporter/exporterRenders';

export default [
  {
    name: 'id',
    label: i18n('entities.testCycle.fields.id'),
  },
  {
    name: 'title',
    label: i18n('entities.testCycle.fields.title'),
  },
  {
    name: 'createdAt',
    label: i18n('entities.testCycle.fields.createdAt'),
    render: exporterRenders.datetime(),
  },
  {
    name: 'updatedAt',
    label: i18n('entities.testCycle.fields.updatedAt'),
    render: exporterRenders.datetime(),
  },
];
