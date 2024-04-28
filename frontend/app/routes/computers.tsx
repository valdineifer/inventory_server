import type { MetaFunction } from '@remix-run/node';
import { json, useLoaderData } from '@remix-run/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { getComputers } from '~/services/computerService';
import { Computer } from '~/types/models';

export const meta: MetaFunction = () => {
  return [
    { title: 'Computadores' },
  ];
};

export async function loader() {
  const computers = await getComputers();

  return json({ computers });
}

export default function Computers() {
  const { computers } = useLoaderData<typeof loader>();
  return (
    <>
      <h2>Computadores</h2>
      <Table>
        <TableHeader>
          <TableRow>
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

const ComputerItem = ({computer}: {computer: Computer}) => {
  return (
    <TableRow>
      <TableCell>{computer.mac}</TableCell>
      <TableCell>{computer.name}</TableCell>
      <TableCell>{computer.updatedAt}</TableCell>
      <TableCell>
        <button className="text-red-500">Excluir</button>
      </TableCell>
    </TableRow>
  );
};