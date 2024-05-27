const BASE_URL = process.env.API_URL || 'http://localhost:4000';

export default async function request(endpoint: string, request?: RequestInit) {
  const url = new URL(endpoint, BASE_URL);

  const response = await fetch(url, request);

  return {
    status: response.status,
    data: await response.json(),
  };
}