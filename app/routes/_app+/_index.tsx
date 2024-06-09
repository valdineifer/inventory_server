import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, useLoaderData } from '@remix-run/react';
import { DollarSign } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { authenticator } from '~/services/auth.server';
import { countComputers } from '~/services/computerService';

export const meta: MetaFunction = () => {
  return [
    { title: 'Home' },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const count = await countComputers();

  return json({ count });
}

export default function Index() {
  const { count } = useLoaderData<typeof loader>();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Computadores</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{count}</div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
