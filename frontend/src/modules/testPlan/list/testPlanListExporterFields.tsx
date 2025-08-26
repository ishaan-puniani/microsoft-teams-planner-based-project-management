import { i18n } from 'src/i18n';
import exporterRenders from 'src/modules/shared/exporter/exporterRenders';

export default [
  {
    name: 'id',
    label: i18n('entities.testPlan.fields.id'),
  },
  {
    name: 'title',
    label: i18n('entities.testPlan.fields.title'),
  },
  {
    name: 'scope',
    label: i18n('entities.testPlan.fields.scope'),
  },
  {
    name: 'objective',
    label: i18n('entities.testPlan.fields.objective'),
  },
  {
    name: 'createdAt',
    label: i18n('entities.testPlan.fields.createdAt'),
    render: exporterRenders.datetime(),
  },
  {
    name: 'updatedAt',
    label: i18n('entities.testPlan.fields.updatedAt'),
    render: exporterRenders.datetime(),
  },
];
