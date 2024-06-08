import type { ActionFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import z from 'zod';
import { inventory } from '~/services/inventoryService';

export const loader = async (_args: ActionFunctionArgs) => redirect('/');

const validatorSchema = z.object({
  hostname: z.string(),
  mac: z.string(),
  laboratoryCode: z.string().optional(),
}).catchall(z.any());

export const action = async ({
  request,
}: ActionFunctionArgs) => {
  if (request.method !== 'POST') {
    return json({ message: 'Method not allowed' }, 405);
  }

  let payload;

  try {
    payload = await request.json();
  } catch (error) {
    const details = error instanceof Error ? error.message : '';
    return json({ error: 'Invalid JSON payload', details }, 400);
  }

  const validated = validatorSchema.safeParse(payload);

  if (!validated.success) {
    return json({ error: validated.error.errors[0] }, 400);
  }

  const { data } = validated;

  const insertValues = {
    mac: data.mac,
    name: data.hostname,
    info: data,
    laboratoryId: undefined,
  };

  insertValues.info.laboratoryCode;

  return inventory(insertValues);
};