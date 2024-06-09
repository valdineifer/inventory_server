import { Outlet } from '@remix-run/react';
import NavBar from '~/components/navbar';

export default function App() {
  return (
    <NavBar>
      <Outlet />
    </NavBar>
  );
}