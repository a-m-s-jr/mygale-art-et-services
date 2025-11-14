#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

// =============================================================================
// CONFIGURATION
// =============================================================================

// Command-line arguments
const ROOT_DIR = process.argv[2] || process.cwd()
const OUTPUT_FILE = process.argv[3] || 'project-structure.txt'
const MAX_DEPTH = process.argv[4] ? parseInt(process.argv[4]) : Infinity

// Directories to exclude completely (won't show at all)
const EXCLUDE_DIRS = ['.git', '.vscode', '.idea']

// Directories to show but not expand (collapsed)
const COLLAPSE_DIRS = [
  'node_modules',
  '.next',
  'dist',
  'build',
  '.turbo',
  'coverage',
  '.cache',
  'tmp',
  'temp',
  'docker',
]

// Files to exclude
const EXCLUDE_FILES = ['.DS_Store', 'Thumbs.db', '.gitkeep']

// Optional: Show file sizes
const SHOW_FILE_SIZES = false

// Optional: Show file counts
const SHOW_FILE_COUNTS = true

// Optional: Add descriptions for common files/folders
const ADD_DESCRIPTIONS = true

const DESCRIPTIONS = {
  // Root level files
  'package.json': 'Package configuration and dependencies',
  'tsconfig.json': 'TypeScript configuration',
  'turbo.json': 'Turborepo configuration for monorepo build system',
  'docker-compose.yml': 'Defines and runs multi-container Docker applications',
  'eslint.config.js': 'ESLint configuration for code quality',
  'commitlint.config.js': 'Configuration for linting commit messages',
  'pnpm-workspace.yaml': 'Defines the project as a pnpm monorepo workspace',
  '.prettierrc': 'Prettier configuration for code formatting',
  '.env': 'Environment variables (not tracked in git)',
  '.gitignore': 'Git ignore patterns',
  'README.md': 'Project documentation',

  // Directories
  src: 'Source code directory',
  apps: 'Directory for independent applications',
  packages: 'Directory for shared packages/libraries',
  public: 'Static assets',
  api: 'Backend application (NestJS)',
  web: 'Frontend application (Next.js)',
  prisma: 'Shared Prisma/database package',
  migrations: 'Database migrations',
  node_modules: 'Dependencies (collapsed)',
  '.next': 'Next.js build output (collapsed)',
  dist: 'Build output (collapsed)',
  build: 'Build output (collapsed)',
  postgres: 'PostgreSQL data directory (collapsed)',
  data: 'Data directory (collapsed)',
  '.husky': 'Git hooks configuration',
  '.github': 'GitHub configuration',
  test: 'Test files',
  config: 'Shared configuration files',
  ui: 'Shared UI components package',

  // Common files
  'schema.prisma': 'Prisma database schema',
  'next.config.js': 'Next.js configuration',
  'nest-cli.json': 'NestJS CLI configuration',
  'jest.config.js': 'Jest testing configuration',
  'main.ts': 'Application entry point',
  'app.module.ts': 'Root application module',
  'layout.tsx': 'Root layout component',
  'page.tsx': 'Page component',
  'globals.css': 'Global styles',
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function shouldExclude(name, isDirectory) {
  if (isDirectory) {
    return EXCLUDE_DIRS.includes(name)
  }
  return EXCLUDE_FILES.includes(name)
}

function shouldCollapse(name) {
  return COLLAPSE_DIRS.includes(name)
}

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath)
    const bytes = stats.size
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  } catch {
    return ''
  }
}

function getDescription(name) {
  if (!ADD_DESCRIPTIONS) return ''
  const desc = DESCRIPTIONS[name]
  return desc ? ` ← ${desc}` : ''
}

function countFiles(dirPath, depth = 0) {
  if (depth > MAX_DEPTH) return 0

  let count = 0
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })

    for (const entry of entries) {
      if (shouldExclude(entry.name, entry.isDirectory())) continue

      if (entry.isDirectory()) {
        count += countFiles(path.join(dirPath, entry.name), depth + 1)
      } else {
        count++
      }
    }
  } catch (error) {
    console.error('\n❌ Error counting files::', error.message)
  }

  return count
}

