import { db } from '~/database/db';
import { computer, computerLog } from '~/database/schema';
import { count, sql } from 'drizzle-orm';
import dayjs from 'dayjs';

export type Computer = Omit<Partial<typeof computer.$inferSelect>, 'info'> & {
  info?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  logs?: Partial<typeof computerLog.$inferSelect>[];
};

type ComputerList = {
  page: number;
  computers: Computer[];
};

type PaginateParams = { skip?: number; limit?: number };

export async function listComputers({ skip, limit }: PaginateParams): Promise<ComputerList> {
  const computers = await db.query.computer.findMany({
    columns: { laboratoryId: false },
    limit,
    offset: skip,
  });

  return {
    computers,
    page: 1,
  };
}

export async function countComputers(): Promise<{[key: string]: number}> {
  const dateInOneWeekAgo = dayjs().subtract(7, 'day').toDate();

  const [result] = await db
    .select({
      total: count(),
      inactive: sql`
        sum(case when ${computer.updatedAt} >= ${dateInOneWeekAgo.toISOString()} then 1 else 0 end)
      `.mapWith(Number),
    })
    .from(computer);

  return result;
}

export async function getComputer(id: number): Promise<Computer> {
  if (!id) {
    throw new Error('Invalid ID');
  }

  const computer = await db.query.computer.findFirst({
    where: (computer, { eq }) => eq(computer.id, id),
    with: {
      logs: {
        orderBy: (log, { desc }) => desc(log.createdAt),
        limit: 1,
      }
    }
  });

  if (!computer) {
    throw new Error('Computer not found');
  }

  return computer;
}