#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { globSync } = require('glob')

// =============================================================================
// CONFIGURATION
// =============================================================================

// Command-line arguments with sensible defaults
const ROOT_DIR = process.argv[2] || process.cwd()
const OUTPUT_FILE = process.argv[3] || 'MyProjectContent.txt'
const EXTENSIONS = process.argv[4]
  ? process.argv[4].split(',').map((e) => (e.trim().startsWith('.') ? e.trim() : '.' + e.trim()))
  : ['.ts', '.tsx', '.js', '.jsx', '.json', '.prisma', '.yml', '.yaml', '.md', '.mjs', '.cjs', '.css', '.sql', '.toml']

// Directories and files to exclude (glob patterns)
const IGNORE_PATTERNS = [
  '**/node_modules/**',
  '**/.next/**',
  '**/dist/**',
  '**/build/**',
  '**/.git/**',
  '**/.turbo/**',
  '**/coverage/**',
  '**/data/postgres/**',
  '**/.cache/**',
  '**/tmp/**',
  '**/temp/**',
  '**/*.lock',
  '**/pnpm-lock.yaml',
  '**/yarn.lock',
  '**/package-lock.json',
  `**/${OUTPUT_FILE}`, // Don't include the output file itself
]

// Output format options
const FORMAT_OPTIONS = {
  separator: '='.repeat(80),
  wrapInQuotes: true, // Wrap content in triple quotes for better parsing
  includeRelativePath: true,
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function buildGlobPattern() {
  // Create a pattern that matches all specified extensions
  if (EXTENSIONS.length === 1) {
    return `**/*${EXTENSIONS[0]}`
  }
  // Use brace expansion for multiple extensions
  const exts = EXTENSIONS.map((e) => e.replace('.', '')).join(',')
  return `**/*.{${exts}}`
}

function formatFileContent(filePath, content) {
  const relativePath = path.relative(ROOT_DIR, filePath)
  const absolutePath = path.resolve(filePath)
  let output = ''

  // Add file header
  output += `\n${FORMAT_OPTIONS.separator}\n`
  output += `FILE: ${absolutePath}\n`
  if (FORMAT_OPTIONS.includeRelativePath) {
    output += `RELATIVE: ${relativePath}\n`
  }
  output += `${FORMAT_OPTIONS.separator}\n\n`

  // Add content with optional wrapping
  if (FORMAT_OPTIONS.wrapInQuotes) {
    output += '"""\n'
    output += content
    output += '\n"""\n\n'
  } else {
    output += content
    output += '\n\n'
  }

  return output
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

function concatenateFiles() {
  console.log('\n🚀 Starting file concatenation...\n')
  console.log(`📁 Root directory: ${ROOT_DIR}`)
  console.log(`📄 Output file: ${OUTPUT_FILE}`)
  console.log(`🔍 Extensions: ${EXTENSIONS.join(', ')}`)
  console.log(`\n${'─'.repeat(80)}\n`)

  // Validate root directory
  if (!fs.existsSync(ROOT_DIR)) {
    console.error(`❌ Error: Root directory does not exist: ${ROOT_DIR}`)
    process.exit(1)
  }

  // Build glob pattern
  const globPattern = buildGlobPattern()
  console.log(`🔎 Glob pattern: ${globPattern}`)
  console.log(`🚫 Ignoring: ${IGNORE_PATTERNS.length} patterns\n`)

  // Get all files using glob
  const startTime = Date.now()
  let files

  try {
    files = globSync(globPattern, {
      cwd: ROOT_DIR,
      ignore: IGNORE_PATTERNS,
      nodir: true, // Don't match directories
      dot: true, // Match dotfiles (like .prettierrc)
      absolute: false, // Return relative paths
      follow: false, // Don't follow symlinks
    })
  } catch (error) {
    console.error(`❌ Error scanning files: ${error.message}`)
    process.exit(1)
  }

  if (files.length === 0) {
    console.warn('⚠️  No files found matching the criteria.')
    console.log('\nTip: Check your extensions and ignore patterns.')
    return
  }

  console.log(`✅ Found ${files.length} files to process\n`)

  // Create output stream
  const outputStream = fs.createWriteStream(path.join(ROOT_DIR, OUTPUT_FILE), { flags: 'w' })

  // Write header
  const header = `${'='.repeat(80)}
PROJECT FILES CONCATENATION
Generated: ${new Date().toISOString()}
Root: ${ROOT_DIR}
Total Files: ${files.length}
Extensions: ${EXTENSIONS.join(', ')}
${'='.repeat(80)}\n\n`

  outputStream.write(header)

  // Process each file
  let processedCount = 0
  let errorCount = 0
  const errors = []

  files.forEach((file, index) => {
    const fullPath = path.join(ROOT_DIR, file)

    try {
      const content = fs.readFileSync(fullPath, 'utf8')
      const formattedOutput = formatFileContent(fullPath, content)
      outputStream.write(formattedOutput)

      processedCount++
      const progress = Math.round(((index + 1) / files.length) * 100)
      const fileName = path.basename(file)
      process.stdout.write(
        `\r📝 Processing: [${progress}%] ${index + 1}/${files.length} - ${fileName}${' '.repeat(30)}`,
      )
    } catch (error) {
      errorCount++
      errors.push({ file: fullPath, error: error.message })
      console.error(`\n❌ Error reading file ${file}: ${error.message}`)
    }
  })

  // Close stream and finish
  outputStream.end(() => {
    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)
    const outputPath = path.join(ROOT_DIR, OUTPUT_FILE)
    const outputSize = fs.statSync(outputPath).size

    console.log('\n\n' + '─'.repeat(80))
    console.log(`\n✨ Done!`)
    console.log(`📊 Processed: ${processedCount} files`)
    if (errorCount > 0) {
      console.log(`⚠️  Errors: ${errorCount} files`)
      console.log(`\nFailed files:`)
      errors.forEach((e) => console.log(`  - ${e.file}: ${e.error}`))
    }
    console.log(`⏱️  Duration: ${duration}s`)
    console.log(`💾 Output saved to: ${path.resolve(outputPath)}`)
    console.log(`📦 File size: ${(outputSize / 1024 / 1024).toFixed(2)} MB\n`)
  })
}

// =============================================================================
// CLI HELP
// =============================================================================

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
📚 File Concatenator - Combine all project files into one document

Usage: node concatenate-files.js [rootDir] [outputFile] [extensions]

Arguments:
  rootDir      Root directory to scan (default: current directory)
  outputFile   Output file name (default: MyProjectContent.txt)
  extensions   Comma-separated list of extensions (default: .ts,.tsx,.js,.jsx,.json,.prisma,.yml,.yaml,.md,.mjs,.cjs)

Examples:
  node concatenate-files.js
  node concatenate-files.js ./my-project output.txt
  node concatenate-files.js ./MYGALE_ART_AND_SERVICES combined.txt .ts,.js,.json
  node concatenate-files.js . all-files.txt ts,js,tsx,jsx

Features:
  ✅ Fast glob-based file scanning
  ✅ Smart exclusion of build artifacts and dependencies
  ✅ Progress indicator with percentage
  ✅ Error handling with detailed reporting
  ✅ Relative and absolute path tracking
  ✅ Configurable output format
  ✅ Memory-efficient streaming

Excluded by default:
  - node_modules, .next, dist, build, .git
  - Lock files (pnpm-lock.yaml, yarn.lock, etc.)
  - Environment files (.env*)
  - Cache directories
  `)
  process.exit(0)
}

// =============================================================================
// RUN
// =============================================================================

try {
  concatenateFiles()
} catch (error) {
  console.error('\n❌ Fatal error:', error.message)
  console.error(error.stack)
  process.exit(1)
}
