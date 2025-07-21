# ESLint JSX Style Rules

This document explains the ESLint rules that have been added to catch JSX style syntax errors, specifically to prevent the deployment error that occurred in the og-templates.ts file.

## Rules Added

1. `react/jsx-curly-spacing`: Enforces consistent spacing inside JSX curly braces.
   - Configuration: `["error", { "when": "never", "attributes": { "allowMultiline": true }, "children": true }]`
   - This rule ensures there is no space between the curly braces and their content in JSX attributes.
   - Example of correct usage: `<div style={{ color: 'red' }}>`
   - Example of incorrect usage: `<div style={ { color: 'red' } }>`

2. `react/jsx-equals-spacing`: Enforces no spaces around the equals sign in JSX attributes.
   - Configuration: `["error", "never"]`
   - This rule ensures there are no spaces around the equals sign in JSX attributes.
   - Example of correct usage: `<div className="example">`
   - Example of incorrect usage: `<div className = "example">` or `<div style= {{...}}`

3. `react/jsx-tag-spacing`: Enforces consistent spacing in JSX tags.
   - Configuration: `["error", { "closingSlash": "never", "beforeSelfClosing": "always", "afterOpening": "never", "beforeClosing": "never" }]`
   - This rule ensures consistent spacing in JSX tags.
   - Example of correct usage: `<div />` (with a space before the self-closing slash)

4. `react/jsx-curly-brace-presence`: Enforces curly braces or disallows unnecessary curly braces in JSX props and children.
   - Configuration: `["error", { "props": "never", "children": "never" }]`
   - This rule prevents unnecessary curly braces in JSX props and children.
   - Example of correct usage: `<div title="example">` instead of `<div title={"example"}>`

## Implementation Details

### ESLint Configuration
The rules have been added to `.eslintrc.json` with the following configuration:
- Extended `plugin:react/recommended` for React-specific rules
- Added `eslint-plugin-react` as a plugin
- Configured parser options to support JSX
- Added overrides for TypeScript and JavaScript files

### Scripts and Automation
1. **npm script**: `npm run lint:jsx-styles` - Runs ESLint specifically on JSX/TSX files
2. **Shell script**: `scripts/lint-jsx-styles.sh` - Automated linting with error reporting
3. **Pre-commit hook**: `.husky/pre-commit` - Prevents commits with JSX style errors

## How to Use

1. Run the linter to check for JSX style syntax errors:
   ```bash
   npm run lint:jsx-styles
   ```

2. The linter will automatically fix most issues when possible using the `--fix` flag.

3. For syntax errors (like the one in og-templates.ts), manual fixes are required.

## Verification

The implementation has been tested and verified to:
- ✅ Detect the specific syntax error in `lib/seo/og-templates.ts` (space after equals sign)
- ✅ Automatically fix correctable JSX style issues
- ✅ Provide clear error messages for manual fixes
- ✅ Integrate with the existing Next.js ESLint configuration

## Common Issues Caught

The most common issues these rules catch are:

1. **Spaces between equals sign and opening curly brace** (the main deployment error):
   - ❌ Incorrect: `style= {{`
   - ✅ Correct: `style={{`

2. **Spaces around the equals sign**:
   - ❌ Incorrect: `style = {{`
   - ✅ Correct: `style={{`

3. **Spaces between the opening curly braces**:
   - ❌ Incorrect: `style={ {`
   - ✅ Correct: `style={{`

4. **Inconsistent tag spacing**:
   - ❌ Incorrect: `<div/>`
   - ✅ Correct: `<div />`

These rules help maintain consistent code style and prevent syntax errors that could cause build failures, specifically addressing the deployment error requirements outlined in the specification.
