// import { Redirect, Route } from 'react-router-dom';
// import PermissionChecker from 'src/modules/auth/permissionChecker';

// function PublicRoute({
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

//         if (permissionChecker.isAuthenticated) {
//           return <Redirect to="/" />;
//         }

//         return <Component {...props} />;
//       }}
//     />
//   );
// }

// export default PublicRoute;
export default <></>;
