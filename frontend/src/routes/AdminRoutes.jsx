import { lazy } from 'react';
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import PrivateRoute from '../components/auth/PrivateRoute';

const AdminBlank = Loadable(lazy(() => import('views/admin/Blank')));

const AdminRoutes = {
  path: '/admin',
  element: (
    <PrivateRoute allowedRoles={["admin"]}>
      <MainLayout />
    </PrivateRoute>
  ),
  children: [
    {
      path: 'dashboard',
      element: <AdminBlank />
    }
  ]
};

export default AdminRoutes;


