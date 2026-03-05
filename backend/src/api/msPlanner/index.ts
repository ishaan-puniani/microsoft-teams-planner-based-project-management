import planDetails from './plan';
import groupsAutocomplete from './groupsAutocomplete';
import planner from './plansAutocomplete';
import tasks from './tasks';
import taskGet from './taskGet';
import taskUpdate from './taskUpdate';
import taskCreate from './taskCreate';
import taskDetailsGet from './taskDetailsGet';
import taskDetailsUpdate from './taskDetailsUpdate';
import bucketsGet from './bucketsGet';
import users from './users';

export default (app) => {
    app.get('/tenant/:tenantId/ms-planner/plan/:planId', planDetails);
    app.get('/tenant/:tenantId/ms-planner/tasks/:planId', tasks);
    app.get('/tenant/:tenantId/ms-planner/plan/:planId/buckets', bucketsGet);
    app.post('/tenant/:tenantId/ms-planner/plan/:planId/task', taskCreate);
    app.get('/tenant/:tenantId/ms-planner/task/:taskId', taskGet);
    app.patch('/tenant/:tenantId/ms-planner/task/:taskId', taskUpdate);
    app.get('/tenant/:tenantId/ms-planner/task/:taskId/details', taskDetailsGet);
    app.patch('/tenant/:tenantId/ms-planner/task/:taskId/details', taskDetailsUpdate);
    app.get('/tenant/:tenantId/ms-planner/plans/autocomplete', planner);
    app.get('/tenant/:tenantId/ms-planner/groups/autocomplete', groupsAutocomplete);
    app.get('/tenant/:tenantId/ms-planner/users', users);
}