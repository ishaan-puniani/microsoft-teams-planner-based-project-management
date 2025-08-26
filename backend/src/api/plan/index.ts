import webhook from './stripe/webhook';
import portal from './stripe/portal';
import checkout from './stripe/checkout';

export default (app) => {
  app.post(
    `/plan/stripe/webhook`,
    webhook,
  );
  app.post(
    `/tenant/:tenantId/plan/stripe/portal`,
    portal,
  );
  app.post(
    `/tenant/:tenantId/plan/stripe/checkout`,
    checkout,
  );
};
