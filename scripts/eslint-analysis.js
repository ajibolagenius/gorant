#!/usr/bin/env node

/**
 * ESLint Analysis Script
 *
 * This script runs ESLint on the project and generates a comprehensive report
 * of all ESLint issues, categorized by type and severity.
 *
 * Usage:
 * node scripts/eslint-analysis.js
 *
 * Output:
 * - Console output with summary statistics
 * - JSON file with detailed issue data (eslint-report.json)
 * - Markdown report with categorized issues (eslint-report.md)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const outputJsonPath = path.join(process.cwd(), 'eslint-report.json');
const outputMarkdownPath = path.join(process.cwd(), 'eslint-report.md');
const eslintCommand = 'npx eslint --format json';
const targetDirs = ['app', 'components', 'hooks', 'lib', 'services', 'types'];

// Run ESLint and capture the output
console.log('Running ESLint analysis...');
try {
    const eslintOutput = execSync(`${eslintCommand} ${targetDirs.join(' ')}`, { encoding: 'utf8' });
    const eslintData = JSON.parse(eslintOutput);

    // Write raw JSON output
    fs.writeFileSync(outputJsonPath, JSON.stringify(eslintData, null, 2));
    console.log(`Raw ESLint data written to ${outputJsonPath}`);

    // Process and categorize the issues
    const issues = processEslintData(eslintData);

    // Generate markdown report
    const markdownReport = generateMarkdownReport(issues);
    fs.writeFileSync(outputMarkdownPath, markdownReport);
    console.log(`Markdown report written to ${outputMarkdownPath}`);

    // Print summary to console
    printSummary(issues);

} catch (error) {
    console.error('Error running ESLint:', error.message);
    process.exit(1);
}

/**
 * Process ESLint data and categorize issues
 */
function processEslintData(eslintData) {
    const issues = {
        typeIssues: [],
        unusedVars: [],
        reactHooks: [],
        htmlEscape: [],
        importStyle: [],
        parsingErrors: [],
        other: []
    };

    let totalErrors = 0;
    let totalWarnings = 0;

    eslintData.forEach(fileResult => {
        const filePath = fileResult.filePath.replace(process.cwd(), '');

        fileResult.messages.forEach(message => {
            const issue = {
                filePath,
                line: message.line,
                column: message.column,
                ruleId: message.ruleId,
                message: message.message,
                severity: message.severity === 2 ? 'error' : 'warning'
            };

            if (message.severity === 2) totalErrors++;
            else totalWarnings++;

            // Categorize by rule ID
            if (message.ruleId === '@typescript-eslint/no-explicit-any') {
                issues.typeIssues.push(issue);
            } else if (message.ruleId === '@typescript-eslint/no-unused-vars') {
                issues.unusedVars.push(issue);
            } else if (message.ruleId && message.ruleId.startsWith('react-hooks/')) {
                issues.reactHooks.push(issue);
            } else if (message.ruleId === 'react/no-unescaped-entities') {
                issues.htmlEscape.push(issue);
            } else if (message.ruleId === '@typescript-eslint/no-require-imports') {
                issues.importStyle.push(issue);
            } else if (message.message.includes('Parsing error')) {
                issues.parsingErrors.push(issue);
            } else {
                issues.other.push(issue);
            }
        });
    });

    issues.totalErrors = totalErrors;
    issues.totalWarnings = totalWarnings;
    issues.totalIssues = totalErrors + totalWarnings;

    return issues;
}

/**
 * Generate a markdown report from the processed issues
 */
function generateMarkdownReport(issues) {
    let markdown = '# ESLint Analysis Report\n\n';

    markdown += `## Summary\n\n`;
    markdown += `- **Total Issues:** ${issues.totalIssues}\n`;
    markdown += `- **Errors:** ${issues.totalErrors}\n`;
    markdown += `- **Warnings:** ${issues.totalWarnings}\n\n`;

    markdown += `## Issues by Category\n\n`;
    markdown += `- TypeScript Type Issues: ${issues.typeIssues.length}\n`;
    markdown += `- Unused Variables: ${issues.unusedVars.length}\n`;
    markdown += `- React Hook Rule Violations: ${issues.reactHooks.length}\n`;
    markdown += `- HTML Escape Issues: ${issues.htmlEscape.length}\n`;
    markdown += `- Import Style Violations: ${issues.importStyle.length}\n`;
    markdown += `- Parsing Errors: ${issues.parsingErrors.length}\n`;
    markdown += `- Other Issues: ${issues.other.length}\n\n`;

    // Add detailed sections for each category
    markdown += generateCategorySection('TypeScript Type Issues', issues.typeIssues);
    markdown += generateCategorySection('Unused Variables', issues.unusedVars);
    markdown += generateCategorySection('React Hook Rule Violations', issues.reactHooks);
    markdown += generateCategorySection('HTML Escape Issues', issues.htmlEscape);
    markdown += generateCategorySection('Import Style Violations', issues.importStyle);
    markdown += generateCategorySection('Parsing Errors', issues.parsingErrors);
    markdown += generateCategorySection('Other Issues', issues.other);

    return markdown;
}

/**
 * Generate a markdown section for a category of issues
 */
function generateCategorySection(title, issues) {
    if (issues.length === 0) return '';

    let markdown = `## ${title}\n\n`;

    // Group issues by file
    const issuesByFile = {};
    issues.forEach(issue => {
        if (!issuesByFile[issue.filePath]) {
            issuesByFile[issue.filePath] = [];
        }
        issuesByFile[issue.filePath].push(issue);
    });

    // Generate markdown for each file
    Object.keys(issuesByFile).sort().forEach(filePath => {
        markdown += `### ${filePath}\n\n`;
        markdown += '| Line | Rule | Message | Severity |\n';
        markdown += '|------|------|---------|----------|\n';

        issuesByFile[filePath].forEach(issue => {
            markdown += `| ${issue.line} | ${issue.ruleId || 'N/A'} | ${issue.message.replace(/\|/g, '\\|')} | ${issue.severity} |\n`;
        });

        markdown += '\n';
    });

    return markdown;
}

/**
 * Print a summary of the issues to the console
 */
function printSummary(issues) {
    console.log('\n=== ESLint Analysis Summary ===');
    console.log(`Total Issues: ${issues.totalIssues} (${issues.totalErrors} errors, ${issues.totalWarnings} warnings)`);
    console.log('\nIssues by Category:');
    console.log(`- TypeScript Type Issues: ${issues.typeIssues.length}`);
    console.log(`- Unused Variables: ${issues.unusedVars.length}`);
    console.log(`- React Hook Rule Violations: ${issues.reactHooks.length}`);
    console.log(`- HTML Escape Issues: ${issues.htmlEscape.length}`);
    console.log(`- Import Style Violations: ${issues.importStyle.length}`);
    console.log(`- Parsing Errors: ${issues.parsingErrors.length}`);
    console.log(`- Other Issues: ${issues.other.length}`);
    console.log('\nDetailed reports have been generated:');
    console.log(`- JSON: ${outputJsonPath}`);
    console.log(`- Markdown: ${outputMarkdownPath}`);
}
