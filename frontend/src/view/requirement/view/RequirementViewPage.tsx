import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { i18n } from 'src/i18n';
import actions from 'src/modules/requirement/view/requirementViewActions';
import selectors from 'src/modules/requirement/view/requirementViewSelectors';
import { AppDispatch } from 'src/modules/store';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import RequirementView from 'src/view/requirement/view/RequirementView';
import RequirementViewToolbar from 'src/view/requirement/view/RequirementViewToolbar';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import PageTitle from 'src/view/shared/styles/PageTitle';

const RequirementPage = (props) => {
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
          [
            i18n('entities.requirement.menu'),
            '/requirement',
          ],
          [i18n('entities.requirement.view.title')],
        ]}
      />

      <ContentWrapper>
        <PageTitle>
          {i18n('entities.requirement.view.title')}
        </PageTitle>

        <RequirementViewToolbar id={id} />

        <RequirementView
          loading={loading}
          record={record}
        />
      </ContentWrapper>
    </>
  );
};

export default RequirementPage;
