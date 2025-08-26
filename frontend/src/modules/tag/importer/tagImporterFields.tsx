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
];
