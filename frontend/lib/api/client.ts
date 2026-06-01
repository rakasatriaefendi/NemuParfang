import { ENV } from '../env';

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  if (!ENV.HAS_REMOTE_API || !ENV.API_URL) {
    throw new Error('Remote API URL is not configured.');
  }

  const url = `${ENV.API_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}
