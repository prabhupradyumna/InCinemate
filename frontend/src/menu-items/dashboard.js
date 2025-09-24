// assets
import { IconDashboard } from '@tabler/icons-react';

// constant
const icons = { IconDashboard };

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const dashboard = {
  id: 'dashboard',
  title: 'Dashboard',
  type: 'group',
  children: [
    {
      id: 'admin-dashboard',
      title: 'Admin Dashboard',
      type: 'item',
      url: '/admin/dashboard',
      icon: icons.IconDashboard,
      breadcrumbs: false,
      roles: ['admin']
    },
    {
      id: 'super-admin-dashboard',
      title: 'Super Admin Dashboard',
      type: 'item',
      url: '/super-admin/dashboard',
      icon: icons.IconDashboard,
      breadcrumbs: false,
      roles: ['super_admin']
    }
  ]
};

export default dashboard;
