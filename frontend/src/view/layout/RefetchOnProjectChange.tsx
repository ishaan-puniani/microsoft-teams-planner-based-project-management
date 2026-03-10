import { useSelector } from 'react-redux';
import layoutSelectors from 'src/modules/layout/layoutSelectors';

/**
 * Wraps the route tree so that when the header project selection changes,
 * the key changes and React remounts the children. That triggers refetch
 * on list/view pages (useEffect on mount) so data reflects the new project.
 */
function RefetchOnProjectChange({ children }) {
  const selectedProject = useSelector(
    layoutSelectors.selectSelectedProject,
  );
  const projectKey = selectedProject?.id ?? 'all';

  return <div key={projectKey}>{children}</div>;
}

export default RefetchOnProjectChange;
