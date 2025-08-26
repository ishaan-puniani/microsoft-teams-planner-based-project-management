import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { i18n } from 'src/i18n';
import { AppDispatch } from 'src/modules/store';
import actions from 'src/modules/user/view/userViewActions';
import selectors from 'src/modules/user/view/userViewSelectors';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import PageTitle from 'src/view/shared/styles/PageTitle';
import UserView from 'src/view/user/view/UserView';
import UserViewToolbar from 'src/view/user/view/UserViewToolbar';

function UserViewPage(props) {
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams();

  const loading = useSelector(selectors.selectLoading);
  const user = useSelector(selectors.selectUser);

  useEffect(() => {
    dispatch(actions.doFind(id));
  }, [dispatch, id]);

  return (
    <>
      <Breadcrumb
        items={[
          [i18n('dashboard.menu'), '/'],
          [i18n('user.menu'), '/user'],
          [i18n('user.view.title')],
        ]}
      />

      <ContentWrapper>
        <PageTitle>{i18n('user.view.title')}</PageTitle>

        <UserViewToolbar />

        <UserView loading={loading} user={user} />
      </ContentWrapper>
    </>
  );
}

export default UserViewPage;
