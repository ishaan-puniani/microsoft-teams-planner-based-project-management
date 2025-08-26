/// File is generated from https://studio.fabbuilder.com -

import path from 'path';
import express from 'express';
import cors from 'cors';
import { authMiddleware } from '../middlewares/authMiddleware';
import { tenantMiddleware } from '../middlewares/tenantMiddleware';
import { databaseMiddleware } from '../middlewares/databaseMiddleware';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import { createRateLimiter } from './apiRateLimiter';
import { languageMiddleware } from '../middlewares/languageMiddleware';
import authSocial from './auth/authSocial';
import setupSwaggerUI from './apiDocumentation';

// Import API routes
import auditLogRoutes from './auditLog';
import authRoutes from './auth';
import planRoutes from './plan';
import tenantRoutes from './tenant';
import fileRoutes from './file';
import userRoutes from './user';
import settingsRoutes from './settings';
import moduleRoutes from './module';
import requirementRoutes from './requirement';
import testPlanRoutes from './testPlan';
import testSuiteRoutes from './testSuite';
import testCaseRoutes from './testCase';
import taskRoutes from './task';
import statusRoutes from './status';
import tagRoutes from './tag';

const app = express();

// Enables CORS
app.use(cors({ origin: true }));

// Initializes and adds the database middleware.
app.use(databaseMiddleware);

// Sets the current language of the request
app.use(languageMiddleware);

// Configures the authentication middleware
// to set the currentUser to the requests
app.use(authMiddleware);

// Setup the Documentation
setupSwaggerUI(app);

// Default rate limiter
const defaultRateLimiter = createRateLimiter({
  max: 500,
  windowMs: 15 * 60 * 1000,
  message: 'errors.429',
});
app.use(defaultRateLimiter);

// Enables Helmet, a set of tools to
// increase security.
app.use(helmet());

// Parses the body of POST/PUT request
// to JSON
app.use(
  bodyParser.json({
    verify: function (req, res, buf) {
      const url = (<any>req).originalUrl;
      if (url.startsWith('/api/plan/stripe/webhook')) {
        // Stripe Webhook needs the body raw in order
        // to validate the request
        (<any>req).rawBody = buf.toString();
      }
    },
  }),
);

// Configure the Entity routes
const routes = express.Router();

// Enable Passport for Social Sign-in
authSocial(app, routes);

// Register API routes
auditLogRoutes(routes);
authRoutes(routes);
planRoutes(routes);
tenantRoutes(routes);
fileRoutes(routes);
userRoutes(routes);
settingsRoutes(routes);
moduleRoutes(routes);
requirementRoutes(routes);
testPlanRoutes(routes);
testSuiteRoutes(routes);
testCaseRoutes(routes);
taskRoutes(routes);
statusRoutes(routes);
tagRoutes(routes);

// Loads the Tenant if the :tenantId param is passed
routes.param('tenantId', tenantMiddleware);

// Add the routes to the /api endpoint
app.use('/api', routes);

app.use(
  express.static(
    path.resolve(__dirname, '../../../frontend/build'),
  ),
);

app.get('*', (req, res) => {
  res.sendFile(
    path.resolve(
      __dirname,
      '../../../frontend/build',
      'index.html',
    ),
  );
});

export default app;
/// File is generated from https://studio.fabbuilder.com -
