import { zodResolver } from '@hookform/resolvers/zod';
import { ActionFunctionArgs, json, MetaFunction, SerializeFrom } from '@remix-run/node';
import { useFetcher, useLoaderData, useNavigate } from '@remix-run/react';
import { Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { jsonWithError, jsonWithSuccess } from 'remix-toast';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { Form as FormProvider, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { createLaboratory, listLaboratories } from '~/services/laboratoryService';
import { Laboratory } from '~/types/models';

export const meta: MetaFunction = () => {
  return [
    { title: 'Grupos' },
  ];
};

export async function loader() {
  const labs = await listLaboratories();

  return json(labs);
}

export default function Groups() {
  const groups = useLoaderData<typeof loader>();

  return (
    <>
      <h2>Grupos</h2>
      <div className='text-right my-5'>
        <Popover>
          <PopoverTrigger asChild>
            <Button className='right-0' variant='outline'>
              <Plus className='size-5 mr-2'/> Criar
            </Button>
          </PopoverTrigger>
          <PopoverContent side='left' collisionPadding={{ top: 15 }}>
            <CreateForm/>
          </PopoverContent>
        </Popover>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Data de criação</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.length ? (
            groups.map((laboratory) => (
              <LaboratoryItem key={laboratory.id} laboratory={laboratory}/>
            ))
          ) : (
            <TableRow>
              <TableCell className='text-center' colSpan={5}>
                Nenhum grupo registrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}

type LaboratoryJsonified = SerializeFrom<Laboratory>;

function LaboratoryItem({ laboratory }: { laboratory: LaboratoryJsonified }) {
  const navigate = useNavigate();

  const goToComputerPage = () => navigate(`/groups/${laboratory.id}`);

  return (
    <TableRow className='cursor-pointer' onClick={goToComputerPage}>
      <TableCell>{laboratory.id}</TableCell>
      <TableCell>{laboratory.code}</TableCell>
      <TableCell>{laboratory.description}</TableCell>
      <TableCell>{new Date(laboratory.createdAt).toLocaleString()}</TableCell>
      <TableCell>
        <Button variant="link" className='text-red-500' disabled>
          <Trash2 className='size-5 mr-2'/> Excluir
        </Button>
      </TableCell>
    </TableRow>
  );
}

const formSchema = z.object({
  code: z
    .string({ message: 'O código é obrigatório' })
    .min(2, {
      message: 'O código deve ter pelo menos 2 caracteres',
    })
    .max(10, {
      message: 'O código deve ter no máximo 10 caracteres',
    }),
  description: z.string().optional(),
});

function CreateForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      description: '',
    },
  });

  // const submit = useSubmit();
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state !== 'idle';

  return (
    <FormProvider {...form}>
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
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          disabled={isSubmitting}
          type="submit"
          form="form"
        >
          Salvar
        </Button>
      </fetcher.Form>
    </FormProvider>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.json();

  try {
    const validated = formSchema.parse(formData);

    await createLaboratory(validated);

    return jsonWithSuccess(validated, {
      message: 'Laboratório criado',
    });
  } catch (_) {
    console.error(_);
    return jsonWithError(null, {
      message: 'Não foi possível criar o laboratório',
      description: 'Verifique os dados informados, em especial o código talvez já existente',
    });
  }
}