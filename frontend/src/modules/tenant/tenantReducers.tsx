import { combineReducers } from 'redux';
import destroy from 'src/modules/tenant/destroy/tenantDestroyReducers';
import form from 'src/modules/tenant/form/tenantFormReducers';
import invitation from 'src/modules/tenant/invitation/tenantInvitationReducers';
import list from 'src/modules/tenant/list/tenantListReducers';

export default combineReducers({
  invitation,
  list,
  form,
  destroy,
});
