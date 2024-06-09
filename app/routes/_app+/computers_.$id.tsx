import { LoaderFunctionArgs, json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Differ, Viewer } from 'json-diff-kit';
import { Suspense } from 'react';
import { getComputer } from '~/services/computerService';

import 'json-diff-kit/dist/viewer.css';
import { authenticator } from '~/services/auth.server';

export async function loader({ params, request }: LoaderFunctionArgs) {
  await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });

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

  const getSystemInfo = (): string => {
    if (computer.info.system === 'Linux') {
      return ['Linux', computer.info.linux.name, computer.info.linux.version].join(' ');
    }

    return computer.info.system;
  };

  const differ = new Differ({
    showModifications: true,
    recursiveEqual: true,
    arrayDiffMethod: 'lcs',
  });
  const diff = differ.diff(computer.logs?.at(0)?.oldObject || {}, computer.info);

  return (
    <>
      <h2>Informações do computador</h2>
      <div className='flex flex-row flex-wrap'>
        <CardSection>
          <h3 className='mb-4'>Informações gerais</h3>
          <ComputerItem label="ID" value={computer.id} />
          <ComputerItem label="MAC" value={computer.mac} />
          <ComputerItem label="Nome" value={computer.name} />
        </CardSection>
        <CardSection>
          <h3 className='mb-4'>Informações de sistema</h3>
          <ComputerItem label="Sistema operacional" value={getSystemInfo()} />
          <ComputerItem label="Último boot" value={new Date(computer.info.boot_time).toLocaleString()} />
        </CardSection>
      </div>
      <section id="diff" className='bg-gray-100 rounded-md p-5 mx-5'>
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
    </>
  );
}

function CardSection({ children }: { children: React.ReactNode }) {
  return (
    <section className="bg-gray-100 p-5 m-5 flex-[1_0_350px]">
      {children}
    </section>
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