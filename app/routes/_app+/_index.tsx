import type { MetaFunction } from '@remix-run/node';
import { json, Link, useLoaderData } from '@remix-run/react';
import { Computer, HardDrive, PowerOff } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '~/components/ui/card';
import { countComputers } from '~/.server/services/computerService';

export const meta: MetaFunction = () => {
  return [
    { title: 'Home' },
  ];
};

export async function loader() {
  const count = await countComputers();

  return json({ count });
}

export default function Index() {
  const { count } = useLoaderData<typeof loader>();

  return (
    <main className="flex flex-1 flex-row gap-4">
      <Card className='sm:w-1/2 md:w-1/3 xl:w-1/4'>
        <Link className='hover:underline hover:underline-offset-4' to='/computers'>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
                Computadores
            </CardTitle>
            <Computer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{count.total}</div>
          </CardContent>
        </Link>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
              Contagens apenas consideram os computadores não-rejeitados.
          </div>
        </CardFooter>
      </Card>
      <Card className='sm:w-1/2 md:w-1/3 xl:w-1/4'>
        <Link className='hover:underline hover:underline-offset-4' to="/computers?inactive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
                Computadores inativos
            </CardTitle>
            <PowerOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{count.inactive}</div>
          </CardContent>
        </Link>
        <CardFooter>
          <div className="text-xs text-muted-foreground">Sem atualizações há mais de 7 dias</div>
        </CardFooter>
      </Card>
      <Card className='sm:w-1/2 md:w-1/3 xl:w-1/4'>
        <Link className='hover:underline hover:underline-offset-4' to="/computers?lowStorage">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
                Com pouco espaço em disco
            </CardTitle>
            <HardDrive className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{count.lowStorage}</div>
          </CardContent>
        </Link>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
              Com base na configuração de espaço mínimo.
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}
