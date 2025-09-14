import { i18n } from 'src/i18n';
import actions from 'src/modules/taskTemplate/importer/taskTemplateImporterActions';
import fields from 'src/modules/taskTemplate/importer/taskTemplateImporterFields';
import selectors from 'src/modules/taskTemplate/importer/taskTemplateImporterSelectors';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import importerHoc from 'src/view/shared/importer/Importer';
import PageTitle from 'src/view/shared/styles/PageTitle';

const TaskTemplateImporterPage = (props) => {
  const Importer = importerHoc(
    selectors,
    actions,
    fields,
    i18n('entities.taskTemplate.importer.hint'),
  );
  return (
    <>
      <Breadcrumb
        items={[
          [i18n('dashboard.menu'), '/'],
          [i18n('entities.taskTemplate.menu'), '/task-template'],
          [i18n('entities.taskTemplate.importer.title')],
        ]}
      />

      <ContentWrapper>
        <PageTitle>
          {i18n('entities.taskTemplate.importer.title')}
        </PageTitle>

        <Importer />
      </ContentWrapper>
    </>
  );
};

export default TaskTemplateImporterPage;
