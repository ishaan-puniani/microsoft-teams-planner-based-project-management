import { i18n } from 'src/i18n';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import PageTitle from 'src/view/shared/styles/PageTitle';
import TagListFilter from 'src/view/tag/list/TagListFilter';
import TagListTable from 'src/view/tag/list/TagListTable';
import TagListToolbar from 'src/view/tag/list/TagListToolbar';

const TagListPage = (props) => {
  return (
    <>
      <Breadcrumb
        items={[
          [i18n('dashboard.menu'), '/'],
          [i18n('entities.tag.menu')],
        ]}
      />

      <ContentWrapper>
        <PageTitle>
          {i18n('entities.tag.list.title')}
        </PageTitle>

        <TagListToolbar />
        <TagListFilter />
        <TagListTable />
      </ContentWrapper>
    </>
  );
};

export default TagListPage;
