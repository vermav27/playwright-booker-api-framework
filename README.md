# Playwright Booker API Framework

A minimal Playwright and TypeScript API test framework for [Restful Booker](https://restful-booker.herokuapp.com/).

Requires Node.js 20.19 or newer.

## Setup

```bash
npm install
npm test
```

No browser installation is needed because the tests use Playwright's API request fixture.

## Environment

The `.env` file contains the API URL and the public Restful Booker demo credentials:

```dotenv
BASE_URL=https://restful-booker.herokuapp.com
AUTH_USERNAME=admin
AUTH_PASSWORD=password123
```

## Commands

```bash
npm test            # Run all tests
npm run test:create # Run the create test
npm run test:update # Run the update test
npm run typecheck   # Check TypeScript
```

Test runs generate a custom HTML report at `custom-report/index.html`.

## Structure

```text
config/
  endpoints.ts
schemas/
  booking.schema.ts
test-data/
  booking.data.ts
tests/
  booking.create.spec.ts
  booking.patch.spec.ts
utils/
  dataGenerator.ts
  tokenManager.ts
playwright.config.ts
```
