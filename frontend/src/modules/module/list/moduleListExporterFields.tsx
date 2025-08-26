import { i18n } from 'src/i18n';
import exporterRenders from 'src/modules/shared/exporter/exporterRenders';

export default [
  {
    name: 'id',
    label: i18n('entities.module.fields.id'),
  },
  {
    name: 'title',
    label: i18n('entities.module.fields.title'),
  },
  {
    name: 'details',
    label: i18n('entities.module.fields.details'),
  },
  {
    name: 'createdAt',
    label: i18n('entities.module.fields.createdAt'),
    render: exporterRenders.datetime(),
  },
  {
    name: 'updatedAt',
    label: i18n('entities.module.fields.updatedAt'),
    render: exporterRenders.datetime(),
  },
];
