import { createBrowserRouter } from 'react-router-dom';

// routes
import AuthenticationRoutes from './AuthenticationRoutes';
import MainRoutes from './MainRoutes';
import SuperAdminRoutes from './SuperAdminRoutes';
import AdminRoutes from './AdminRoutes';
import CustomerRoutes from './CustomerRoutes';
import { createRoutesFromElements, Route } from 'react-router-dom';

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter([CustomerRoutes, MainRoutes, SuperAdminRoutes, AdminRoutes, AuthenticationRoutes], {
  basename: import.meta.env.VITE_APP_BASE_NAME
});

export default router;
