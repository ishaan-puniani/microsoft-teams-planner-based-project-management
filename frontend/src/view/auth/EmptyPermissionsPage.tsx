import { useDispatch, useSelector } from 'react-redux';
import { i18n } from 'src/i18n';
import actions from 'src/modules/auth/authActions';
import selectors from 'src/modules/auth/authSelectors';
import { AppDispatch } from 'src/modules/store';
import Content from 'src/view/auth/styles/Content';
import Logo from 'src/view/auth/styles/Logo';
import OtherActions from 'src/view/auth/styles/OtherActions';
import Wrapper from 'src/view/auth/styles/Wrapper';

function EmptyPermissionsPage() {
  const dispatch = useDispatch<AppDispatch>();

  const backgroundImageUrl = useSelector(
    selectors.selectBackgroundImageUrl,
  );
  const logoUrl = useSelector(selectors.selectLogoUrl);

  const doSignout = () => {
    dispatch(actions.doSignout());
  };

  return (
    <Wrapper
      style={{
        backgroundImage: `url(${
          backgroundImageUrl ||
          '/images/emptyPermissions.jpg'
        })`,
      }}
    >
      <Content>
        <Logo>
          {logoUrl ? (
            <img
              src={logoUrl}
              width="240px"
              alt={i18n('app.title')}
            />
          ) : (
            <h1>{i18n('app.title')}</h1>
          )}
        </Logo>

        <h3>{i18n('auth.emptyPermissions.message')}</h3>

        <OtherActions>
          <button
            className="btn btn-sm btn-link"
            type="button"
            onClick={doSignout}
          >
            {i18n('auth.signout')}
          </button>
        </OtherActions>
      </Content>
    </Wrapper>
  );
}

export default EmptyPermissionsPage;
