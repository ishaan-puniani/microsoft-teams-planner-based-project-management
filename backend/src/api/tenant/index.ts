import tenantInvitationAccept from './tenantInvitationAccept';
import tenantInvitationDecline from './tenantInvitationDecline';
import tenantCreate from './tenantCreate';
import tenantUpdate from './tenantUpdate';
import tenantDestroy from './tenantDestroy';
import tenantList from './tenantList';
import tenantFind from './tenantFind';

export default (app) => {
  app.post(
    `/tenant/invitation/:token/accept`,
    tenantInvitationAccept,
  );
  app.delete(
    `/tenant/invitation/:token/decline`,
    tenantInvitationDecline,
  );
  app.post(`/tenant`, tenantCreate);
  app.put(`/tenant/:id`, tenantUpdate);
  app.delete(`/tenant`, tenantDestroy);
  app.get(`/tenant`, tenantList);
  app.get(`/tenant/url`, tenantFind);
  app.get(`/tenant/:id`, tenantFind);
};
