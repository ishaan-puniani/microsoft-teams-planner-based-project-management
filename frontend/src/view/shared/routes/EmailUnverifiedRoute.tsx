// import { Redirect, Route } from 'react-router-dom';
// import PermissionChecker from 'src/modules/auth/permissionChecker';

// function EmailUnverifiedRoute({
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

//         if (permissionChecker.isEmailVerified) {
//           return <Redirect to="/" />;
//         }

//         return <Component {...props} />;
//       }}
//     />
//   );
// }

// export default EmailUnverifiedRoute;
export default <></>;
