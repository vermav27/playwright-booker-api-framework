# Playwright Booker API Framework

A lightweight API testing framework built with Playwright, TypeScript, Faker, and Zod. It tests the public [Restful Booker API](https://restful-booker.herokuapp.com/) without launching a browser.

## Requirements

- Node.js 20.19 or newer
- npm
- Internet access to the Restful Booker API

## Quick Start

1. Install the dependencies:

   ```bash
   npm install
   ```

2. Create `.env` from the example file if it does not already exist:

   ```bash
   cp .env.example .env
   ```

3. Run all tests:

   ```bash
   npm test
   ```

The project uses Playwright's API request fixture, so Playwright browsers do not need to be installed.

## Environment Variables

The tests read the base URL and authentication credentials directly from `.env`:

```dotenv
BASE_URL=https://restful-booker.herokuapp.com
AUTH_USERNAME=admin
AUTH_PASSWORD=password123
```

The included username and password are public demo credentials for Restful Booker. Use secure environment variables for real projects.

## Architecture

```text
playwright-booker-api-framework/
├── config/
│   └── endpoints.ts              API endpoint paths
├── schemas/
│   └── booking.schema.ts         Zod response schemas and Booking type
├── test-data/
│   └── booking.data.ts           Reusable static booking payload
├── tests/
│   ├── booking.create.spec.ts    Create-booking test with Faker data
│   └── booking.patch.spec.ts     Authenticated update-booking test
├── utils/
│   ├── CustomReporter.ts         Custom console and HTML reporter
│   ├── dataGenerator.ts          Faker booking-data generator
│   └── tokenManager.ts           Authentication token request
├── .env.example                  Environment variable template
├── playwright.config.ts          Playwright and reporter configuration
├── tsconfig.json                 TypeScript configuration
└── package.json                  Dependencies and test commands
```

### Request Flow

```text
.env
  │
  ├── BASE_URL ───────────────┐
  └── credentials ──> tokenManager.ts
                              │
test ──> endpoint + headers + payload ──> Restful Booker API
  │                                           │
  └── Zod schema <──── JSON response ─────────┘
          │
          └── assertions ──> CustomReporter.ts ──> custom-report/index.html
```

Each layer has one responsibility:

| Layer | Responsibility |
|---|---|
| `config` | Stores reusable endpoint paths such as `/booking` and `/auth`. |
| `schemas` | Validates API responses and provides TypeScript types. |
| `test-data` | Stores fixed payloads used by repeatable tests. |
| `utils/dataGenerator.ts` | Creates dynamic booking payloads with Faker. |
| `utils/tokenManager.ts` | Reads credentials from `.env`, requests a token, and returns it. |
| `tests` | Builds URLs, adds headers, sends requests, and performs assertions. |
| `CustomReporter.ts` | Prints execution results and generates the HTML report. |

## How Tests Work

### Create Booking

`booking.create.spec.ts`:

1. Reads `BASE_URL` from `.env`.
2. Creates a booking payload with Faker.
3. Adds `Accept` and `Content-Type` headers manually.
4. Sends `POST /booking`.
5. Validates the response with `createBookingResponseSchema`.
6. Checks the booking ID and returned booking data.

### Update Booking

`booking.patch.spec.ts`:

1. Creates a booking using the static payload.
2. Calls `getAuthToken()` with credentials from `.env`.
3. Adds the token as a `Cookie` header.
4. Sends `PATCH /booking/{id}`.
5. Validates the response and updated values.

## Writing Requests

Build the complete URL manually from `BASE_URL` and an endpoint:

```ts
const baseUrl = process.env.BASE_URL;

const response = await request.post(`${baseUrl}${endpoints.booking}`, {
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  data: bookingData,
});
```

For authenticated requests, add the token cookie:

```ts
headers: {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  Cookie: `token=${token}`,
}
```

## Response Validation

Zod validates the JSON response before assertions are executed:

```ts
const responseBody = createBookingResponseSchema.parse(
  await response.json(),
);
```

If the response shape or field types do not match the schema, the test fails with a validation error.

## Test Commands

| Command | Purpose |
|---|---|
| `npm test` | Run all API tests. |
| `npm run test:create` | Run only the create-booking test. |
| `npm run test:update` | Run only the update-booking test. |
| `npm run typecheck` | Check the TypeScript code without running tests. |

You can also run an individual test by title:

```bash
npx playwright test -g "create a booking"
```

## Custom Report

`playwright.config.ts` registers `utils/CustomReporter.ts` as the active reporter. Every test run creates:

- `custom-report/index.html` as the latest report
- `custom-report/report_<timestamp>.html` as a timestamped report
- Supporting screenshots, videos, and traces when the test produces them

On macOS, open the latest report with:

```bash
open custom-report/index.html
```

The `custom-report/` directory is generated at runtime and ignored by Git.

## Adding Another API Test

1. Add the endpoint to `config/endpoints.ts`.
2. Add or reuse a Zod schema in `schemas/`.
3. Add static data in `test-data/` or generated data in `utils/dataGenerator.ts`.
4. Create a `*.spec.ts` file under `tests/`.
5. Read `BASE_URL`, add headers manually, send the request, validate the response, and assert the expected behavior.
