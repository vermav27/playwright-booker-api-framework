# Playwright Booker API Framework

A lightweight API testing framework built with Playwright, TypeScript, Faker, Zod, and ESLint. It tests the public [Restful Booker API](https://restful-booker.herokuapp.com/) without launching a browser.

## Tech Stack and Libraries

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime used to execute the framework. |
| TypeScript | Adds static typing to tests, utilities, and configuration. |
| Playwright Test | Runs API tests and provides the `request` fixture and assertions. |
| Faker | Generates dynamic booking names, prices, dates, and other test data. |
| Zod | Validates API response structures and provides inferred TypeScript types. |
| dotenv | Loads `BASE_URL` and authentication credentials from `.env`. |
| ESLint | Checks TypeScript code for common mistakes and unsafe patterns. |
| Custom HTML Reporter | Produces console results and HTML reports after test execution. |
| npm | Installs dependencies and runs framework commands. |

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

3. Verify the complete framework:

   ```bash
   npm run check
   ```

`npm run check` runs ESLint, TypeScript validation, and all API tests. The project uses Playwright's API request fixture, so Playwright browsers do not need to be installed.

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
├── eslint.config.js              ESLint flat configuration
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
| `eslint.config.js` | Applies the recommended JavaScript and TypeScript lint rules. |

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

## Framework Commands

| Command | Purpose |
|---|---|
| `npm test` | Run all API tests. |
| `npm run test:create` | Run only the create-booking test. |
| `npm run test:update` | Run only the update-booking test. |
| `npm run typecheck` | Check the TypeScript code without running tests. |
| `npm run lint` | Run ESLint across the framework. |
| `npm run check` | Run linting, type checking, and all tests before pushing code. |

You can also run an individual test by title:

```bash
npx playwright test -g "create a booking"
```

## Code Quality

ESLint uses the flat configuration in `eslint.config.js`. It checks the framework source while ignoring generated content in `node_modules/`, `custom-report/`, and `test-results/`.

Run linting by itself with:

```bash
npm run lint
```

The complete quality gate is:

```text
ESLint → TypeScript check → Playwright tests → Custom HTML report
```

## Before Pushing to GitHub

Always run the complete verification command:

```bash
npm run check
```

This command runs:

```text
npm run lint
npm run typecheck
npm test
```

The command stops if any step fails. Push the code only after the complete check passes.

## Optional Local Jenkins Service

Jenkins is not required to run the framework locally. If `jenkins-lts` is installed with Homebrew on macOS, it can be managed on port `8080` with these commands:

Start Jenkins:

```bash
brew services start jenkins-lts
```

Open Jenkins:

```text
http://localhost:8080
```

Stop Jenkins and release port `8080`:

```bash
brew services stop jenkins-lts
```

Check whether anything is still listening on the port:

```bash
lsof -nP -iTCP:8080 -sTCP:LISTEN
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
