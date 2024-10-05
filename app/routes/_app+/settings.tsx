import type { ActionFunctionArgs, MetaFunction } from '@remix-run/node';
import { Form, json, useActionData, useLoaderData, useSubmit } from '@remix-run/react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { Form as FormProvider, FormControl, FormDescription, FormField, FormItem, FormLabel } from '~/components/ui/form';
import { useForm } from 'react-hook-form';
import { Switch } from '~/components/ui/switch';
import { getSettings, saveSettings } from '~/services/settingsService';
import { jsonWithError, jsonWithSuccess } from 'remix-toast';
import { Button } from '~/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Settings } from '~/types/models';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';

export const meta: MetaFunction = () => {
  return [
    { title: 'Configurações' },
  ];
};

export async function loader() {
  const settings = await getSettings();

  return json(settings);
}

const formSchema = z.object({
  enableRegistration: z.boolean(),
  autoApprove: z.boolean(),
});

export default function SettingsPage() {
  const settings = useLoaderData<typeof loader>();
  const updatedSettings = useActionData<typeof action>();

  const submit = useSubmit();

  const defaultValues: Settings = {
    enableRegistration: updatedSettings?.enableRegistration
      ?? settings.enableRegistration
      ?? true,
    autoApprove: updatedSettings?.autoApprove
      ?? settings.autoApprove
      ?? true,
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  return (
    <>
      <FormProvider {...form}>
        <Form
          id="settings-form"
          onSubmit={
            form.handleSubmit((data) => {
              submit(data, { method: 'post', encType: 'application/json' });
            })
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
              <FormField
                control={form.control}
                name="autoApprove"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Auto-aprovar novos registros</FormLabel>
                      <FormDescription>
                        Decida se o registro de um novo computador constará inicialmente como
                        pendente ou como verificado.
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
    return jsonWithError(null, {
      message: error instanceof Error ? error.message : `Erro desconhecido: ${JSON.stringify(error)}`,
      description: 'Não foi possível salvar as configurações.',
    });
  }
}
