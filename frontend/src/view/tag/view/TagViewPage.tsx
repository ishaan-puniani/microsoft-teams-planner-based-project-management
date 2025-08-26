import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { i18n } from 'src/i18n';
import { AppDispatch } from 'src/modules/store';
import actions from 'src/modules/tag/view/tagViewActions';
import selectors from 'src/modules/tag/view/tagViewSelectors';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import PageTitle from 'src/view/shared/styles/PageTitle';
import TagView from 'src/view/tag/view/TagView';
import TagViewToolbar from 'src/view/tag/view/TagViewToolbar';

const TagPage = (props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams();

  const loading = useSelector(selectors.selectLoading);
  const record = useSelector(selectors.selectRecord);

  useEffect(() => {
    dispatch(actions.doFind(id));
  }, [dispatch, id]);

  return (
    <>
      <Breadcrumb
        items={[
          [i18n('dashboard.menu'), '/'],
          [i18n('entities.tag.menu'), '/tag'],
          [i18n('entities.tag.view.title')],
        ]}
      />

      <ContentWrapper>
        <PageTitle>
          {i18n('entities.tag.view.title')}
        </PageTitle>

        <TagViewToolbar id={id} />

        <TagView loading={loading} record={record} />
      </ContentWrapper>
    </>
  );
};

export default TagPage;
