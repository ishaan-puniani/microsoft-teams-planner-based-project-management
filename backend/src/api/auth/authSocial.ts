import passport from 'passport';
import AuthService from '../../services/auth/authService';
import GoogleStrategy from 'passport-google-oauth20';
import FacebookStrategy from 'passport-facebook';
import ApiResponseHandler from '../apiResponseHandler';
import { databaseInit } from '../../database/databaseConnection';
import { get } from 'lodash';
import axios from 'axios';

export default (app, routes) => {
  app.use(passport.initialize());

  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (user, done) {
    done(null, user);
  });

  routes.post(
    '/auth/social/onboard',
    async function (req, res) {
      try {
        const payload = await AuthService.handleOnboard(
          req.currentUser,
          req.body.invitationToken,
          req.body.tenantId,
          req,
        );

        await ApiResponseHandler.success(req, res, payload);
      } catch (error) {
        await ApiResponseHandler.error(req, res, error);
      }
    },
  );

  if (process.env.AUTH_SOCIAL_GOOGLE_CLIENT_ID) {
    passport.use(
      new GoogleStrategy(
        {
          clientID:
            process.env.AUTH_SOCIAL_GOOGLE_CLIENT_ID,
          clientSecret:
            process.env.AUTH_SOCIAL_GOOGLE_CLIENT_SECRET,
          callbackURL:
            process.env.AUTH_SOCIAL_GOOGLE_CALLBACK_URL,
        },
        function (
          accessToken,
          refreshToken,
          profile,
          done,
        ) {
          databaseInit()
            .then((database) => {
              const email = get(profile, 'emails[0].value');
              const emailVerified = get(
                profile,
                'emails[0].verified',
                false,
              );
              const displayName = get(
                profile,
                'displayName',
              );
              const { firstName, lastName } =
                splitFullName(displayName);

              return AuthService.signinFromSocial(
                'google',
                profile.id,
                email,
                emailVerified,
                firstName,
                lastName,
                { database },
              );
            })
            .then((jwtToken) => {
              done(null, jwtToken);
            })
            .catch((error) => {
              console.error(error);
              done(error, null);
            });
        },
      ),
    );

    routes.get(
      '/auth/social/google',
      passport.authenticate('google', {
        scope: ['email', 'profile'],
        session: false,
      }),
      function (req, res) {
        // The request will be redirected for authentication, so this
        // function will not be called.
      },
    );

    routes.get(
      '/auth/social/google/callback',
      function (req, res, next) {
        passport.authenticate('google', (err, jwtToken) => {
          handleCallback(res, err, jwtToken);
        })(req, res, next);
      },
    );
  }

  if (process.env.AUTH_SOCIAL_FACEBOOK_CLIENT_ID) {
    passport.use(
      new FacebookStrategy(
        {
          clientID:
            process.env.AUTH_SOCIAL_FACEBOOK_CLIENT_ID,
          clientSecret:
            process.env.AUTH_SOCIAL_FACEBOOK_CLIENT_SECRET,
          callbackURL:
            process.env.AUTH_SOCIAL_FACEBOOK_CALLBACK_URL,
          profileFields: ['id', 'email', 'displayName'],
        },
        function (
          accessToken,
          refreshToken,
          profile,
          done,
        ) {
          databaseInit()
            .then((database) => {
              const email = get(profile, 'emails[0].value');
              const emailVerified = true;

              const displayName = get(
                profile,
                'displayName',
              );
              const { firstName, lastName } =
                splitFullName(displayName);

              return AuthService.signinFromSocial(
                'facebook',
                profile.id,
                email,
                emailVerified,
                firstName,
                lastName,
                { database },
              );
            })
            .then((jwtToken) => {
              done(null, jwtToken);
            })
            .catch((error) => {
              console.error(error);
              done(error, null);
            });
        },
      ),
    );

    routes.get(
      '/auth/social/facebook',
      passport.authenticate('facebook', {
        session: false,
      }),
      function (req, res) {
        // The request will be redirected for authentication, so this
        // function will not be called.
      },
    );

    routes.get(
      '/auth/social/facebook/callback',
      function (req, res, next) {
        passport.authenticate(
          'facebook',
          (err, jwtToken) => {
            handleCallback(res, err, jwtToken);
          },
        )(req, res, next);
      },
    );
  }

  if (
    process.env.AUTH_SOCIAL_MICROSOFT_CLIENT_ID &&
    process.env.AUTH_SOCIAL_MICROSOFT_CLIENT_SECRET &&
    process.env.AUTH_SOCIAL_MICROSOFT_CALLBACK_URL
  ) {
    routes.get('/auth/social/microsoft', function (req, res) {
      const authUrl = getMicrosoftAuthorizeUrl();
      res.redirect(authUrl);
    });

    routes.get(
      '/auth/social/microsoft/callback',
      async function (req, res) {
        try {
          const code = req.query.code;

          if (!code || Array.isArray(code)) {
            throw new Error('auth-microsoft-missing-code');
          }

          const jwtToken =
            await signinFromMicrosoftAuthorizationCode(
              code,
            );

          handleCallback(res, null, jwtToken);
        } catch (error) {
          handleCallback(res, error, null);
        }
      },
    );
  }
};

