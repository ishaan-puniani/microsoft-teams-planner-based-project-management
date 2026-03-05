import planDetails from './plan';
import groupsAutocomplete from './groupsAutocomplete';
import planner from './plansAutocomplete';
import tasks from './tasks';
import users from './users';

export default (app) => {
    app.get('/tenant/:tenantId/ms-planner/plan/:planId', planDetails);
    app.get('/tenant/:tenantId/ms-planner/tasks/:planId', tasks);
    app.get('/tenant/:tenantId/ms-planner/plans/autocomplete', planner);
    app.get('/tenant/:tenantId/ms-planner/groups/autocomplete', groupsAutocomplete);
    app.get('/tenant/:tenantId/ms-planner/users', users)
}