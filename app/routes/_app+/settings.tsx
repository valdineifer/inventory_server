import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { Form, json, useActionData, useLoaderData, useSubmit } from '@remix-run/react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { Form as FormProvider, FormControl, FormDescription, FormField, FormItem, FormLabel } from '~/components/ui/form';
import { authenticator } from '~/services/auth.server';
import { useForm } from 'react-hook-form';
import { Switch } from '~/components/ui/switch';
import { getSettings, saveSettings } from '~/services/settingsService';
import { jsonWithError, jsonWithSuccess } from 'remix-toast';
import { Button } from '~/components/ui/button';
import { Loader2 } from 'lucide-react';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';

export const meta: MetaFunction = () => {
  return [
    { title: 'Configurações' },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const settings = await getSettings();

  return json(settings);
}

const formSchema = z.object({
  enableRegistration: z.boolean(),
});

export default function Settings() {
  const settings = useLoaderData<typeof loader>();
  const updatedSettings = useActionData<typeof action>();

  const submit = useSubmit();

  let enableRegistration = true;

  if (updatedSettings?.enableRegistration != null) {
    enableRegistration = updatedSettings.enableRegistration;
  } else if (settings.enableRegistration != null) {
    enableRegistration = settings.enableRegistration;
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enableRegistration,
    },
  });

  return (
    <>
      <FormProvider {...form}>
        <Form
          id="settings-form"
          onSubmit={
            form.handleSubmit((data) => {
              submit(data, { method: 'post', encType: 'application/json' });
            }, (errors) => console.error(errors))
          }
        >
          <Card className='mx-auto max-w-5xl'>
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="enableRegistration"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Habilitar registros</FormLabel>
                      <FormDescription>
                      Permite que novos computadores se registrem no sistema.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        name={field.name}
                        ref={field.ref}
                        disabled={field.disabled}
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              {/* <FormField
              control={form.control}
              name="verificationDefault"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Status padrão de verificação</FormLabel>
                    <FormDescription>
                      Especifique um status de verificação padrão para novos computadores.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Select>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Valor padrão" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UNVERIFIED">Unverified</SelectItem>
                        <SelectItem value="VERIFIED">Verified</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            /> */}
            </CardContent>
            <CardFooter>
              <Button
                disabled={!form.formState.isDirty || form.formState.isSubmitting}
                type="submit"
                form="settings-form"
              >
                {form.formState.isSubmitting && <Loader2 className='animate-spin mr-2'/>}
            Salvar
              </Button>
            </CardFooter>
          </Card>
        </Form>
      </FormProvider>
    </>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.json();

  try {
    const validated = formSchema.parse(formData);

    await saveSettings(validated);

    return jsonWithSuccess(validated, {
      message: 'Configurações salvas com sucesso.',
    });
  } catch (error) {
    return jsonWithError(undefined, {
      message: error instanceof Error ? error.message : `Erro desconhecido: ${JSON.stringify(error)}`,
      description: 'Não foi possível salvar as configurações.',
    });
  }
}
