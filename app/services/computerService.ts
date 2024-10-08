import { db } from '~/database/db';
import { computer, computerLog } from '~/database/schema';
import { count, gte, inArray, sql } from 'drizzle-orm';
import dayjs from 'dayjs';

export type Computer = Partial<typeof computer.$inferSelect> & {
  logs?: Partial<typeof computerLog.$inferSelect>[];
};

type ComputerList = {
  count: number;
  computers: Computer[];
};

type PaginateParams = { updatedAfter?: Date, skip?: number; limit?: number };

export async function listComputers(params: PaginateParams): Promise<ComputerList> {
  const query = db.select().from(computer);

  if (params.updatedAfter) query.where(gte(computer.updatedAt, params.updatedAfter));

  const [{ total }] = await db.select({ total: count() }).from(query.as('query'));

  if (params.limit) query.limit(params.limit);
  if (params.skip) query.offset(params.skip);

  const computers = await query;

  return {
    computers,
    count: total,
  };
}

export async function countComputers(): Promise<{[key: string]: number}> {
  const dateInOneWeekAgo = dayjs().subtract(7, 'day').toDate();

  const [result] = await db
    .select({
      total: count(),
      inactive: sql`
        sum(case when ${computer.updatedAt} <= ${dateInOneWeekAgo.toISOString()} then 1 else 0 end)
      `.mapWith((value) => (Number(value) || 0)),
    })
    .from(computer);

  return result;
}

export async function getComputer(id: number): Promise<Computer> {
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

export async function linkToLaboratory(data: { ids: number[], code: string }) {
  const laboratory = await db.query.laboratory.findFirst({
    where: (lab, { eq }) => eq(lab.code, data.code),
    columns: { id: true },
  });

  if (!laboratory) {
    throw new Error('Laboratório não encontrado com o código informado');
  }

  await db.update(computer)
    .set({ laboratoryId: laboratory?.id })
    .where(inArray(computer.id, data.ids));

  return true;
}