// import { Redirect, Route } from 'react-router-dom';
// import PermissionChecker from 'src/modules/auth/permissionChecker';

// function EmptyTenantRoute({
//   component: Component,
//   currentUser,
//   currentTenant,
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

//         if (!permissionChecker.isEmptyTenant) {
//           return <Redirect to="/" />;
//         }

//         return <Component {...props} />;
//       }}
//     />
//   );
// }

// export default EmptyTenantRoute;
export default <></>;
