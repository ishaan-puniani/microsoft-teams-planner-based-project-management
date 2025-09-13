import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { i18n } from 'src/i18n';
import actions from 'src/modules/project/view/projectViewActions';
import selectors from 'src/modules/project/view/projectViewSelectors';
import { AppDispatch } from 'src/modules/store';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import ProjectView from 'src/view/project/view/ProjectView';
import ProjectViewToolbar from 'src/view/project/view/ProjectViewToolbar';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import PageTitle from 'src/view/shared/styles/PageTitle';

const ProjectViewPage = (props) => {
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
          [i18n('entities.project.menu'), '/project'],
          [i18n('entities.project.view.title')],
        ]}
      />

      <ContentWrapper>
        <PageTitle>
          {i18n('entities.project.view.title')}
        </PageTitle>

        <ProjectViewToolbar id={id} />

        <ProjectView loading={loading} record={record} />
      </ContentWrapper>
    </>
  );
};

export default ProjectViewPage;
