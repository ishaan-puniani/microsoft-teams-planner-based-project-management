import { i18n } from 'src/i18n';
import exporterRenders from 'src/modules/shared/exporter/exporterRenders';

export default [
  {
    name: 'id',
    label: i18n('entities.requirement.fields.id'),
  },
  {
    name: 'title',
    label: i18n('entities.requirement.fields.title'),
  },
  {
    name: 'background',
    label: i18n('entities.requirement.fields.background'),
  },
  {
    name: 'acceptanceCriteria',
    label: i18n(
      'entities.requirement.fields.acceptanceCriteria',
    ),
  },
  {
    name: 'createdAt',
    label: i18n('entities.requirement.fields.createdAt'),
    render: exporterRenders.datetime(),
  },
  {
    name: 'updatedAt',
    label: i18n('entities.requirement.fields.updatedAt'),
    render: exporterRenders.datetime(),
  },
];
