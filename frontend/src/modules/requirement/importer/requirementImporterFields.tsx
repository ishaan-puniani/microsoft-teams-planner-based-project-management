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
    name: 'background',
    label: i18n('entities.background.fields.background'),
    schema: schemas.string(
      i18n('entities.background.fields.background'),
      {},
    ),
  },
  {
    name: 'acceptanceCriteria',
    label: i18n(
      'entities.acceptanceCriteria.fields.acceptanceCriteria',
    ),
    schema: schemas.string(
      i18n(
        'entities.acceptanceCriteria.fields.acceptanceCriteria',
      ),
      {},
    ),
  },
];
