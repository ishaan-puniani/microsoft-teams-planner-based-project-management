import config from 'src/config';
import Permissions from 'src/security/permissions';

const permissions = Permissions.values;

const privateRoutes = [
  {
    path: '/',
    loader: () =>
      import('src/view/dashboard/DashboardPage'),
    permissionRequired: null,
    exact: true,
  },

  {
    path: '/profile',
    loader: () => import('src/view/auth/ProfileFormPage'),
    permissionRequired: null,
    exact: true,
  },

  {
    path: '/password-change',
    loader: () =>
      import('src/view/auth/PasswordChangeFormPage'),
    permissionRequired: null,
    exact: true,
  },

  {
    path: '/tenant',
    loader: () =>
      import('src/view/tenant/list/TenantListPage'),
    permissionRequired: null,
    exact: true,
  },
  {
    path: '/tenant/new',
    loader: () =>
      import('src/view/tenant/form/TenantFormPage'),
    permissionRequired: null,
    exact: true,
  },
  {
    path: '/tenant/:id/edit',
    loader: () =>
      import('src/view/tenant/form/TenantFormPage'),
    permissionRequired: null,
    exact: true,
  },

  config.isPlanEnabled && {
    path: '/plan',
    loader: () => import('src/view/plan/PlanPage'),
    permissionRequired: permissions.planRead,
    exact: true,
  },

  {
    path: '/user',
    loader: () => import('src/view/user/list/UserPage'),
    permissionRequired: permissions.userRead,
    exact: true,
  },

  {
    path: '/user/new',
    loader: () => import('src/view/user/new/UserNewPage'),
    permissionRequired: permissions.userCreate,
    exact: true,
  },

  {
    path: '/user/importer',
    loader: () =>
      import('src/view/user/importer/UserImporterPage'),
    permissionRequired: permissions.userImport,
    exact: true,
  },
  {
    path: '/user/:id/edit',
    loader: () => import('src/view/user/edit/UserEditPage'),
    permissionRequired: permissions.userEdit,
    exact: true,
  },
  {
    path: '/user/:id',
    loader: () => import('src/view/user/view/UserViewPage'),
    permissionRequired: permissions.userRead,
    exact: true,
  },

  {
    path: '/audit-logs',
    loader: () => import('src/view/auditLog/AuditLogPage'),
    permissionRequired: permissions.auditLogRead,
  },

  {
    path: '/settings',
    loader: () =>
      import('src/view/settings/SettingsFormPage'),
    permissionRequired: permissions.settingsEdit,
  },
  {
    path: '/module',
    loader: () =>
      import('src/view/module/list/ModuleListPage'),
    permissionRequired: permissions.moduleRead,
    exact: true,
  },
  {
    path: '/module/new',
    loader: () =>
      import('src/view/module/form/ModuleFormPage'),
    permissionRequired: permissions.moduleCreate,
    exact: true,
  },
  {
    path: '/module/importer',
    loader: () =>
      import('src/view/module/importer/ModuleImporterPage'),
    permissionRequired: permissions.moduleImport,
    exact: true,
  },
  {
    path: '/module/:id/edit',
    loader: () =>
      import('src/view/module/form/ModuleFormPage'),
    permissionRequired: permissions.moduleEdit,
    exact: true,
  },
  {
    path: '/module/:id',
    loader: () =>
      import('src/view/module/view/ModuleViewPage'),
    permissionRequired: permissions.moduleRead,
    exact: true,
  },
  {
    path: '/project',
    loader: () =>
      import('src/view/project/list/ProjectListPage'),
    permissionRequired: permissions.projectRead,
    exact: true,
  },
  {
    path: '/project/new',
    loader: () =>
      import('src/view/project/form/ProjectFormPage'),
    permissionRequired: permissions.projectCreate,
    exact: true,
  },
  {
    path: '/project/importer',
    loader: () =>
      import('src/view/project/importer/ProjectImporterPage'),
    permissionRequired: permissions.projectImport,
    exact: true,
  },
  {
    path: '/project/:id/edit',
    loader: () =>
      import('src/view/project/form/ProjectFormPage'),
    permissionRequired: permissions.projectEdit,
    exact: true,
  },
  {
    path: '/project/:id',
    loader: () =>
      import('src/view/project/view/ProjectViewPage'),
    permissionRequired: permissions.projectRead,
    exact: true,
  },
  {
    path: '/requirement',
    loader: () =>
      import(
        'src/view/requirement/list/RequirementListPage'
      ),
    permissionRequired: permissions.requirementRead,
    exact: true,
  },
  {
    path: '/requirement/new',
    loader: () =>
      import(
        'src/view/requirement/form/RequirementFormPage'
      ),
    permissionRequired: permissions.requirementCreate,
    exact: true,
  },
  {
    path: '/requirement/importer',
    loader: () =>
      import(
        'src/view/requirement/importer/RequirementImporterPage'
      ),
    permissionRequired: permissions.requirementImport,
    exact: true,
  },
  {
    path: '/requirement/:id/edit',
    loader: () =>
      import(
        'src/view/requirement/form/RequirementFormPage'
      ),
    permissionRequired: permissions.requirementEdit,
    exact: true,
  },
  {
    path: '/requirement/:id',
    loader: () =>
      import(
        'src/view/requirement/view/RequirementViewPage'
      ),
    permissionRequired: permissions.requirementRead,
    exact: true,
  },
  {
    path: '/test-plan',
    loader: () =>
      import('src/view/testPlan/list/TestPlanListPage'),
    permissionRequired: permissions.testPlanRead,
    exact: true,
  },
  {
    path: '/test-plan/new',
    loader: () =>
      import('src/view/testPlan/form/TestPlanFormPage'),
    permissionRequired: permissions.testPlanCreate,
    exact: true,
  },
  {
    path: '/test-plan/importer',
    loader: () =>
      import(
        'src/view/testPlan/importer/TestPlanImporterPage'
      ),
    permissionRequired: permissions.testPlanImport,
    exact: true,
  },
  {
    path: '/test-plan/:id/edit',
    loader: () =>
      import('src/view/testPlan/form/TestPlanFormPage'),
    permissionRequired: permissions.testPlanEdit,
    exact: true,
  },
  {
    path: '/test-plan/:id',
    loader: () =>
      import('src/view/testPlan/view/TestPlanViewPage'),
    permissionRequired: permissions.testPlanRead,
    exact: true,
  },
  {
    path: '/test-suite',
    loader: () =>
      import('src/view/testSuite/list/TestSuiteListPage'),
    permissionRequired: permissions.testSuiteRead,
    exact: true,
  },
  {
    path: '/test-suite/new',
    loader: () =>
      import('src/view/testSuite/form/TestSuiteFormPage'),
    permissionRequired: permissions.testSuiteCreate,
    exact: true,
  },
  {
    path: '/test-suite/importer',
    loader: () =>
      import(
        'src/view/testSuite/importer/TestSuiteImporterPage'
      ),
    permissionRequired: permissions.testSuiteImport,
    exact: true,
  },
  {
    path: '/test-suite/:id/edit',
    loader: () =>
      import('src/view/testSuite/form/TestSuiteFormPage'),
    permissionRequired: permissions.testSuiteEdit,
    exact: true,
  },
  {
    path: '/test-suite/:id',
    loader: () =>
      import('src/view/testSuite/view/TestSuiteViewPage'),
    permissionRequired: permissions.testSuiteRead,
    exact: true,
  },
  {
    path: '/test-case',
    loader: () =>
      import('src/view/testCase/list/TestCaseListPage'),
    permissionRequired: permissions.testCaseRead,
    exact: true,
  },
  {
    path: '/test-case/new',
    loader: () =>
      import('src/view/testCase/form/TestCaseFormPage'),
    permissionRequired: permissions.testCaseCreate,
    exact: true,
  },
  {
    path: '/test-case/importer',
    loader: () =>
      import(
        'src/view/testCase/importer/TestCaseImporterPage'
      ),
    permissionRequired: permissions.testCaseImport,
    exact: true,
  },
  {
    path: '/test-case/:id/edit',
    loader: () =>
      import('src/view/testCase/form/TestCaseFormPage'),
    permissionRequired: permissions.testCaseEdit,
    exact: true,
  },
  {
    path: '/test-case/:id',
    loader: () =>
      import('src/view/testCase/view/TestCaseViewPage'),
    permissionRequired: permissions.testCaseRead,
    exact: true,
  },
  {
    path: '/task',
    loader: () => import('src/view/task/list/TaskListPage'),
    permissionRequired: permissions.taskRead,
    exact: true,
  },
  {
    path: '/task/new',
    loader: () => import('src/view/task/form/TaskFormPage'),
    permissionRequired: permissions.taskCreate,
    exact: true,
  },
  {
    path: '/task/importer',
    loader: () =>
      import('src/view/task/importer/TaskImporterPage'),
    permissionRequired: permissions.taskImport,
    exact: true,
  },
  {
    path: '/task/:id/edit',
    loader: () => import('src/view/task/form/TaskFormPage'),
    permissionRequired: permissions.taskEdit,
    exact: true,
  },
  {
    path: '/task/:id',
    loader: () => import('src/view/task/view/TaskViewPage'),
    permissionRequired: permissions.taskRead,
    exact: true,
  },
  {
    path: '/status',
    loader: () =>
      import('src/view/status/list/StatusListPage'),
    permissionRequired: permissions.statusRead,
    exact: true,
  },
  {
    path: '/status/new',
    loader: () =>
      import('src/view/status/form/StatusFormPage'),
    permissionRequired: permissions.statusCreate,
    exact: true,
  },
  {
    path: '/status/importer',
    loader: () =>
      import('src/view/status/importer/StatusImporterPage'),
    permissionRequired: permissions.statusImport,
    exact: true,
  },
  {
    path: '/status/:id/edit',
    loader: () =>
      import('src/view/status/form/StatusFormPage'),
    permissionRequired: permissions.statusEdit,
    exact: true,
  },
  {
    path: '/status/:id',
    loader: () =>
      import('src/view/status/view/StatusViewPage'),
    permissionRequired: permissions.statusRead,
    exact: true,
  },
  {
    path: '/tag',
    loader: () => import('src/view/tag/list/TagListPage'),
    permissionRequired: permissions.tagRead,
    exact: true,
  },
  {
    path: '/tag/new',
    loader: () => import('src/view/tag/form/TagFormPage'),
    permissionRequired: permissions.tagCreate,
    exact: true,
  },
  {
    path: '/tag/importer',
    loader: () =>
      import('src/view/tag/importer/TagImporterPage'),
    permissionRequired: permissions.tagImport,
    exact: true,
  },
  {
    path: '/tag/:id/edit',
    loader: () => import('src/view/tag/form/TagFormPage'),
    permissionRequired: permissions.tagEdit,
    exact: true,
  },
  {
    path: '/tag/:id',
    loader: () => import('src/view/tag/view/TagViewPage'),
    permissionRequired: permissions.tagRead,
    exact: true,
  },
].filter(Boolean);

