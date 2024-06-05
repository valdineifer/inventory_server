import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
} from '@remix-run/react';
import type { LinksFunction } from '@remix-run/node';
import tailwindcss from '~/tailwind.css?url';
import NavBar from './components/navbar';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: tailwindcss },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  console.error(error);

  if (isRouteErrorResponse(error)) {
    console.error(error.status, error.statusText, error.data);
  }

  return (
    <html lang='pt-br'>
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <main className='m-10'>
          <h1>Ocorreu um erro!</h1>
          <p>
            Não foi possível processar sua requisição.<br/>
            Verifique sua requisição ou tente novamente mais tarde.
          </p>
          <pre className='bg-gray-200 w-full overflow-scroll inline-block p-3 my-3'>
            {
              isRouteErrorResponse(error)
                ? error.statusText
                : error instanceof Error ? error.message : JSON.stringify(error)
            }
          </pre>
        </main>
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <>
      <NavBar>
        <Outlet />
      </NavBar>
    </>
  );
}
