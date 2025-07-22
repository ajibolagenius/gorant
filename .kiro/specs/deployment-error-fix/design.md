# Design Document

## Overview

This design document outlines the approach to fix the deployment error in the Rant platform caused by a syntax error in the `lib/seo/og-templates.ts` file. The error is specifically related to improper JSX syntax in the inline styles of the DefaultTemplate component and potentially other templates.

## Architecture

The issue is isolated to the Open Graph image templates used for generating social media preview images. These templates are React components that use inline styles with JSX syntax. The current implementation has syntax errors that prevent successful building and deployment of the application.

## Components and Interfaces

### Affected Components

1. **OG Templates (`lib/seo/og-templates.ts`)**
   - DefaultTemplate
   - RantTemplate
   - ChallengeTemplate

These components are React functional components that generate Open Graph images using Next.js's ImageResponse API.

### Current Issues

After examining the code, the following syntax issues were identified:

1. In the DefaultTemplate component, there's an incorrect spacing in the style attribute: `style= {{` instead of `style={{`
2. Similar spacing issues exist in other templates
3. Inconsistent spacing in JSX elements and closing tags
4. Inconsistent spacing in style objects

## Error Analysis

The specific error from the deployment log is:
```
Expected '>', got 'style'
./lib/seo/og-templates.ts:30:1
```

This indicates that the JSX parser is expecting a closing angle bracket (`>`) but instead encountered the `style` attribute with incorrect syntax. The issue is in the spacing between `style=` and the opening curly braces `{{`.

## Solution Design

### 1. Fix Syntax Errors

The primary solution is to correct the syntax errors in the OG templates:

1. Fix the spacing in style attributes from `style= {{` to `style={{`
2. Ensure consistent spacing in all JSX elements
3. Standardize the format of inline styles across all templates

### 2. Implement Consistent Style Pattern

To prevent future errors, we'll establish a consistent pattern for inline styles in JSX:

```typescript
// Correct pattern
<div
  style={{
    property1: 'value1',
    property2: 'value2'
  }}
>
```

### 3. Code Quality Improvements

Additional improvements to enhance code quality and prevent future errors:

1. Consistent indentation throughout the file
2. Proper spacing in JSX expressions
3. Consistent formatting of multi-line JSX elements

## Testing Strategy

1. **Static Analysis**
   - Run ESLint to catch syntax errors before deployment
   - Use TypeScript compiler to verify syntax correctness

2. **Build Verification**
   - Run a local build to verify the fix resolves the compilation error
   - Verify that the OG image generation still works as expected

3. **Integration Testing**
   - Test the OG image generation with various content types
   - Verify that the templates render correctly with different data inputs

## Error Handling

No specific error handling changes are required as this is a syntax fix. The existing error handling in the OG image generation process will continue to function as before.

## Implementation Considerations

1. **Minimal Changes**
   - Focus only on fixing the syntax errors without changing functionality
   - Maintain the existing component structure and logic

2. **Code Style Consistency**
   - Ensure all JSX style attributes follow the same pattern
   - Apply consistent formatting throughout the file

3. **Future Prevention**
   - Consider adding a pre-commit hook to validate JSX syntax
   - Document the correct style pattern for future development
