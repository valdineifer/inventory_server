import { zodResolver } from '@hookform/resolvers/zod';
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction, SerializeFrom } from '@remix-run/node';
import { json, useFetcher, useLoaderData } from '@remix-run/react';
// import { dehydrate, HydrationBoundary, keepPreviousData, QueryClient, useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowRight, PackagePlus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { jsonWithError, jsonWithSuccess } from 'remix-toast';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { DataTable } from '~/components/ui/data-table';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { Computer, linkToLaboratory, listComputers } from '~/services/computerService';

type ComputerJsonified = SerializeFrom<Computer>;

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

  // const queryClient = new QueryClient();
  // console.log('t1', new Date().toISOString());

  // const limit = Number(params.limit) || 10;
  // const skip = limit * (Number(params.index || 1) - 1);

  // await queryClient.prefetchQuery({
  //   queryKey: ['computers'],
  //   queryFn: () => listComputers({ skip, limit }),
  // });
  // console.log('t11', new Date().toISOString());

  // return json({ dehydratedState: dehydrate(queryClient) });
}

export default function Computers() {
  const data = useLoaderData<typeof loader>();

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // const { dehydratedState } = useLoaderData<typeof loader>();
  // const navigate = useNavigate();
  // const { data } = useQuery({
  //   queryKey: ['computers'],
  //   queryFn: () => {
  //     // const limit = Number(pagination.pageSize) || 10;
  //     // const skip = limit * (Number(pagination.pageIndex || 1) - 1);
  //     console.log('t1111', new Date().toISOString());
  //     return navigate(`/computers?limit=${pagination.pageSize}&index=${pagination.pageIndex}`);
  //   },
  //   // placeholderData: keepPreviousData, // don't have 0 rows flash while changing pages/loading next page
  // });

  const columns: ColumnDef<ComputerJsonified>[] = [
    { accessorKey: 'mac', header: 'MAC' },
    { accessorKey: 'name', header: 'Nome' },
    { accessorKey: 'updatedAt', header: 'Última atualização' },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => {
        return (
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost">
                  <PackagePlus className='size-5'/>
                  <span className="sr-only">Vincular a um laboratório</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent side='left' collisionPadding={{ top: 15 }}>
                <LinkToLabPopover id={row.original.id!}/>
              </PopoverContent>
            </Popover>
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
    <>
      {/* <HydrationBoundary state={dehydratedState}> */}
      <h2>Computadores</h2>
      <DataTable
        columns={columns}
        data={data.computers || []}
        pagination={pagination}
        onPaginationChange={setPagination}
      />
      {/* </HydrationBoundary> */}
    </>
  );
}
const formSchema = z.object({
  id: z.number(),
  code: z.string({ message: 'O código é obrigatório' }),
});

function LinkToLabPopover({ id }: {id: number}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id,
      code: '',
    },
  });

  // const submit = useSubmit();
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
              <FormLabel>Código</FormLabel>
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

  try {
    const validated = formSchema.parse(formData);

    await linkToLaboratory(validated);

    return jsonWithSuccess(validated, {
      message: `Computador vinculado ao laboratório ${validated.code}`,
    });
  } catch (_) {
    return jsonWithError(null, {
      message: 'Não foi possível vincular ao laboratório',
      description: 'Verifique os dados informados e se o código existe',
    });
  }
}