#!/bin/bash

# This script runs ESLint on all JSX/TSX files to catch style syntax errors
# Particularly focusing on JSX style attribute spacing issues

echo "Checking for JSX style syntax errors..."
npx eslint "**/*.{jsx,tsx}" --fix

# Check if ESLint found any errors
if [ $? -eq 0 ]; then
  echo "✅ No JSX style syntax errors found!"
else
  echo "❌ JSX style syntax errors found. Please fix them and try again."
  exit 1
fi
