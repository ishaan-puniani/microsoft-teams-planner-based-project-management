import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { i18n } from 'src/i18n';
import { AppDispatch, getHistory } from 'src/modules/store';
import actions from 'src/modules/user/form/userFormActions';
import selectors from 'src/modules/user/form/userFormSelectors';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import Spinner from 'src/view/shared/Spinner';
import PageTitle from 'src/view/shared/styles/PageTitle';
import UserEditForm from 'src/view/user/edit/UserEditForm';

function UserEditPage(props) {
  const dispatch = useDispatch<AppDispatch>();
  const [dispatched, setDispatched] = useState(false);

  const initLoading = useSelector(
    selectors.selectInitLoading,
  );

  const saveLoading = useSelector(
    selectors.selectSaveLoading,
  );

  const user = useSelector(selectors.selectUser);

  const { id } = useParams();

  useEffect(() => {
    dispatch(actions.doInit(id));
    setDispatched(true);
  }, [dispatch, id]);

  return (
    <>
      <Breadcrumb
        items={[
          [i18n('dashboard.menu'), '/'],
          [i18n('user.menu'), '/user'],
          [i18n('user.edit.title')],
        ]}
      />

      <ContentWrapper>
        <PageTitle>{i18n('user.edit.title')}</PageTitle>

        {initLoading && <Spinner />}

        {dispatched && !initLoading && (
          <UserEditForm
            user={user}
            saveLoading={saveLoading}
            onCancel={() => getHistory().push('/user')}
          />
        )}
      </ContentWrapper>
    </>
  );
}

export default UserEditPage;
