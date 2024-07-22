import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { Form, json } from '@remix-run/react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '~/components/ui/form';
import { authenticator } from '~/services/auth.server';
import { useForm } from 'react-hook-form';
import { Switch } from '~/components/ui/switch';
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

  return json({});
}

export default function Settings() {
  const formSchema = z.object({
    enableRegistration: z.boolean(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enableRegistration: true,
    },
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
        </CardHeader>
        <CardContent>
          <Form>
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
          </Form>
        </CardContent>
      </Card>
    </>
  );
}