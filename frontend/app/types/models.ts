export type Computer = {
  id: number;
  mac: string;
  name: string;
  info: { [key: string]: any }; // eslint-disable-line @typescript-eslint/no-explicit-any
  updatedAt: string;
}