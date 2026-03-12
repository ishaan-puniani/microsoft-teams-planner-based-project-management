import { createSelector } from 'reselect';
import authSelectors from 'src/modules/auth/authSelectors';
import PermissionChecker from 'src/modules/auth/permissionChecker';
import Permissions from 'src/security/permissions';

const selectPermissionToRead = createSelector(
  [authSelectors.selectCurrentTenant, authSelectors.selectCurrentUser],
  (currentTenant, currentUser) =>
    new PermissionChecker(currentTenant, currentUser).match(
      Permissions.values.scheduledEventRead,
    ),
);

const selectPermissionToEdit = createSelector(
  [authSelectors.selectCurrentTenant, authSelectors.selectCurrentUser],
  (currentTenant, currentUser) =>
    new PermissionChecker(currentTenant, currentUser).match(
      Permissions.values.scheduledEventEdit,
    ),
);

const selectPermissionToCreate = createSelector(
  [authSelectors.selectCurrentTenant, authSelectors.selectCurrentUser],
  (currentTenant, currentUser) =>
    new PermissionChecker(currentTenant, currentUser).match(
      Permissions.values.scheduledEventCreate,
    ),
);

const selectPermissionToImport = createSelector(
  [authSelectors.selectCurrentTenant, authSelectors.selectCurrentUser],
  (currentTenant, currentUser) =>
    new PermissionChecker(currentTenant, currentUser).match(
      Permissions.values.scheduledEventImport,
    ),
);

const selectPermissionToDestroy = createSelector(
  [authSelectors.selectCurrentTenant, authSelectors.selectCurrentUser],
  (currentTenant, currentUser) =>
    new PermissionChecker(currentTenant, currentUser).match(
      Permissions.values.scheduledEventDestroy,
    ),
);

const scheduledEventSelectors = {
  selectPermissionToRead,
  selectPermissionToEdit,
  selectPermissionToCreate,
  selectPermissionToDestroy,
  selectPermissionToImport,
};

export default scheduledEventSelectors;
