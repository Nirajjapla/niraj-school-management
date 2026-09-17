#!/usr/bin/env node

import * as esbuild from 'esbuild';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const outDir = path.resolve(projectRoot, '.test-dist');

// Parse CLI args
const args = process.argv.slice(2);
let tierFilter = null;
let nameFilter = null;
let testPattern = null;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg.startsWith('--tier=')) {
    tierFilter = arg.split('=')[1];
  } else if (arg === '-t' && i + 1 < args.length) {
    tierFilter = args[++i];
  } else if (arg.startsWith('--grep=')) {
    nameFilter = arg.split('=')[1];
  } else if (arg === '-g' && i + 1 < args.length) {
    nameFilter = args[++i];
  } else if (arg.startsWith('--test-name-pattern=')) {
    testPattern = arg.split('=')[1];
  } else if (arg === '--help' || arg === '-h') {
    console.log(`
School ERP E2E Test Runner
Usage:
  node test/runner.mjs [options]
  npm test [-- [options]]

Options:
  --tier=<1|2|3|4>, -t <1|2|3|4>   Run only tests for specified tier
  --grep=<pattern>, -g <pattern>   Filter test files by filename pattern
  --test-name-pattern=<pattern>    Filter individual test cases by name
  --help, -h                       Show this help message
`);
    process.exit(0);
  } else if (!arg.startsWith('-')) {
    // Treat as tier or pattern
    if (/^[1-4]$/.test(arg)) {
      tierFilter = arg;
    } else {
      nameFilter = arg;
    }
  }
}

// Find test files
function findFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(findFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.test.ts')) {
      results.push(fullPath);
    }
  }
  return results;
}

const testRoot = path.resolve(projectRoot, 'test');
let allTestFiles = findFiles(testRoot);

if (tierFilter) {
  const tierFolderMap = {
    '1': 'tier1-feature-coverage',
    '2': 'tier2-boundary-corner',
    '3': 'tier3-cross-feature',
    '4': 'tier4-real-world'
  };
  const targetFolder = tierFolderMap[tierFilter];
  if (!targetFolder) {
    console.error(`Invalid tier: ${tierFilter}. Must be 1, 2, 3, or 4.`);
    process.exit(1);
  }
  allTestFiles = allTestFiles.filter(f => f.includes(targetFolder));
}

if (nameFilter) {
  allTestFiles = allTestFiles.filter(f => path.basename(f).includes(nameFilter));
}

if (allTestFiles.length === 0) {
  console.log('No test files found matching criteria.');
  process.exit(0);
}

// Ensure output dir is clean
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

console.log(`\x1b[36m[Test Runner]\x1b[0m Discovered ${allTestFiles.length} test suites:`);
allTestFiles.forEach(f => console.log(`  - ${path.relative(projectRoot, f)}`));

// Bundle each test file
try {
  await esbuild.build({
    entryPoints: allTestFiles,
    outdir: outDir,
    bundle: true,
    platform: 'node',
    format: 'esm',
    packages: 'external',
    target: 'node22',
    sourcemap: 'inline',
    outbase: testRoot
  });
} catch (err) {
  console.error('\x1b[31m[Test Runner] ESBuild bundling failed:\x1b[0m', err);
  process.exit(1);
}

// Find all generated test files in outDir
function findBundledFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(findBundledFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      results.push(fullPath);
    }
  }
  return results;
}

const bundledFiles = findBundledFiles(outDir);
console.log(`\x1b[32m[Test Runner]\x1b[0m Successfully bundled ${bundledFiles.length} suites into .test-dist/`);
console.log(`\x1b[36m[Test Runner]\x1b[0m Executing Node.js test runner...\n`);

const nodeTestArgs = ['--test'];
if (testPattern) {
  nodeTestArgs.push(`--test-name-pattern=${testPattern}`);
}
nodeTestArgs.push(...bundledFiles);

const child = spawn(process.execPath, nodeTestArgs, {
  stdio: 'inherit',
  cwd: projectRoot,
  env: { ...process.env, NODE_ENV: 'test' }
});

child.on('close', (code) => {
  process.exit(code || 0);
});
