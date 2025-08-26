import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { i18n } from 'src/i18n';
import actions from 'src/modules/module/view/moduleViewActions';
import selectors from 'src/modules/module/view/moduleViewSelectors';
import { AppDispatch } from 'src/modules/store';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import ModuleView from 'src/view/module/view/ModuleView';
import ModuleViewToolbar from 'src/view/module/view/ModuleViewToolbar';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import PageTitle from 'src/view/shared/styles/PageTitle';

const ModulePage = (props) => {
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
          [i18n('entities.module.menu'), '/module'],
          [i18n('entities.module.view.title')],
        ]}
      />

      <ContentWrapper>
        <PageTitle>
          {i18n('entities.module.view.title')}
        </PageTitle>

        <ModuleViewToolbar id={id} />

        <ModuleView loading={loading} record={record} />
      </ContentWrapper>
    </>
  );
};

export default ModulePage;
