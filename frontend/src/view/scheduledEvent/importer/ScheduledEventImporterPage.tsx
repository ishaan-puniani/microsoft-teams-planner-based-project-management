import { i18n } from 'src/i18n';
import actions from 'src/modules/scheduledEvent/importer/scheduledEventImporterActions';
import fields from 'src/modules/scheduledEvent/importer/scheduledEventImporterFields';
import selectors from 'src/modules/scheduledEvent/importer/scheduledEventImporterSelectors';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import importerHoc from 'src/view/shared/importer/Importer';
import PageTitle from 'src/view/shared/styles/PageTitle';

const ScheduledEventImporterPage = (props) => {
  const Importer = importerHoc(
    selectors,
    actions,
    fields,
    i18n('entities.scheduledEvent.importer.hint'),
  );
  return (
    <>
      <Breadcrumb
        items={[
          [i18n('dashboard.menu'), '/'],
          [i18n('entities.scheduledEvent.menu'), '/scheduled-event'],
          [i18n('entities.scheduledEvent.importer.title')],
        ]}
      />

      <ContentWrapper>
        <PageTitle>
          {i18n('entities.scheduledEvent.importer.title')}
        </PageTitle>

        <Importer />
      </ContentWrapper>
    </>
  );
};

export default ScheduledEventImporterPage;
