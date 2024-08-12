import { LoaderFunctionArgs } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import NavBar from '~/components/navbar';
import { authenticator } from '~/services/auth.server';

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  return null;
}

export default function App() {
  return (
    <NavBar>
      <Outlet />
    </NavBar>
  );
}