function generateTree(dirPath, prefix = '', depth = 0) {
  if (depth > MAX_DEPTH) return ''

  let output = ''
  const dirName = path.basename(dirPath)

  // Root directory
  if (depth === 0) {
    output += `${dirName}/\n`
  }

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })

    // Filter and sort entries
    const filteredEntries = entries.filter(
      (entry) => !shouldExclude(entry.name, entry.isDirectory()),
    )

    // Sort: directories first, then files, alphabetically
    filteredEntries.sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1
      if (!a.isDirectory() && b.isDirectory()) return 1
      return a.name.localeCompare(b.name)
    })

    filteredEntries.forEach((entry, index) => {
      const isLastEntry = index === filteredEntries.length - 1
      const fullPath = path.join(dirPath, entry.name)

      // Build the tree characters
      const connector = isLastEntry ? '└── ' : '├── '
      const extension = isLastEntry ? '    ' : '│   '

      if (entry.isDirectory()) {
        const shouldCollapseDir = shouldCollapse(entry.name)
        const fileCount =
          SHOW_FILE_COUNTS && !shouldCollapseDir ? countFiles(fullPath, depth + 1) : 0
        const countStr = SHOW_FILE_COUNTS && fileCount > 0 ? ` (${fileCount} files)` : ''
        const collapsedIndicator = shouldCollapseDir ? ' [collapsed]' : ''
        const desc = getDescription(entry.name, true)

        output += `${prefix}${connector}${entry.name}/${countStr}${collapsedIndicator}${desc}\n`

        // Recursively process subdirectory only if not collapsed
        if (!shouldCollapseDir && depth + 1 <= MAX_DEPTH) {
          output += generateTree(fullPath, prefix + extension, depth + 1, isLastEntry)
        }
      } else {
        const size = SHOW_FILE_SIZES ? ` [${getFileSize(fullPath)}]` : ''
        const desc = getDescription(entry.name, false)
        output += `${prefix}${connector}${entry.name}${size}${desc}\n`
      }
    })
  } catch (error) {
    output += `${prefix}[Error reading directory: ${error.message}]\n`
  }

  return output
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

function generateProjectStructure() {
  console.log('\n🌲 Generating project directory structure...\n')
  console.log(`📁 Root directory: ${ROOT_DIR}`)
  console.log(`📄 Output file: ${OUTPUT_FILE}`)
  console.log(`📏 Max depth: ${MAX_DEPTH === Infinity ? 'Unlimited' : MAX_DEPTH}`)
  console.log(`\n${'─'.repeat(80)}\n`)

  // Validate root directory
  if (!fs.existsSync(ROOT_DIR)) {
    console.error(`❌ Error: Root directory does not exist: ${ROOT_DIR}`)
    process.exit(1)
  }

  const startTime = Date.now()

  // Generate the tree
  console.log('🔄 Scanning directory structure...\n')
  const tree = generateTree(ROOT_DIR)

  // Create header
  const header = `${'='.repeat(80)}
PROJECT DIRECTORY STRUCTURE
Generated: ${new Date().toISOString()}
Root: ${ROOT_DIR}
${'='.repeat(80)}

`

  // Write to file
  const output = header + tree
  fs.writeFileSync(OUTPUT_FILE, output)

  // Also display in console
  console.log(tree)

  const endTime = Date.now()
  const duration = ((endTime - startTime) / 1000).toFixed(2)
  const outputSize = fs.statSync(OUTPUT_FILE).size

  console.log('─'.repeat(80))
  console.log(`\n✨ Done!`)
  console.log(`⏱️  Duration: ${duration}s`)
  console.log(`💾 Output saved to: ${path.resolve(OUTPUT_FILE)}`)
  console.log(`📦 File size: ${(outputSize / 1024).toFixed(2)} KB\n`)
}

// =============================================================================
// CLI HELP
// =============================================================================

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🌲 Project Directory Structure Generator

Usage: node generate-structure.js [rootDir] [outputFile] [maxDepth]

Arguments:
  rootDir      Root directory to scan (default: current directory)
  outputFile   Output file name (default: project-structure.txt)
  maxDepth     Maximum depth to traverse (default: unlimited)

Examples:
  node generate-structure.js
  node generate-structure.js ./my-project
  node generate-structure.js ./MYGALE_ART_AND_SERVICES structure.txt
  node generate-structure.js . tree.txt 3

Configuration (edit the script):
  EXCLUDE_DIRS       - Directories to completely hide
  COLLAPSE_DIRS      - Directories to show but not expand
  EXCLUDE_FILES      - Files to skip
  SHOW_FILE_SIZES    - Display file sizes (default: false)
  SHOW_FILE_COUNTS   - Show file counts in directories (default: true)
  ADD_DESCRIPTIONS   - Add descriptions for known files/folders (default: true)

Features:
  ✅ Beautiful tree-style visualization
  ✅ Collapse large folders (node_modules, .next, data, etc.)
  ✅ Smart exclusion of unnecessary directories (.git, .vscode)
  ✅ Optional file sizes and counts
  ✅ Automatic descriptions for common files
  ✅ Configurable depth limit
  ✅ Fast and efficient scanning

Collapsed by default (shows folder but not contents):
  - node_modules, .next, dist, build
  - data, postgres, .cache, tmp, coverage

Excluded completely (hidden):
  - .git, .vscode, .idea
  `)
  process.exit(0)
}

// =============================================================================
// RUN
// =============================================================================

try {
  generateProjectStructure()
} catch (error) {
  console.error('\n❌ Fatal error:', error.message)
  console.error(error.stack)
  process.exit(1)
}
