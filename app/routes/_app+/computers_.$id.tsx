import { ActionFunctionArgs, LoaderFunctionArgs, SerializeFrom, json } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { Differ, Viewer } from 'json-diff-kit';
import { Suspense, useState } from 'react';
import { getComputer, updateComputerStatus } from '~/.server/services/computerService';
import 'json-diff-kit/dist/viewer.css';
import { Separator } from '~/components/ui/separator';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { GB_UNIT_IN_BYTES } from '~/types/consts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Status } from '~/types/models';
import { Button } from '~/components/ui/button';
import { Save } from 'lucide-react';
import { z } from 'zod';
import { jsonWithError, jsonWithSuccess } from 'remix-toast';

export async function loader({ params }: LoaderFunctionArgs) {
  if (!params.id) {
    throw new Error('Missing id parameter');
  }

  if (isNaN(Number(params.id))) {
    throw new Error('Invalid id parameter');
  }

  const computer = await getComputer(Number(params.id));

  return json(computer);
}

export default function ComputerInfo() {
  const computer = useLoaderData<typeof loader>();

  const getSystemInfo = (): string|undefined => {
    if (computer.info?.system === 'Linux') {
      return ['Linux', computer.info?.linux.name, computer.info?.linux.version].join(' ');
    }

    return computer.info?.system;
  };

  const differ = new Differ({
    showModifications: true,
    recursiveEqual: true,
    arrayDiffMethod: 'lcs',
  });
  const diff = differ.diff(computer.logs?.at(0)?.oldObject || {}, computer.info);

  const formatBytes = (bytes: number|undefined) => (
    bytes ? (bytes / GB_UNIT_IN_BYTES).toFixed(2) + ' GB' : ''
  );

  return (
    <div className="space-y-10">
      <h2>Informações do computador</h2>
      <div className="flex flex-row flex-wrap gap-7">
        <div className='flex-[1_0_50%] flex flex-col flex-wrap gap-7'>
          <Card className='flex-[1_0_auto]'>
            <CardHeader className="space-y-0 pb-2">
              <h3 className='mb-4'>Informações gerais</h3>
            </CardHeader>
            <CardContent>
              <ComputerItem label="ID" value={computer.id} />
              <ComputerItem label="Grupo" value={computer.laboratoryId}/>
              <Separator/>
              <ComputerStatusItem computer={computer}/>
              <Separator/>
              <ComputerItem label="MAC" value={computer.mac} />
              <ComputerItem label="IP" value={computer.info?.ip} />
              <ComputerItem label="Nome" value={computer.name} />
            </CardContent>
          </Card>

          <Card className='flex-[1_0_auto]'>
            <CardHeader className="space-y-0 pb-2">
              <h3 className='mb-4'>Memória RAM</h3>
            </CardHeader>
            <CardContent>
              <ComputerItem label="Total" value={formatBytes(computer.info?.memory.total)} />
              <ComputerItem label="Swap" value={formatBytes(computer.info?.memory.total_swap)} />
            </CardContent>
          </Card>

          <Card className='flex-[1_0_auto]'>
            <CardHeader className="space-y-0 pb-2">
              <h3 className='mb-4'>Informações de sistema</h3>
            </CardHeader>
            <CardContent>
              <ComputerItem label="Sistema operacional" value={getSystemInfo()} />
              <ComputerItem
                label="Último boot"
                value={
                  computer.info?.boot_time
                    ? new Date(computer.info?.boot_time).toLocaleString('pt-BR')
                    : ''
                }
              />
            </CardContent>
          </Card>
        </div>

        <div className='flex-[1_0_20%] flex flex-col flex-wrap gap-7'>
          <Card className=''>
            <CardHeader className="space-y-0 pb-2">
              <h3 className='mb-4'>Armazenamento</h3>
            </CardHeader>
            <CardContent>
              {
                computer.info?.disks.map((disk, i) => (
                  <div key={i}>
                    <Separator className='my-4'/>
                    <div>
                      <h4 className='scroll-m-20 text-xl font-semibold'>{disk.device}</h4>
                      <ComputerItem label="Livre" value={formatBytes(disk.free)} />
                      <ComputerItem label="Usado" value={formatBytes(disk.used)} />
                      <ComputerItem label="Total" value={formatBytes(disk.total)} />
                    </div>
                  </div>
                ))
              }
            </CardContent>
          </Card>
        </div>
      </div>

      <section id="diff" className='bg-gray-100 rounded-md p-5'>
        <h3 className='mb-3'>Última atualização</h3>
        <Suspense>
          <Viewer
            diff={diff}
            lineNumbers={true}
            highlightInlineDiff={true}
            inlineDiffOptions={{
              mode: 'word',
              wordSeparator: ' ',
            }}
            hideUnchangedLines={true}
          />
        </Suspense>
      </section>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ComputerItem({ label, value }: { label: string; value: any }) {
  return (
    <div className='grid grid-cols-2 my-3'>
      <strong>{label}</strong>
      <span>{value}</span>
    </div>
  );
}

function ComputerStatusItem({ computer }: {computer: SerializeFrom<typeof loader>}) {
  const fetcher = useFetcher();
  const [newStatus, setNewStatus] = useState<string|undefined>();

  return (
    <div className='grid grid-cols-2 items-center my-3'>
      <strong>Status</strong>
      <div className='grid grid-cols-2'>
        <Select defaultValue={computer.status || Status.unverified} onValueChange={setNewStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={Status.verified}>Verificado</SelectItem>
            <SelectItem value={Status.unverified}>Não-verificado</SelectItem>
            <SelectItem value={Status.rejected}>Rejeitado</SelectItem>
          </SelectContent>
        </Select>
        <Button
          size="icon"
          variant="outline"
          onClick={
            (_) => fetcher.submit(
              { action: 'update-status', data: { id: computer.id!, status: newStatus! } },
              { method: 'post', encType: 'application/json' },
            )
          }
        >
          <Save size={5} />
        </Button>
      </div>
    </div>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const data = await request.json();

  const { error, data: validated } = z.object({
    action: z.enum(['update-status']),
    data: z.object({
      id: z.number(),
      status: z.nativeEnum(Status),
    }),
  }).safeParse(data);

  if (error) {
    return jsonWithError(null, {
      message: 'Erro ao processar requisição.',
      description: 'Verifique os dados submetidos e tente novamente',
    });
  }

  if (validated.action === 'update-status') {
    const wasUpdated = await updateComputerStatus(validated.data.id, validated.data.status);

    if (wasUpdated) {
      return jsonWithSuccess(null, 'Sucesso ao atualizar status do computador');
    } else {
      return jsonWithError(null, 'Erro ao atualizar status do computador');
    }
  }
}