import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'src/modules/store';
import actions from 'src/modules/tenant/list/tenantListActions';

function TenantListFilter(props) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(actions.doFetch());
  }, [dispatch]);

  return null;
}

export default TenantListFilter;
