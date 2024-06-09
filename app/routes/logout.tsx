import { ActionFunctionArgs } from '@remix-run/node';
import { Outlet, useSubmit } from '@remix-run/react';
import { useEffect } from 'react';
import { authenticator } from '~/services/auth.server';

export default function Logout() {
  const submit = useSubmit();

  useEffect(() => {
    submit({ logout: true }, { method: 'post' });
  }, [submit]);

  return <Outlet/>;
}

export async function action({ request }: ActionFunctionArgs) {
  return authenticator.logout(request, { redirectTo: '/login' });
}