import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from '@remix-run/node'; // or cloudflare/deno
import { json, useFetcher } from '@remix-run/react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';

import { authenticator, sessionStorage } from '~/services/auth.server';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { jsonWithError } from 'remix-toast';
import { Loader2, LogIn } from 'lucide-react';

export async function loader({
  request,
}: LoaderFunctionArgs) {
  const session = await sessionStorage.getSession(request.headers.get('cookie'));
  const error = session.get(authenticator.sessionErrorKey as 'error');

  if (error) {
    return json({ error }, {
      headers:{
        'Set-Cookie': await sessionStorage.commitSession(session) // You must commit the session whenever you read a flash
      }
    });
  }

  return authenticator.isAuthenticated(request, {
    successRedirect: '/',
  });
}

export default function Login() {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === 'submitting';

  const Component = (
    <main className='mx-10'>
      <fetcher.Form method="post" className='grid gap-5' action='/login'>
        <Card className='mt-20 mx-auto w-fit py-5 px-[5%]'>
          <CardHeader>
            <CardTitle>Login</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="username">Usuário</Label>
              <Input type="text" id="username" name="username" required />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input type="password" id="password" name="password" required />
            </div>
          </CardContent>
          <CardFooter>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting
                ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                : <LogIn className="mr-2 h-4 w-4" />}
              Login
            </Button>
          </CardFooter>
        </Card>
      </fetcher.Form>
    </main>
  );

  return Component;
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    return await authenticator.authenticate('user-pass', request, {
      successRedirect: '/',
      throwOnError: true,
    });
  } catch (error) {
    if (error instanceof Response) throw error;

    return jsonWithError(null, {
      message: error instanceof Error ? error.message : `Erro desconhecido: ${JSON.stringify(error)}`,
      description: 'Não foi possível autenticar o usuário. Verifique os dados.',
    });
  }
}
