import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { i18n } from 'src/i18n';
import actions from 'src/modules/taskTemplate/view/taskTemplateViewActions';
import selectors from 'src/modules/taskTemplate/view/taskTemplateViewSelectors';
import { AppDispatch } from 'src/modules/store';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import TaskTemplateView from 'src/view/taskTemplate/view/TaskTemplateView';
import TaskTemplateViewToolbar from 'src/view/taskTemplate/view/TaskTemplateViewToolbar';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import PageTitle from 'src/view/shared/styles/PageTitle';

const TaskTemplateViewPage = (props) => {
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
          [i18n('entities.taskTemplate.menu'), '/task-template'],
          [i18n('entities.taskTemplate.view.title')],
        ]}
      />

      <ContentWrapper>
        <PageTitle>
          {i18n('entities.taskTemplate.view.title')}
        </PageTitle>

        <TaskTemplateViewToolbar match={props.match} />

        <TaskTemplateView loading={loading} record={record} />
      </ContentWrapper>
    </>
  );
};

export default TaskTemplateViewPage;
