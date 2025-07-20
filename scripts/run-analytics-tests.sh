#!/bin/bash

# Run all analytics tests
echo "Running Analytics Test Suite..."

# Run unit tests for analytics service
echo "Running analytics service tests..."
npx vitest run lib/__tests__/self-analytics.test.ts --run

# Run unit tests for analytics validation
echo "Running analytics validation tests..."
npx vitest run lib/__tests__/analytics-validation.test.ts --run

# Run unit tests for analytics privacy
echo "Running analytics privacy tests..."
npx vitest run lib/__tests__/analytics-privacy.test.ts --run

# Run unit tests for analytics performance
echo "Running analytics performance tests..."
npx vitest run lib/__tests__/analytics-performance.test.ts --run

# Run performance load tests
echo "Running analytics performance load tests..."
npx vitest run lib/__tests__/analytics-performance-load.test.ts --run

# Run unit tests for analytics hooks
echo "Running analytics hooks tests..."
npx vitest run hooks/__tests__/use-analytics.test.ts --run

# Run API endpoint tests
echo "Running analytics API tests..."
npx vitest run app/api/analytics/__tests__/route.test.ts --run

echo "All analytics tests completed!"