function getMicrosoftTenantId() {
  return (
    process.env.AUTH_SOCIAL_MICROSOFT_TENANT_ID ||
    'common'
  );
}

function getMicrosoftScope() {
  return (
    process.env.AUTH_SOCIAL_MICROSOFT_SCOPE ||
    'openid profile email User.Read'
  );
}

function getMicrosoftAuthorizeUrl() {
  const clientId = getRequiredMicrosoftEnv(
    'AUTH_SOCIAL_MICROSOFT_CLIENT_ID',
  );
  const callbackUrl = getRequiredMicrosoftEnv(
    'AUTH_SOCIAL_MICROSOFT_CALLBACK_URL',
  );

  const authUrl = new URL(
    `https://login.microsoftonline.com/${getMicrosoftTenantId()}/oauth2/v2.0/authorize`,
  );

  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('redirect_uri', callbackUrl);
  authUrl.searchParams.set('response_mode', 'query');
  authUrl.searchParams.set('scope', getMicrosoftScope());
  authUrl.searchParams.set('prompt', 'select_account');

  return authUrl.toString();
}

async function signinFromMicrosoftAuthorizationCode(
  code,
) {
  const clientId = getRequiredMicrosoftEnv(
    'AUTH_SOCIAL_MICROSOFT_CLIENT_ID',
  );
  const clientSecret = getRequiredMicrosoftEnv(
    'AUTH_SOCIAL_MICROSOFT_CLIENT_SECRET',
  );
  const callbackUrl = getRequiredMicrosoftEnv(
    'AUTH_SOCIAL_MICROSOFT_CALLBACK_URL',
  );

  const tokenUrl = `https://login.microsoftonline.com/${getMicrosoftTenantId()}/oauth2/v2.0/token`;

  const body = new URLSearchParams();
  body.set('client_id', clientId);
  body.set('client_secret', clientSecret);
  body.set('grant_type', 'authorization_code');
  body.set('code', code);
  body.set('redirect_uri', callbackUrl);
  body.set('scope', getMicrosoftScope());

  const tokenResponse = await axios.post(
    tokenUrl,
    body.toString(),
    {
      headers: {
        'Content-Type':
          'application/x-www-form-urlencoded',
      },
    },
  );

  const accessToken = get(
    tokenResponse,
    'data.access_token',
  );

  if (!accessToken) {
    throw new Error('auth-microsoft-missing-access-token');
  }

  const profileResponse = await axios.get(
    'https://graph.microsoft.com/v1.0/me',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        $select:
          'id,displayName,givenName,surname,mail,userPrincipalName',
      },
    },
  );

  const profile = profileResponse.data || {};

  if (!profile.id) {
    throw new Error('auth-microsoft-invalid-profile');
  }

  const email = profile.mail || profile.userPrincipalName;
  const fallbackName = splitFullName(profile.displayName);
  const firstName =
    profile.givenName || fallbackName.firstName;
  const lastName =
    profile.surname || fallbackName.lastName;

  const database = await databaseInit();

  return AuthService.signinFromSocial(
    'microsoft',
    profile.id,
    email,
    true,
    firstName,
    lastName,
    { database },
  );
}

function getRequiredMicrosoftEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`missing-${name.toLowerCase()}`);
  }

  return value;
}

function handleCallback(res, err, jwtToken) {
  if (err) {
    console.error(err);
    let errorCode = 'generic';

    if (
      ['auth-invalid-provider', 'auth-no-email'].includes(
        err.message,
      )
    ) {
      errorCode = err.message;
    }

    res.redirect(
      `${process.env.FRONTEND_URL}/auth/signin?socialErrorCode=${errorCode}`,
    );
    return;
  }

  res.redirect(
    `${process.env.FRONTEND_URL}/?social=true&authToken=${jwtToken}`,
  );
}

function splitFullName(fullName) {
  let firstName;
  let lastName;

  if (fullName && fullName.split(' ').length > 1) {
    const [firstNameArray, ...lastNameArray] =
      fullName.split(' ');
    firstName = firstNameArray;
    lastName = lastNameArray.join(' ');
  } else {
    firstName = fullName || null;
    lastName = null;
  }

  return { firstName, lastName };
}
