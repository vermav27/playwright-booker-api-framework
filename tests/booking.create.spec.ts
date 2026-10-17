import { test, expect } from '@playwright/test';
import { endpoints } from '../config/endpoints';
import { createBookingResponseSchema } from '../schemas/booking.schema';
import { generateBookingData } from '../utils/dataGenerator';

test('create a booking', async ({ request }) => {
  const baseUrl = process.env.BASE_URL;
  const bookingData = generateBookingData();

  const response = await request.post(`${baseUrl}${endpoints.booking}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data: bookingData,
  });

  expect(response.status()).toBe(200);

  const responseBody = createBookingResponseSchema.parse(await response.json());
  expect(responseBody.bookingid).toBeTruthy();
  expect(responseBody.booking).toEqual(bookingData);
});