const publicRoutes = [
  {
    path: '/auth/signin',
    loader: () => import('src/view/auth/SigninPage'),
  },
  {
    path: '/auth/signup',
    loader: () => import('src/view/auth/SignupPage'),
  },
  {
    path: '/auth/forgot-password',
    loader: () =>
      import('src/view/auth/ForgotPasswordPage'),
  },
].filter(Boolean);

const emptyTenantRoutes = [
  {
    path: '/auth/tenant',
    loader: () => import('src/view/auth/TenantPage'),
  },
].filter(Boolean);

const emptyPermissionsRoutes = [
  {
    path: '/auth/empty-permissions',
    loader: () =>
      import('src/view/auth/EmptyPermissionsPage'),
  },
].filter(Boolean);

const emailUnverifiedRoutes = [
  {
    path: '/auth/email-unverified',
    loader: () =>
      import('src/view/auth/EmailUnverifiedPage'),
  },
].filter(Boolean);

const simpleRoutes = [
  {
    path: '/auth/password-reset',
    loader: () => import('src/view/auth/PasswordResetPage'),
  },
  {
    path: '/auth/invitation',
    loader: () => import('src/view/auth/InvitationPage'),
  },
  {
    path: '/auth/verify-email',
    loader: () => import('src/view/auth/VerifyEmailPage'),
  },
  {
    path: '/403',
    loader: () =>
      import('src/view/shared/errors/Error403Page'),
  },
  {
    path: '/500',
    loader: () =>
      import('src/view/shared/errors/Error500Page'),
  },
  {
    path: '**',
    loader: () =>
      import('src/view/shared/errors/Error404Page'),
  },
].filter(Boolean);

export default {
  privateRoutes,
  publicRoutes,
  emptyTenantRoutes,
  emptyPermissionsRoutes,
  emailUnverifiedRoutes,
  simpleRoutes,
};
