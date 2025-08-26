import { i18n } from 'src/i18n';
import actions from 'src/modules/requirement/importer/requirementImporterActions';
import fields from 'src/modules/requirement/importer/requirementImporterFields';
import selectors from 'src/modules/requirement/importer/requirementImporterSelectors';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import importerHoc from 'src/view/shared/importer/Importer';
import PageTitle from 'src/view/shared/styles/PageTitle';

const RequirementImportPage = (props) => {
  const Importer = importerHoc(
    selectors,
    actions,
    fields,
    i18n('entities.requirement.importer.hint'),
  );
  return (
    <>
      <Breadcrumb
        items={[
          [i18n('dashboard.menu'), '/'],
          [
            i18n('entities.requirement.menu'),
            '/requirement',
          ],
          [i18n('entities.requirement.importer.title')],
        ]}
      />

      <ContentWrapper>
        <PageTitle>
          {i18n('entities.requirement.importer.title')}
        </PageTitle>

        <Importer />
      </ContentWrapper>
    </>
  );
};

export default RequirementImportPage;
