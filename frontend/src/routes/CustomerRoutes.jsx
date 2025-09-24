import { lazy } from 'react';
import Loadable from 'ui-component/Loadable';
import MinimalLayout from 'layout/MinimalLayout';
import PrivateRoute from '../components/auth/PrivateRoute';

const CustomerHome = Loadable(lazy(() => import('views/customer/Home')));
const MovieDetails = Loadable(lazy(() => import('views/customer/MovieDetails')));
const SeatSelection = Loadable(lazy(() => import('views/customer/SeatSelection')));
const Checkout = Loadable(lazy(() => import('views/customer/Checkout')));

const CustomerRoutes = {
  path: '/',
  element: <MinimalLayout />,
  children: [
    { path: '/', element: <CustomerHome /> },
    { path: 'movie/:id', element: <MovieDetails /> },
    { path: 'show/:showId/seats', element: <SeatSelection /> },
    {
      path: 'checkout',
      element: (
        <PrivateRoute allowedRoles={["customer"]}>
          <Checkout />
        </PrivateRoute>
      )
    }
  ]
};

export default CustomerRoutes;


