import groupsAutocomplete from './groupsAutocomplete';
import planner from './plansAutocomplete';

export default (app) => {
    app.get('/tenant/:tenantId/ms-planner/plans/autocomplete', planner);
    app.get('/tenant/:tenantId/ms-planner/groups/autocomplete', groupsAutocomplete);
}