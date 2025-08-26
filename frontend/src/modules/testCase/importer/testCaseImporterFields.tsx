import { i18n } from 'src/i18n';
import schemas from 'src/modules/shared/yup/yupImporterSchemas';

export default [
  {
    name: 'title',
    label: i18n('entities.title.fields.title'),
    schema: schemas.string(
      i18n('entities.title.fields.title'),
      {},
    ),
  },
  {
    name: 'description',
    label: i18n('entities.description.fields.description'),
    schema: schemas.string(
      i18n('entities.description.fields.description'),
      {},
    ),
  },
  {
    name: 'leadBy',
    label: i18n('entities.leadBy.fields.leadBy'),
    schema: schemas.relationToOne(
      i18n('entities.leadBy.fields.leadBy'),
      {},
    ),
  },
  {
    name: 'reviewedBy',
    label: i18n('entities.reviewedBy.fields.reviewedBy'),
    schema: schemas.relationToOne(
      i18n('entities.reviewedBy.fields.reviewedBy'),
      {},
    ),
  },
];
