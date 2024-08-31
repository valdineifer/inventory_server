import { json, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, Trash2, Unlink } from 'lucide-react';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { DataTable } from '~/components/ui/data-table';
import { getLaboratoryDetails } from '~/services/laboratoryService';
import { GroupJsonified } from '~/types/jsonified';

export const meta: MetaFunction = () => {
  return [
    { title: 'Grupo' },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const id = Number(params.id);

  if (!id) {
    throw new Error('ID not provided/valid');
  }

  const group = await getLaboratoryDetails(id);

  return json(group);
}

export default function GroupInfo() {
  const data = useLoaderData<typeof loader>();
  const navigator = useNavigate();

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });


  const columns: ColumnDef<GroupJsonified['computers'][number]>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'mac', header: 'MAC' },
    { accessorKey: 'name', header: 'Nome' },
    { accessorKey: 'updatedAt', header: 'Última atualização' },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => {
        return (
          <div>
            <Button
              variant="ghost"
              className='text-blue-500'
              onClick={() => navigator(`/computers/${row.original.id}`)}
            >
              <Eye className='size-5'/>
              <span className="sr-only">Ver dados</span>
            </Button>
            <Button variant='ghost' className='text-yellow-500' disabled>
              <Unlink className='size-5'/>
              <span className="sr-only">Desvincular do grupo</span>
            </Button>
            <Button variant="ghost" className='text-red-500' disabled>
              <Trash2 className='size-5'/>
              <span className="sr-only">Excluir</span>
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <section className='space-y-10'>
      <Card>
        <CardHeader>
          <CardTitle>Informações do grupo</CardTitle>
        </CardHeader>
        <CardContent>
          <section className='grid grid-flow-col-dense'>
            <section className=''>
              <strong>Código:</strong> {data.code}
            </section>
            <section className=''>
              <strong>Descrição:</strong> {data.description}
            </section>
          </section>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Computadores do grupo</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={data.computers || []}
            pagination={pagination}
            onPaginationChange={setPagination}
          />
        </CardContent>
      </Card>
    </section>
  );
}