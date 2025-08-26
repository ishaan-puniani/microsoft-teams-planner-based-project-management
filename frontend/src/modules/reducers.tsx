import { combineReducers } from 'redux';
import auditLog from 'src/modules/auditLog/auditLogReducers';
import auth from 'src/modules/auth/authReducers';
import layout from 'src/modules/layout/layoutReducers';
import module from 'src/modules/module/moduleReducers';
import plan from 'src/modules/plan/planReducers';
import requirement from 'src/modules/requirement/requirementReducers';
import settings from 'src/modules/settings/settingsReducers';
import status from 'src/modules/status/statusReducers';
import tag from 'src/modules/tag/tagReducers';
import task from 'src/modules/task/taskReducers';
import tenant from 'src/modules/tenant/tenantReducers';
import testCase from 'src/modules/testCase/testCaseReducers';
import testPlan from 'src/modules/testPlan/testPlanReducers';
import testSuite from 'src/modules/testSuite/testSuiteReducers';
import user from 'src/modules/user/userReducers';

export default () =>
  combineReducers({
    layout,
    auth,
    tenant,
    plan,
    user,
    auditLog,
    settings,
    module,
    requirement,
    testPlan,
    testSuite,
    testCase,
    task,
    status,
    tag,
  });
