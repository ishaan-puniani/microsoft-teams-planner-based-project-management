import { i18n } from 'src/i18n';
import importerActions from 'src/modules/shared/importer/importerActions';
import fields from 'src/modules/scheduledEvent/importer/scheduledEventImporterFields';
import selectors from 'src/modules/scheduledEvent/importer/scheduledEventImporterSelectors';
import ScheduledEventService from 'src/modules/scheduledEvent/scheduledEventService';

const scheduledEventImporterActions = importerActions(
  'SCHEDULEDEVENT_IMPORTER',
  selectors,
  ScheduledEventService.import,
  fields,
  i18n('entities.scheduledEvent.importer.fileName'),
);

export default scheduledEventImporterActions;
