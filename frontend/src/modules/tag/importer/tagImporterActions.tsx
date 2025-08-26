import { i18n } from 'src/i18n';
import importerActions from 'src/modules/shared/importer/importerActions';
import fields from 'src/modules/tag/importer/tagImporterFields';
import selectors from 'src/modules/tag/importer/tagImporterSelectors';
import TagService from 'src/modules/tag/tagService';

const tagImporterActions = importerActions(
  'TAG_IMPORTER',
  selectors,
  TagService.import,
  fields,
  i18n('entities.tag.importer.fileName'),
);

export default tagImporterActions;
