import { i18n } from 'src/i18n';
import exporterRenders from 'src/modules/shared/exporter/exporterRenders';

export default [
  {
    name: 'id',
    label: i18n('entities.testCase.fields.id'),
  },
  {
    name: 'title',
    label: i18n('entities.testCase.fields.title'),
  },
  {
    name: 'description',
    label: i18n('entities.testCase.fields.description'),
  },
  {
    name: 'attachment',
    label: i18n('entities.testCase.fields.attachment'),
    render: exporterRenders.filesOrImages(),
  },
  {
    name: 'leadBy',
    label: i18n('entities.testCase.fields.leadBy'),
    render: exporterRenders.relationToOne(),
  },
  {
    name: 'reviewedBy',
    label: i18n('entities.testCase.fields.reviewedBy'),
    render: exporterRenders.relationToOne(),
  },
  {
    name: 'createdAt',
    label: i18n('entities.testCase.fields.createdAt'),
    render: exporterRenders.datetime(),
  },
  {
    name: 'updatedAt',
    label: i18n('entities.testCase.fields.updatedAt'),
    render: exporterRenders.datetime(),
  },
];
