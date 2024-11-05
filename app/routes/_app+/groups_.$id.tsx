import { ActionFunctionArgs, json, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { useLoaderData, useNavigate, useSubmit } from '@remix-run/react';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, Unlink } from 'lucide-react';
import { useState } from 'react';
import { jsonWithError, jsonWithSuccess } from 'remix-toast';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { DataTable } from '~/components/ui/data-table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';
import { unlinkFromLaboratory } from '~/services/computerService';
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
  const submit = useSubmit();

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const submitUnlink = (computerId: number) => submit({ computerId }, { method: 'post' });

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
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className='text-blue-500'
                    onClick={() => navigator(`/computers/${row.original.id}`)}
                  >
                    <Eye className='size-5'/>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ver detalhes</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    className='text-yellow-600'
                    onClick={() => submitUnlink(row.original.id)}
                  >
                    <Unlink className='size-5'/>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Desvincular do grupo</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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

export async function action(args: ActionFunctionArgs) {
  const formData = await args.request.formData();
  const computerId = parseInt(formData.get('computerId')?.toString() || '', 10);

  if (!computerId) {
    return jsonWithError(null, {
      message: 'Erro ao desvincular computador'
    });
  }

  try {
    await unlinkFromLaboratory(computerId);

    return jsonWithSuccess({}, {
      message: `Computador '${computerId}' desvinculado com sucesso`,
    });
  } catch (_) {
    return jsonWithError(null, {
      message: 'Erro ao desvincular computador'
    });
  }
}