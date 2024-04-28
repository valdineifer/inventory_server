import { Computer } from '~/types/models';
import request from './request';

type ComputerList = {
  page: number;
  computers: Computer[];
};

export async function getComputers(): Promise<ComputerList> {
  const { data } = await request('/computers');

  return data;
}

export async function countComputers(): Promise<number> {
  const { data } = await request('/computers/count');

  return data.count;
}

export async function getComputer(id: string): Promise<Computer> {
  const response = await request(`/computers/${id}`);

  if (response.status !== 200) {
    throw new Error(response.data.error || 'Unexcepted error');
  }

  return response.data;
}