import { faker } from '@faker-js/faker';
import type { Booking } from '../schemas/booking.schema';

export function generateBookingData(): Booking {
  const checkin = faker.date.soon({ days: 30 });
  const checkout = faker.date.soon({ days: 7, refDate: checkin });

  return {
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    totalprice: faker.number.int({ min: 100, max: 500 }),
    depositpaid: faker.datatype.boolean(),
    bookingdates: {
      checkin: checkin.toISOString().slice(0, 10),
      checkout: checkout.toISOString().slice(0, 10),
    },
    additionalneeds: faker.helpers.arrayElement(['Breakfast', 'Lunch', 'Dinner']),
  };
}
