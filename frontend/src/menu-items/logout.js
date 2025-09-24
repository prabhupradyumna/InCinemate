import { IconLogout2 } from '@tabler/icons-react';

const icons = { IconLogout2 };

const account = {
  id: 'account',
  title: 'Account',
  type: 'group',
  children: [
    {
      id: 'logout',
      title: 'Logout',
      type: 'item',
      url: '/logout',
      icon: icons.IconLogout2,
      breadcrumbs: false,
      roles: ['admin', 'super_admin']
    }
  ]
};

export default account;


