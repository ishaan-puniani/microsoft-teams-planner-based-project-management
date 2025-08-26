import queryString from 'query-string';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { i18n } from 'src/i18n';
import actions from 'src/modules/auth/authActions';
import selectors from 'src/modules/auth/authSelectors';
import { AppDispatch, getHistory } from 'src/modules/store';
import Content from 'src/view/auth/styles/Content';
import Logo from 'src/view/auth/styles/Logo';
import Wrapper from 'src/view/auth/styles/Wrapper';

function VerifyEmailPage() {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();

  const token = queryString.parse(location.search).token;

  const backgroundImageUrl = useSelector(
    selectors.selectBackgroundImageUrl,
  );
  const logoUrl = useSelector(selectors.selectLogoUrl);

  const signedIn = useSelector(selectors.selectSignedIn);
  const errorMessage = useSelector(
    selectors.selectErrorMessageVerifyEmail,
  );
  const loading = useSelector(
    selectors.selectLoadingVerifyEmail,
  );

  useEffect(() => {
    dispatch(actions.doVerifyEmail(token));
  }, [dispatch, token]);

  const doSignout = async () => {
    await dispatch(actions.doSignout());
    getHistory().push('/');
  };

  return (
    <Wrapper
      style={{
        backgroundImage: `url(${
          backgroundImageUrl ||
          '/images/emailUnverified.jpg'
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

        {loading && (
          <h4 style={{ textAlign: 'center' }}>
            {i18n('auth.verifyEmail.message')}
          </h4>
        )}
        {!loading && !errorMessage && (
          <h4
            className="text-success"
            style={{
              textAlign: 'center',
            }}
          >
            {i18n('auth.verifyEmail.success')}
          </h4>
        )}
        {!loading && errorMessage && (
          <h4
            className="text-danger"
            style={{
              textAlign: 'center',
            }}
          >
            {errorMessage}
          </h4>
        )}
        {!loading && errorMessage && (
          <button
            style={{ marginTop: '24px' }}
            className="btn btn-block btn-primary"
            type="button"
            onClick={doSignout}
          >
            {i18n('auth.signout')}
          </button>
        )}
        {!loading && !errorMessage && !signedIn && (
          <Link
            to="/auth/signin"
            className="btn btn-block btn-primary"
          >
            {i18n('auth.signin')}
          </Link>
        )}
      </Content>
    </Wrapper>
  );
}

export default VerifyEmailPage;
