import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import config from 'src/config';
import authSelectors from 'src/modules/auth/authSelectors';
import PermissionChecker from 'src/modules/auth/permissionChecker';
import layoutSelectors from 'src/modules/layout/layoutSelectors';
import { tenantSubdomain } from 'src/modules/tenant/tenantSubdomain';
import Layout from 'src/view/layout/Layout';
import routes from 'src/view/routes';
import CustomLoadable from 'src/view/shared/CustomLoadable';
import ProgressBar from 'src/view/shared/ProgressBar';

function RoutesComponent(props) {
  const isInitialMount = useRef(true);

  const authLoading = useSelector(
    authSelectors.selectLoadingInit,
  );
  const layoutLoading = useSelector(
    layoutSelectors.selectLoading,
  );
  const loading = authLoading || layoutLoading;
  const currentUser = useSelector(
    authSelectors.selectCurrentUser,
  );
  const currentTenant = useSelector(
    authSelectors.selectCurrentTenant,
  );

  const location = useLocation();
  const permissionChecker = new PermissionChecker(
    currentTenant,
    currentUser,
  );

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      ProgressBar.start();
      return;
    }

    if (!loading) {
      ProgressBar.done();
    }
  }, [loading]);

  if (loading) {
    return <div />;
  }

  return (
    <Routes>
      {routes.publicRoutes.map((route) => {
        console.log('PUBLIC ROUTES');
        console.log(route);
        const Component = CustomLoadable({
          loader: route.loader,
        });
        return (
          <Route
            key={route.path}
            // exact
            path={route.path}
            element={
              permissionChecker.isAuthenticated ? (
                <Navigate to="/" />
              ) : (
                <Component
                  key={route.path}
                  path={route.path}
                  currentUser={currentUser}
                  currentTenant={currentTenant}
                />
              )
            }
          />
        );
      })}

      {routes.emailUnverifiedRoutes.map((route) => {
        const Component = CustomLoadable({
          loader: route.loader,
        });
        return (
          <Route
            key={route.path}
            // exact
            path={route.path}
            element={
              !permissionChecker.isAuthenticated ? (
                <Navigate to="/auth/signin" />
              ) : permissionChecker.isEmailVerified ? (
                <Navigate to="/" />
              ) : (
                <Component
                  key={route.path}
                  path={route.path}
                  currentUser={currentUser}
                  currentTenant={currentTenant}
                />
              )

              // return CustomLoadable({
              //   loader: route.loader,
              // });
            }
          />
        );
      })}

      {routes.emptyTenantRoutes.map((route) => {
        const Component = CustomLoadable({
          loader: route.loader,
        });
        return (
          <Route
            key={route.path}
            // exact
            path={route.path}
            element={
              !permissionChecker.isAuthenticated ? (
                <Navigate to="/auth/signin" />
              ) : !permissionChecker.isEmptyTenant ? (
                <Navigate to="/" />
              ) : (
                <Component
                  key={route.path}
                  exact
                  path={route.path}
                  currentUser={currentUser}
                  currentTenant={currentTenant}
                />
              )
            }
          />
        );
      })}

      {routes.emptyPermissionsRoutes.map((route) => {
        const Component = CustomLoadable({
          loader: route.loader,
        });
        return (
          <Route
            key={route.path}
            // exact
            path={route.path}
            element={
              !permissionChecker.isAuthenticated ? (
                <Navigate to="/auth/signin" />
              ) : !permissionChecker.isEmptyPermissions ? (
                <Navigate to="/" />
              ) : (
                <Component
                  key={route.path}
                  exact
                  path={route.path}
                  currentUser={currentUser}
                  currentTenant={currentTenant}
                />
              )
            }
          />
        );
      })}

      {routes.privateRoutes.map((route) => {
        const Component = CustomLoadable({
          loader: route.loader,
        });
        return (
          <Route
            key={route.path}
            path={route.path}
            // exact
            element={
              !permissionChecker.isAuthenticated ? (
                <Navigate
                  to="/auth/signin"
                  state={{ from: location }}
                />
              ) : !permissionChecker.isEmailVerified ? (
                <Navigate to="/auth/email-unverified" />
              ) : [
                  'multi',
                  'multi-with-subdomain',
                ].includes(config.tenantMode) &&
                !tenantSubdomain.isSubdomain ? (
                permissionChecker.isEmptyTenant ? (
                  <Navigate to="/auth/tenant" />
                ) : (
                  <Layout
                    key={route.path}
                    currentUser={currentUser}
                    currentTenant={currentTenant}
                    permissionRequired={
                      route.permissionRequired
                    }
                    path={route.path}
                    exact={Boolean(route.exact)}
                  >
                    <Component
                      key={route.path}
                      currentUser={currentUser}
                      currentTenant={currentTenant}
                      permissionRequired={
                        route.permissionRequired
                      }
                      path={route.path}
                      exact={Boolean(route.exact)}
                    />
                  </Layout>
                )
              ) : permissionChecker.isEmptyPermissions ? (
                <Navigate to="/auth/empty-permissions" />
              ) : !permissionChecker.match(
                  route.permissionRequired,
                ) ? (
                <Navigate to="/403" />
              ) : (
                <Layout
                  key={route.path}
                  currentUser={currentUser}
                  currentTenant={currentTenant}
                  permissionRequired={
                    route.permissionRequired
                  }
                  path={route.path}
                  exact={Boolean(route.exact)}
                >
                  <Component
                    key={route.path}
                    currentUser={currentUser}
                    currentTenant={currentTenant}
                    permissionRequired={
                      route.permissionRequired
                    }
                    path={route.path}
                    exact={Boolean(route.exact)}
                  />
                </Layout>
              )
            }
          />
        );
      })}

      {routes.simpleRoutes.map((route) => {
        const Component = CustomLoadable({
          loader: route.loader,
        });
        return (
          <Route
            key={route.path}
            // exact
            path={route.path}
            element={
              <Component
                key={route.path}
                path={route.path}
              />
            }
          />
        );
      })}
    </Routes>
  );
}

export default RoutesComponent;
