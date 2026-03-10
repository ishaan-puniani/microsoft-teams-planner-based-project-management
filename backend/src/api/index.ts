/// File is generated from https://studio.fabbuilder.com -

import path from 'path';
import express from 'express';
import cors from 'cors';
import { authMiddleware } from '../middlewares/authMiddleware';
import { projectMiddleware } from '../middlewares/projectMiddleware';
import { tenantMiddleware } from '../middlewares/tenantMiddleware';
import { databaseMiddleware } from '../middlewares/databaseMiddleware';
import bodyParser from 'body-parser';
import qs from 'qs';
import helmet from 'helmet';
import { createRateLimiter } from './apiRateLimiter';
import { languageMiddleware } from '../middlewares/languageMiddleware';
import authSocial from './auth/authSocial';
// import setupSwaggerUI from './apiDocumentation';

// Import API routes
import auditLogRoutes from './auditLog';
import authRoutes from './auth';
import planRoutes from './plan';
import tenantRoutes from './tenant';
import fileRoutes from './file';
import userRoutes from './user';
import settingsRoutes from './settings';
import moduleRoutes from './module';
import projectRoutes from './project';
import requirementRoutes from './requirement';
import testPlanRoutes from './testPlan';
import testCycleRoutes from './testCycle';
import testSuiteRoutes from './testSuite';
import taskRoutes from './task';
import statusRoutes from './status';
import tagRoutes from './tag';
import taskTemplateRoutes from './taskTemplate';
import msPlannerRoutes from './msPlanner';
import aiAgentRoutes from './aiAgent';

const app = express();

app.set('trust proxy', 1);  // or true / number of proxies

// Use qs so array params like ids[]=1&ids[]=2 become req.query.ids = ['1','2']
app.set('query parser', (str) =>
  qs.parse(str, { arrayLimit: 1000 }),
);

// Enables CORS
app.use(cors({ origin: true }));

// Initializes and adds the database middleware.
app.use(databaseMiddleware);

// Sets the current language of the request
app.use(languageMiddleware);

// Configures the authentication middleware
// to set the currentUser to the requests
app.use(authMiddleware);

// Sets req.projectId from header (or cookie) for task list default filter
app.use(projectMiddleware);

// Setup the Documentation
// setupSwaggerUI(app);

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
tenantRoutes(routes);
fileRoutes(routes);
userRoutes(routes);
settingsRoutes(routes);
moduleRoutes(routes);
projectRoutes(routes);
requirementRoutes(routes);
testPlanRoutes(routes);
testCycleRoutes(routes);
testSuiteRoutes(routes);
taskRoutes(routes);
statusRoutes(routes);
tagRoutes(routes);
taskTemplateRoutes(routes);
msPlannerRoutes(routes);
aiAgentRoutes(routes);

planRoutes(routes);

// Loads the Tenant if the :tenantId param is passed
routes.param('tenantId', tenantMiddleware);

// Add the routes to the /api endpoint
app.use('/api', routes);


export default app;
/// File is generated from https://studio.fabbuilder.com -
