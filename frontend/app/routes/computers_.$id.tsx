import { LoaderFunctionArgs, json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { getComputer } from '~/services/computerService';

export async function loader({ params }: LoaderFunctionArgs) {
  console.log(params);

  if (!params.id) {
    throw new Error('Missing id parameter');
  }

  const computer = await getComputer(params.id);

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

  return (
    <>
      <h2>Informações do computador</h2>
      <div className='grid grid-cols-2 gap-2'>
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
    </>
  );
}

function CardSection({ children }: { children: React.ReactNode }) {
  return (
    <section className="bg-gray-100 p-5 m-5">
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