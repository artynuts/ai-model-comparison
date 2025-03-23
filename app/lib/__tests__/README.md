# Testing Strategy for Lib Modules

This directory contains tests for the utility and library files used in the AI Model Comparison app.

## Testing Approach

We follow these principles for testing lib modules:

1. **Unit testing**: Each utility function and class is tested in isolation
2. **Mocking external dependencies**: External dependencies (like fetch API) are mocked to avoid actual network calls
3. **Test behavior, not implementation**: Tests focus on the expected behavior rather than implementation details

## Current Test Coverage

- **API module (`api.test.ts`)**: Tests for the `compareModels` function that sends queries to multiple AI models
- **Storage providers**: Tests for the PostgreSQL storage provider implementation
- **Utils**: Tests for utility functions like `getStorageDisplayName`

## Running Tests

Run all lib tests:

```bash
npm test -- app/lib
```

Run specific test files:

```bash
npm test -- app/lib/utils
npm test -- app/lib/storage
npm test -- app/lib/__tests__/api.test.ts
```

## Test Structure

Each test file follows this structure:

1. Import the module under test
2. Mock any external dependencies
3. Describe test suites and individual test cases
4. Verify expected behavior

## Adding New Tests

When adding new utility functions or libraries, create corresponding test files following these guidelines:

1. Place tests in the appropriate `__tests__` directory
2. Name test files with the `.test.ts` or `.test.tsx` extension
3. Mock external dependencies to ensure isolated testing
4. Test both successful and error scenarios
