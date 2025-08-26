import { i18n } from 'src/i18n';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import ModuleListFilter from 'src/view/module/list/ModuleListFilter';
import ModuleListTable from 'src/view/module/list/ModuleListTable';
import ModuleListToolbar from 'src/view/module/list/ModuleListToolbar';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import PageTitle from 'src/view/shared/styles/PageTitle';

const ModuleListPage = (props) => {
  return (
    <>
      <Breadcrumb
        items={[
          [i18n('dashboard.menu'), '/'],
          [i18n('entities.module.menu')],
        ]}
      />

      <ContentWrapper>
        <PageTitle>
          {i18n('entities.module.list.title')}
        </PageTitle>

        <ModuleListToolbar />
        <ModuleListFilter />
        <ModuleListTable />
      </ContentWrapper>
    </>
  );
};

export default ModuleListPage;
