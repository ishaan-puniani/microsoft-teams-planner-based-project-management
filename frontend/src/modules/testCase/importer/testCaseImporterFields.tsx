import { i18n } from 'src/i18n';
import schemas from 'src/modules/shared/yup/yupImporterSchemas';

export default [
  {
    name: 'title',
    label: i18n('entities.testCase.fields.title'),
    schema: schemas.string(
      i18n('entities.testCase.fields.title'),
      {},
    ),
  },
  {
    name: 'task',
    label: i18n('entities.testCase.fields.task'),
    schema: schemas.relationToOne(
      i18n('entities.testCase.fields.task'),
      {},
    ),
  },
  {
    name: 'description',
    label: i18n('entities.testCase.fields.description'),
    schema: schemas.string(
      i18n('entities.testCase.fields.description'),
      {},
    ),
  },
  {
    name: 'steps',
    label: i18n('entities.testCase.fields.steps'),
    schema: schemas.string(
      i18n('entities.testCase.fields.steps'),
      {},
    ),
  },
  {
    name: 'expectedResult',
    label: i18n('entities.testCase.fields.expectedResult'),
    schema: schemas.string(
      i18n('entities.testCase.fields.expectedResult'),
      {},
    ),
  },
  {
    name: 'leadBy',
    label: i18n('entities.testCase.fields.leadBy'),
    schema: schemas.relationToOne(
      i18n('entities.testCase.fields.leadBy'),
      {},
    ),
  },
  {
    name: 'reviewedBy',
    label: i18n('entities.testCase.fields.reviewedBy'),
    schema: schemas.relationToOne(
      i18n('entities.testCase.fields.reviewedBy'),
      {},
    ),
  },
];
