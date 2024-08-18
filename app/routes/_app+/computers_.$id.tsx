import { LoaderFunctionArgs, json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Differ, Viewer } from 'json-diff-kit';
import { Suspense } from 'react';
import { getComputer } from '~/services/computerService';

import 'json-diff-kit/dist/viewer.css';
import { Separator } from '~/components/ui/separator';
import { Card, CardContent, CardHeader } from '~/components/ui/card';

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
    bytes ? (bytes * 1e-9).toFixed(2) + ' GB' : ''
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
                    ? new Date(computer.info?.boot_time).toLocaleString()
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