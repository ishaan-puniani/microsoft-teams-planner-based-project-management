// import { Redirect, Route } from 'react-router-dom';
// import PermissionChecker from 'src/modules/auth/permissionChecker';

// function EmptyPermissionsRoute({
//   component: Component,
//   currentTenant,
//   currentUser,
//   ...rest
// }) {
//   return (
//     <Route
//       {...rest}
//       render={(props) => {
//         const permissionChecker = new PermissionChecker(
//           currentTenant,
//           currentUser,
//         );

//         if (!permissionChecker.isAuthenticated) {
//           return (
//             <Redirect
//               to={{
//                 pathname: '/auth/signin',
//               }}
//             />
//           );
//         }

//         if (!permissionChecker.isEmptyPermissions) {
//           return <Redirect to="/" />;
//         }

//         return <Component {...props} />;
//       }}
//     />
//   );
// }

// export default EmptyPermissionsRoute;
export default <></>;
