import { zodResolver } from '@hookform/resolvers/zod';
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction, SerializeFrom } from '@remix-run/node';
import { json, useFetcher, useLoaderData, useNavigate, useSearchParams, FetcherWithComponents } from '@remix-run/react';
import { ColumnDef, OnChangeFn, PaginationState, RowSelectionState } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { ArrowRight, Eye, PackagePlus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { jsonWithError, jsonWithSuccess } from 'remix-toast';
import { z } from 'zod';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '~/components/ui/alert-dialog';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import { DataTable } from '~/components/ui/data-table';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';
import { Computer, deleteComputer, linkToLaboratory, listComputers } from '~/.server/services/computerService';
import { GB_UNIT_IN_BYTES } from '~/types/consts';
import { Status } from '~/types/models';

type ComputerJsonified = SerializeFrom<Computer>;

export const meta: MetaFunction = () => {
  return [
    { title: 'Computadores' },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { searchParams } = new URL(request.url);

  const limit = Number(searchParams.get('limit')) || 10;
  const skip = (Number(searchParams.get('page')) * limit) || 0;

  const data = await listComputers({
    filters: {
      inactive: searchParams.get('inactive') != null,
      lowStorage: searchParams.get('lowStorage') != null,
      updatedAfter: searchParams.get('updatedAfter')
        ? dayjs(searchParams.get('updatedAfter')).toDate()
        : undefined,
      query: searchParams.get('query') ?? undefined,
    },
    limit,
    skip,
  });

  return json(data);
}

export default function Computers() {
  const data = useLoaderData<typeof loader>();
  const navigator = useNavigate();
  const fetcher = useFetcher({ key: 'delete-form' });
  const [searchParams, setSearchParams] = useSearchParams();

  const [pagination, setPagination] = useState(() => ({
    pageIndex: Number(searchParams.get('page')) || 0,
    pageSize: Number(searchParams.get('limit')) || 10,
  }));

  const [computerLinkList, setComputerLinkList] = useState<number[]>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const searchComputers = (value: string) => {
    setSearchParams(new URLSearchParams({ query: value }));
  };

  useEffect(() => {
    const list = Object.entries(rowSelection)
      .filter(([, value]) => value)
      .map(([key]) => data.computers[Number(key)].id!);

    setComputerLinkList(list);
  }, [rowSelection, data.computers]);

  useEffect(() => {
    setPagination({
      pageIndex: Number(searchParams.get('page')) || 0,
      pageSize: Number(searchParams.get('limit')) || 10,
    });
  }, [setPagination, searchParams]);

  const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
    let newState;

    if (typeof updater === 'function') {
      newState = updater(pagination);
    } else {
      newState = updater;
    }

    if (
      pagination.pageIndex === Number(newState.pageIndex)
      && pagination.pageSize === Number(newState.pageSize)
    ) {
      return;
    }

    setRowSelection({});

    setSearchParams((prev) => {
      prev.set('page', newState.pageIndex.toString());
      prev.set('limit', newState.pageSize.toString());

      return prev;
    });
  };

  const columns: ColumnDef<ComputerJsonified>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <div className="inline">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Selecionar todos"
          />

        </div>
      ),
      cell: ({ row }) => (
        <div className="inline">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Selecionar linha"
          />

        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    { accessorKey: 'mac', header: 'MAC' },
    { accessorKey: 'info.ip', header: 'IP' },
    {
      accessorFn: (row) => ((row.info?.disks[0].free ?? 0) / GB_UNIT_IN_BYTES).toFixed(2) + ' GB',
      header: 'Armazenamento livre',
    },
    { accessorKey: 'name', header: 'Nome' },
    { accessorKey: 'updatedAt', header: 'Última atualização' },
    {
      header: 'Status',
      accessorFn: (row) => {
        const map = {
          [Status.verified]: 'Verificado',
          [Status.unverified]: 'Não-verificado',
          [Status.rejected]: 'Rejeitado'
        };
        return map[row.status || Status.unverified];
      },
    },
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
            <DeleteForm id={row.original.id!} fetcher={fetcher}/>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <h2>Computadores</h2>
      <div className="flex items-center space-x-4 rounded-md border p-4 mt-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" disabled={computerLinkList.length === 0}>
              <PackagePlus className='size-5 mr-2'/>
              <span>Vincular a um grupo</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent side='bottom' collisionPadding={{ top: 15 }}>
            <LinkToLabPopover ids={computerLinkList}/>
          </PopoverContent>
        </Popover>
      </div>
      <DataTable
        columns={columns}
        data={data.computers || []}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        rowCount={data.count}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        searchFn={searchComputers}
        defaultQuery={searchParams.get('query')}
      />
    </>
  );
}

function DeleteForm({ id, fetcher }: {id: number, fetcher: FetcherWithComponents<unknown>}) {
  const isSubmitting = fetcher.state !== 'idle';

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          className='text-red-500'
        >
          <Trash2 className='size-5'/>
          <span className="sr-only">Excluir</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. O registro será totalmente apagado da base de dados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar ação</AlertDialogCancel>
          <fetcher.Form method='post' className='inline-block'
            onSubmit={
              (ev) => {
                ev.preventDefault();
                fetcher.submit({ id, intent: 'DELETE' }, { method: 'post', encType: 'application/json' });
              }
            }
          >
            <AlertDialogAction asChild>
              <Button className='bg-red-500' type='submit'>
                {isSubmitting ? 'Excluindo...' : 'Excluir'}
              </Button>
            </AlertDialogAction>
          </fetcher.Form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const formSchema = z.object({
  ids: z.array(z.number()),
  code: z.string({ message: 'O código é obrigatório' }),
});

function LinkToLabPopover({ ids }: { ids: number[] }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ids,
      code: '',
    },
  });

  const fetcher = useFetcher();
  const isSubmitting = fetcher.state !== 'idle';

  return (
    <Form {...form}>
      <fetcher.Form
        id="form"
        onSubmit={
          form.handleSubmit((data) => {
            fetcher.submit(data, { method: 'post', encType: 'application/json' });
          })
        }
        className="space-y-5"
      >
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código do grupo</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Este código deve ser único.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          disabled={isSubmitting}
          type="submit"
          form="form"
        >
          <ArrowRight className='size-5'/>
        </Button>
      </fetcher.Form>
    </Form>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.json();

  if (formData.intent === 'DELETE') {
    try {
      await deleteComputer(formData.id);

      return jsonWithSuccess(formData, {
        message: 'Computador deletado',
      });
    } catch (_) {
      return jsonWithError(null, {
        message: 'Erro ao deletar computador',
      });
    }
  }

  try {
    const validated = formSchema.parse(formData);

    await linkToLaboratory(validated);

    return jsonWithSuccess(validated, {
      message: `Computador(es) vinculado ao grupo ${validated.code}`,
    });
  } catch (_) {
    return jsonWithError(null, {
      message: 'Não foi possível vincular ao laboratório',
      description: 'Verifique os dados informados e se o código do grupo existe',
    });
  }
}