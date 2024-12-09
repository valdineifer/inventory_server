import { db } from '~/database/db';
import { computer, computerLog } from '~/database/schema';
import { and, count, eq, gte, ilike, inArray, lte, ne, or, sql } from 'drizzle-orm';
import dayjs from 'dayjs';
import { Status } from '~/types/models';
import { GB_UNIT_IN_BYTES } from '~/types/consts';
import { getSettings } from './settingsService';

export type Computer = Partial<typeof computer.$inferSelect> & {
  logs?: Partial<typeof computerLog.$inferSelect>[];
};

type ComputerList = {
  count: number;
  computers: Computer[];
};

type ListParams = {
  filters: {
    updatedAfter?: Date,
    lowStorage?: boolean;
    inactive?: boolean;
    query?: string;
  };
  skip?: number;
  limit?: number;
 };

export async function listComputers({ filters, limit, skip }: ListParams): Promise<ComputerList> {
  const query = db.select().from(computer);

  const settings = await getSettings();
  const lowSpaceGB = settings.minimumDiskSpaceInGigaForAlert || 20;

  const filtersArray = [];

  if (filters.query) {
    filtersArray.push(
      or(
        ilike(computer.mac, `%${filters.query}%`),
        ilike(computer.name, `%${filters.query}%`),
        !isNaN(parseInt(filters.query, 10)) ? eq(computer.id, parseInt(filters.query, 10)) : undefined,
      ),
    );
  }

  if (filters.updatedAfter) filtersArray.push(gte(computer.updatedAt, filters.updatedAfter));
  if (filters.inactive) filtersArray.push(lte(computer.updatedAt, dayjs().subtract(7, 'days').toDate()));
  if (filters.lowStorage) {
    filtersArray.push(
      sql`(jsonb_path_query_first(info, '$.disks[*] ? (@.mountpoint == "/").free')::bigint <= ${lowSpaceGB * GB_UNIT_IN_BYTES})`
    );
  }

  query.where(and(...filtersArray));

  const [{ total }] = await db.select({ total: count() }).from(query.as('query'));

  if (limit) query.limit(limit);
  if (skip) query.offset(skip);

  const computers = await query;

  return {
    computers,
    count: total,
  };
}

export async function countComputers(): Promise<{[key: string]: number}> {
  const dateInOneWeekAgo = dayjs().subtract(7, 'day').toDate();

  const settings = await getSettings();
  const lowSpaceGB = settings.minimumDiskSpaceInGigaForAlert || 20;

  const [result] = await db
    .select({
      total: count(),
      inactive: sql`
        sum(case when ${computer.updatedAt} <= ${dateInOneWeekAgo.toISOString()} then 1 else 0 end)
      `.mapWith((value) => (Number(value) || 0)),
      lowStorage: sql`
        sum(
          case
            when (jsonb_path_query_first(info, '$.disks[*] ? (@.mountpoint == "/").free')::bigint <= ${lowSpaceGB * GB_UNIT_IN_BYTES})
            then 1
            else 0
          end
        )
        `.mapWith(value => Number(value) || 0),
    })
    .from(computer)
    .where(ne(computer.status, 'rejected'));

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

export async function unlinkFromLaboratory(computerId: number) {
  await db.update(computer)
    .set({ laboratoryId: null })
    .where(sql`${computer.id} = ${computerId}`);

  return true;
}

export async function deleteComputer(id: number) {
  const [deleted] = await db.delete(computer).where(sql`${computer.id} = ${id}`).returning();

  return deleted.id === id;
}

export async function updateComputerStatus(id: number, status: Status) {
  const [result] = await db.update(computer)
    .set({ status })
    .where(sql`${computer.id} = ${id}`)
    .returning();

  return result.status === status;
}