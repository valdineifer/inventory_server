import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, useLoaderData } from '@remix-run/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Computer, listComputers } from '~/services/computerService';

export const meta: MetaFunction = () => {
  return [
    { title: 'Computadores' },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const data = await listComputers({
    limit: Number(params.limit) || undefined,
    skip: Number(params.skip) || undefined,
  });

  return json(data);
}

export default function Computers() {
  const { computers } = useLoaderData<typeof loader>();

  return (
    <>
      <h2>Computadores</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>MAC</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Última atualização</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {computers.length ? (
            computers.map((computer) => (
              <ComputerItem key={computer.id} computer={computer}/>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4}>Nenhum computador registrado</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}

type ComputerJsonified = Omit<Computer, 'createdAt'|'updatedAt'> & {
  createdAt?: string,
  updatedAt?: string,
};

const ComputerItem = ({ computer }: { computer: ComputerJsonified }) => {
  return (
    <TableRow>
      <TableCell>{computer.id}</TableCell>
      <TableCell>{computer.mac}</TableCell>
      <TableCell>{computer.name}</TableCell>
      {computer.updatedAt
        ? <TableCell>{new Date(computer.updatedAt).toLocaleString()}</TableCell>
        : <TableCell>-</TableCell>}
      <TableCell>
        <button className="text-red-500">Excluir</button>
      </TableCell>
    </TableRow>
  );
};