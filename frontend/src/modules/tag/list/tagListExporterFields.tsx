import { i18n } from 'src/i18n';
import exporterRenders from 'src/modules/shared/exporter/exporterRenders';

export default [
  {
    name: 'id',
    label: i18n('entities.tag.fields.id'),
  },
  {
    name: 'title',
    label: i18n('entities.tag.fields.title'),
  },
  {
    name: 'createdAt',
    label: i18n('entities.tag.fields.createdAt'),
    render: exporterRenders.datetime(),
  },
  {
    name: 'updatedAt',
    label: i18n('entities.tag.fields.updatedAt'),
    render: exporterRenders.datetime(),
  },
];
