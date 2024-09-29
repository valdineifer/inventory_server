import { LoaderFunctionArgs } from '@remix-run/node';
import { Outlet, useNavigation } from '@remix-run/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import NavBar from '~/components/navbar';
import { authenticator } from '~/services/auth.server';

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  return null;
}

export default function App() {
  const navigation = useNavigation();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <NavBar>
        {
          navigation.state === 'loading'
            ? <Loader2 className='size-10 animate-spin'/>
            : <Outlet />
        }
      </NavBar>
    </QueryClientProvider>
  );
}