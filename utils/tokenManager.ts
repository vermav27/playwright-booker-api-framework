import type { APIRequestContext } from '@playwright/test';
import { endpoints } from '../config/endpoints';

export async function getAuthToken(request: APIRequestContext): Promise<string> {
  const baseUrl = process.env.BASE_URL;
  const username = process.env.AUTH_USERNAME;
  const password = process.env.AUTH_PASSWORD;

  const response = await request.post(`${baseUrl}${endpoints.auth}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data: { username, password },
  });

  const responseBody = (await response.json()) as { token: string };
  return responseBody.token;
}
