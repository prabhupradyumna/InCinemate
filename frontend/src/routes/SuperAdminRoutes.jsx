import { lazy } from 'react';
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import PrivateRoute from '../components/auth/PrivateRoute';

const SuperAdminBlank = Loadable(lazy(() => import('views/superadmin/Blank')));

const SuperAdminRoutes = {
  path: '/super-admin',
  element: (
    <PrivateRoute allowedRoles={["super_admin"]}>
      <MainLayout />
    </PrivateRoute>
  ),
  children: [
    {
      path: 'dashboard',
      element: <SuperAdminBlank />
    }
  ]
};

export default SuperAdminRoutes;


