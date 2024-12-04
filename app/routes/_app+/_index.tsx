import type { MetaFunction } from '@remix-run/node';
import { json, Link, useLoaderData } from '@remix-run/react';
import { Computer, HardDrive, PowerOff } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '~/components/ui/card';
import { countComputers } from '~/services/computerService';

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
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <Link className='hover:underline hover:underline-offset-4' to='/computers'>
                Computadores
            </Link>
          </CardTitle>
          <Computer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{count.total}</div>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
              Contagens apenas consideram os computadores não-rejeitados.
          </div>
        </CardFooter>
      </Card>
      <Card className='sm:w-1/2 md:w-1/3 xl:w-1/4'>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <Link className='hover:underline hover:underline-offset-4' to="/computers?inactive">
                Computadores inativos
            </Link>
          </CardTitle>
          <PowerOff className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{count.inactive}</div>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">Sem atualizações há mais de 7 dias</div>
        </CardFooter>
      </Card>
      <Card className='sm:w-1/2 md:w-1/3 xl:w-1/4'>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <Link className='hover:underline hover:underline-offset-4' to="/computers?lowStorage">
                Com pouco espaço em disco
            </Link>
          </CardTitle>
          <HardDrive className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{count.lowStorage}</div>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
              Com base na configuração de espaço mínimo. (Padrão: 20GB)
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}
