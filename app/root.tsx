import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  json,
  useLoaderData,
  useRouteError,
} from '@remix-run/react';
import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/node';
import { getToast } from 'remix-toast';
import tailwindcss from '~/tailwind.css?url';
import { useEffect } from 'react';
import { useToast } from './components/ui/use-toast';
import { Toaster } from './components/ui/toaster';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: tailwindcss },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Extracts the toast from the request
  const { toast, headers } = await getToast(request);
  // Important to pass in the headers so the toast is cleared properly
  return json({ toast }, { headers });
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
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
        <Toaster />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  console.error(error);

  if (isRouteErrorResponse(error)) {
    console.error(error.status, error.statusText, error.data);

    if (error.status % 500 !== 0) return null;
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
  const { toast } = useLoaderData<typeof loader>();
  const { toast: notify } = useToast();

  useEffect(() => {
    if (toast) {
      notify({
        title: toast.message,
        description: toast.description,
        variant: toast.type === 'error' ? 'destructive' : 'default',
      });
    }
  }, [toast, notify]);

  return <Outlet />;
}
