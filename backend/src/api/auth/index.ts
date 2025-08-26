import { createRateLimiter } from '../apiRateLimiter';
import authPasswordReset from './authPasswordReset';
import authSendEmailAddressVerificationEmail from './authSendEmailAddressVerificationEmail';
import authSendPasswordResetEmail from './authSendPasswordResetEmail';
import authSignIn from './authSignIn';
import authSignUp from './authSignUp';
import authUpdateProfile from './authUpdateProfile';
import authPasswordChange from './authPasswordChange';
import authVerifyEmail from './authVerifyEmail';
import authMe from './authMe';

export default (app) => {
  app.put(
    `/auth/password-reset`,
    authPasswordReset,
  );

  const emailRateLimiter = createRateLimiter({
    max: 6,
    windowMs: 15 * 60 * 1000,
    message: 'errors.429',
  });

  app.post(
    `/auth/send-email-address-verification-email`,
    emailRateLimiter,
    authSendEmailAddressVerificationEmail,
  );

  app.post(
    `/auth/send-password-reset-email`,
    emailRateLimiter,
    authSendPasswordResetEmail,
  );

  const signInRateLimiter = createRateLimiter({
    max: 20,
    windowMs: 15 * 60 * 1000,
    message: 'errors.429',
  });

  app.post(
    `/auth/sign-in`,
    signInRateLimiter,
    authSignIn,
  );

  const signUpRateLimiter = createRateLimiter({
    max: 20,
    windowMs: 60 * 60 * 1000,
    message: 'errors.429',
  });

  app.post(
    `/auth/sign-up`,
    signUpRateLimiter,
    authSignUp,
  );

  app.put(
    `/auth/profile`,
    authUpdateProfile,
  );

  app.put(
    `/auth/change-password`,
    authPasswordChange,
  );

  app.put(
    `/auth/verify-email`,
    authVerifyEmail,
  );

  app.get(`/auth/me`, authMe);
};
