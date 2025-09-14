import config from 'src/config';
import { i18n } from 'src/i18n';
import Permissions from 'src/security/permissions';

const permissions = Permissions.values;

export default [
  {
    path: '/',
    exact: true,
    icon: 'fas fa-th-large',
    label: i18n('dashboard.menu'),
    permissionRequired: null,
  },

  config.isPlanEnabled && {
    path: '/plan',
    permissionRequired: permissions.planRead,
    icon: 'fas fa-credit-card',
    label: i18n('plan.menu'),
  },

  {
    path: '/user',
    label: i18n('user.menu'),
    permissionRequired: permissions.userRead,
    icon: 'fas fa-user-plus',
  },

  {
    path: '/audit-logs',
    icon: 'fas fa-history',
    label: i18n('auditLog.menu'),
    permissionRequired: permissions.auditLogRead,
  },

  {
    path: '/settings',
    icon: 'fas fa-cog',
    label: i18n('settings.menu'),
    permissionRequired: permissions.settingsEdit,
  },
  {
    path: '/module',
    permissionRequired: permissions.moduleRead,
    icon: 'fas fa-chevron-right',
    label: i18n('entities.module.menu'),
  },
  {
    path: '/project',
    permissionRequired: permissions.projectRead,
    icon: 'fas fa-chevron-right',
    label: i18n('entities.project.menu'),
  },
  {
    path: '/task-template',
    permissionRequired: permissions.taskTemplateRead,
    icon: 'fas fa-chevron-right',
    label: i18n('entities.taskTemplate.menu'),
  },
  {
    path: '/requirement',
    permissionRequired: permissions.requirementRead,
    icon: 'fas fa-chevron-right',
    label: i18n('entities.requirement.menu'),
  },
  {
    path: '/test-plan',
    permissionRequired: permissions.testPlanRead,
    icon: 'fas fa-chevron-right',
    label: i18n('entities.testPlan.menu'),
  },
  {
    path: '/test-suite',
    permissionRequired: permissions.testSuiteRead,
    icon: 'fas fa-chevron-right',
    label: i18n('entities.testSuite.menu'),
  },
  {
    path: '/test-case',
    permissionRequired: permissions.testCaseRead,
    icon: 'fas fa-chevron-right',
    label: i18n('entities.testCase.menu'),
  },
  {
    path: '/task',
    permissionRequired: permissions.taskRead,
    icon: 'fas fa-chevron-right',
    label: i18n('entities.task.menu'),
  },
  {
    path: '/status',
    permissionRequired: permissions.statusRead,
    icon: 'fas fa-chevron-right',
    label: i18n('entities.status.menu'),
  },
  {
    path: '/tag',
    permissionRequired: permissions.tagRead,
    icon: 'fas fa-chevron-right',
    label: i18n('entities.tag.menu'),
  },
].filter(Boolean);
