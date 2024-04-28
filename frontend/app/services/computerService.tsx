import { Computer } from '~/types/models';
import request from './request';

export async function getComputers(): Promise<Computer[]> {
  const { data } = await request('/computers');

  return data;
}

export async function countComputers(): Promise<number> {
  const { data } = await request('/computers/count');

  return data.count;
}