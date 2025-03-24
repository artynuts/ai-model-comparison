# End-to-End Tests

This directory contains end-to-end tests for the AI Model Comparison application using Playwright.

## Setup

The project has been configured with Playwright. To run the tests, make sure you have installed all the dependencies with:

```bash
npm install
```

The first time you run tests, Playwright will automatically install the necessary browser binaries.

## Running Tests

You can run the end-to-end tests with the following commands:

### Run all tests

```bash
npm run test:e2e
```

### Run tests with UI mode

```bash
npm run test:e2e:ui
```

### Run tests in debug mode

```bash
npm run test:e2e:debug
```

### Run a specific test file

```bash
npx playwright test e2e/homepage.spec.ts
```

## Test Structure

The e2e tests are organized as follows:

- `homepage.spec.ts` - Tests for the main homepage and form interactions
- `form-submission.spec.ts` - Tests for submitting queries and handling responses
- `rating.spec.ts` - Tests for rating functionality on model responses
- `navigation.spec.ts` - Tests for navigation between different pages

## CI Integration

The Playwright configuration (`playwright.config.ts`) in the root directory includes settings for CI environments. The tests are configured to:

- Run in parallel by default
- Retry tests in CI environments
- Capture traces on first retry
- Take screenshots on test failures
- Run against multiple browsers (Chromium, Firefox, and WebKit)

## Mocking

The tests use Playwright's network intercepting capabilities to mock API responses. This allows testing the UI behavior without depending on the actual API services.
