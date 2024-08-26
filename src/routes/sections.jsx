import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import DashboardLayout from 'src/layouts/dashboard';
import { CityView } from 'src/sections/city/view';
import { CompanyView } from 'src/sections/company/view';
import { CountryView } from 'src/sections/country/view';
import { DesignationView } from 'src/sections/designation/view';
import { ForgotPassView } from 'src/sections/forgot-password/view';
import { RoleUpdate } from 'src/sections/role-update/view';
import { RolesView } from 'src/sections/roles/view';
import { StateView } from 'src/sections/state/view';
import { UsersView } from 'src/sections/users/view';

export const IndexPage = lazy(() => import('src/pages/app'));
export const BlogPage = lazy(() => import('src/pages/blog'));
export const UserPage = lazy(() => import('src/pages/user'));
export const LoginPage = lazy(() => import('src/pages/login'));
export const CreateUser = lazy(() => import('src/pages/create-user'));
export const RoleCreate = lazy(() => import('src/pages/role-create'));
export const Configuration = lazy(() => import('src/pages/configuration'));
export const Department = lazy(() => import('src/pages/department'));
export const ProductsPage = lazy(() => import('src/pages/products'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));

// ----------------------------------------------------------------------

export default function Router() {
  const routes = useRoutes([
    {
      element: (
        <DashboardLayout>
          <Suspense>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      ),
      children: [
        { path: 'dashboard', element: <IndexPage /> },
        { path: 'card', element: <UserPage /> },
        { path: 'products', element: <ProductsPage /> },
        { path: 'blog', element: <BlogPage /> },
        { path: 'create-card', element: <CreateUser /> },
        { path: 'configuration', element: <Configuration /> },
        { path: 'master-data/country', element: <CountryView /> },
        { path: 'master-data/state', element: <StateView /> },
        { path: 'master-data/city', element: <CityView /> },
        { path: 'master-data/designation', element: <DesignationView /> },
        { path: 'master-data/company', element: <CompanyView /> },
        { path: 'master-data/department', element: <Department /> },
        { path: 'roles-permissions/roles', element: <RolesView /> },
        { path: 'master-data/role-create', element: <RoleCreate /> },
        { path: 'master-data/role-update/:id', element: <RoleUpdate /> },
        { path: 'roles-permission/users-view', element: <UsersView /> },
        // { path: 'reset-password', element: <ForgotPassView /> },
      ],
    },
    {
      path: '/',
      element: <LoginPage />,
    },
    {
      path: 'reset-password',
      element: <ForgotPassView />,
    },
    {
      path: '404',
      element: <Page404 />,
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}
