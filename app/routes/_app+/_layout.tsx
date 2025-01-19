import { LoaderFunctionArgs } from '@remix-run/node';
import { Outlet, useNavigation } from '@remix-run/react';
import { Loader2 } from 'lucide-react';
import NavBar from '~/components/navbar';
import { authenticator } from '~/.server/services/authService';

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  return null;
}

export default function App() {
  const navigation = useNavigation();

  return (
    <NavBar>
      {
        navigation.state === 'loading'
          ? <Loader2 className='size-10 animate-spin'/>
          : <Outlet />
      }
    </NavBar>
  );
}