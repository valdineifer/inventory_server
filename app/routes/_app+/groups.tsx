import { zodResolver } from '@hookform/resolvers/zod';
import { ActionFunctionArgs, json, MetaFunction, SerializeFrom } from '@remix-run/node';
import { useFetcher, useLoaderData, useNavigate } from '@remix-run/react';
import { Eye, Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { jsonWithError, jsonWithSuccess } from 'remix-toast';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { Form as FormProvider, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { createLaboratory, deleteLaboratory, listLaboratories } from '~/services/laboratoryService';
import { Laboratory } from '~/types/models';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '~/components/ui/alert-dialog';

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

  return (
    <TableRow>
      <TableCell>{laboratory.id}</TableCell>
      <TableCell>{laboratory.code}</TableCell>
      <TableCell>{laboratory.description}</TableCell>
      <TableCell>{new Date(laboratory.createdAt).toLocaleString('pt-BR')}</TableCell>
      <TableCell>
        <Button
          variant="ghost"
          className='text-blue-500'
          onClick={() => navigate(`/groups/${laboratory.id}`)}
        >
          <Eye className='size-5'/>
          <span className="sr-only">Ver dados</span>
        </Button>
        <DeleteForm id={laboratory.id}/>
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
  intent: z.string().default('CREATE'),
});

function CreateForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      description: '',
    },
  });

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

function DeleteForm({ id }: {id: number}) {
  const fetcher = useFetcher();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className='text-red-500'>
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
            onSubmit={(ev) => {
              ev.preventDefault();
              fetcher.submit({ id, intent: 'DELETE' }, { method: 'post', encType: 'application/json' });
            }}
          >
            <input type="hidden" name="id" value={id} />
            <AlertDialogAction asChild>
              <Button
                className='bg-red-500'
                type='submit'
              >
                {fetcher.state !== 'idle' ? 'Excluindo...' : 'Excluir'}
              </Button>
            </AlertDialogAction>
          </fetcher.Form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.json();

  if (formData.intent === 'DELETE') {
    try {
      await deleteLaboratory(formData.id);
      return jsonWithSuccess(formData, {
        message: 'Grupo deletado',
      });
    } catch (_) {
      return jsonWithError(null, {
        message: 'Erro ao deletar grupo',
      });
    }
  }

  try {
    const validated = formSchema.parse(formData);

    await createLaboratory(validated);

    return jsonWithSuccess(validated, {
      message: 'Grupo criado',
    });
  } catch (_) {
    return jsonWithError(null, {
      message: 'Não foi possível criar o grupo',
      description: 'Verifique os dados informados, em especial o código talvez já existente',
    });
  }
}