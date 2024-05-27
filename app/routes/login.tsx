import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from '@remix-run/node'; // or cloudflare/deno
import { json, redirect } from '@remix-run/node'; // or cloudflare/deno
import { useLoaderData } from '@remix-run/react';

import { getSession, commitSession } from '../sessions';
import { validateCredentials } from '~/services/authService';

export async function loader({
  request,
}: LoaderFunctionArgs) {
  const session = await getSession(
    request.headers.get('Cookie')
  );

  if (session.has('token')) {
    // Redirect to the home page if they are already signed in.
    return redirect('/');
  }

  const data = { error: session.get('error') };

  return json(data, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
}

export async function action({
  request,
}: ActionFunctionArgs) {
  const session = await getSession(
    request.headers.get('Cookie')
  );
  const form = await request.formData();
  const username = form.get('username');
  const password = form.get('password');

  const token = await validateCredentials({
    username: username?.toString(),
    password: password?.toString(),
  });

  if (token == null) {
    session.flash('error', 'Invalid username/password');

    // Redirect back to the login page with errors.
    return redirect('/login', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }

  session.set('token', token);

  // Login succeeded, send them to the home page.
  return redirect('/', {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
}

export default function Login() {
  const { error } = useLoaderData<typeof loader>();

  return (
    <div>
      {error ? <div className="error">{error}</div> : null}
      <form method="POST">
        <div>
          <p>Please sign in</p>
        </div>
        <label>
          Username: <input type="text" name="username" />
        </label>
        <label>
          Password:{' '}
          <input type="password" name="password" />
        </label>
      </form>
    </div>
  );
}
