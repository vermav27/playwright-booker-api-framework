import { test, expect } from '@playwright/test';
import { endpoints } from '../config/endpoints';
import { bookingSchema, createBookingResponseSchema } from '../schemas/booking.schema';
import { bookingData } from '../test-data/booking.data';
import { getAuthToken } from '../utils/tokenManager';

test('update a booking', async ({ request }) => {
  const baseUrl = process.env.BASE_URL;

  const createResponse = await request.post(`${baseUrl}${endpoints.booking}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data: bookingData,
  });
  expect(createResponse.status()).toBe(200);
  const createdBooking = createBookingResponseSchema.parse(await createResponse.json());

  const token = await getAuthToken(request);

  const updateResponse = await request.patch(
    `${baseUrl}${endpoints.bookingById(createdBooking.bookingid)}`,
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Cookie: `token=${token}`,
      },
      data: { firstname: 'James' },
    },
  );

  expect(updateResponse.status()).toBe(200);

  const updatedBooking = bookingSchema.parse(await updateResponse.json());
  expect(updatedBooking.firstname).toBe('James');
  expect(updatedBooking.lastname).toBe('Brown');
});
