#!/usr/bin/env node
const { spawn, exec } = require('child_process')
const { execSync } = require('child_process')
const path = require('path')

console.log('🚀 Starting development environment...\n')

let isShuttingDown = false
let webProcess = null

// Start Docker database
console.log('📦 Starting PostgreSQL database...')
try {
  execSync('bun db:up', { stdio: 'inherit' })
  console.log('✅ Database started\n')
} catch (error) {
  console.error('❌ Failed to start database')
  process.exit(1)
}

// Delay to ensure database is ready
setTimeout(() => {
  console.log('🔄 Starting web server...\n')

  const webDir = path.join(process.cwd(), 'apps', 'web')

  // Use exec which handles shell better on Windows
  webProcess = exec('bun dev', {
    cwd: webDir,
  })

  // Pipe output
  webProcess.stdout.pipe(process.stdout)
  webProcess.stderr.pipe(process.stderr)

  // Handle web process exit
  webProcess.on('exit', (code) => {
    if (!isShuttingDown) {
      console.log(`\n⚠️  Web server exited with code ${code}`)
      cleanup()
    }
  })

  webProcess.on('error', (error) => {
    console.error(`\n❌ Error starting web server:`, error.message)
    cleanup()
  })
}, 1000)

// Cleanup function
async function cleanup() {
  if (isShuttingDown) return
  isShuttingDown = true

  console.log('\n\n🛑 Shutting down...')

  // Kill the processes
  console.log('⏹️  Stopping web server...')

  try {
    if (webProcess && !webProcess.killed) {
      webProcess.kill('SIGTERM')
      // Force kill if needed on Windows
      if (process.platform === 'win32') {
        setTimeout(() => {
          if (!webProcess.killed) webProcess.kill('SIGKILL')
        }, 2000)
      }
    }
  } catch (error) {
    console.error('⚠️  Error stopping web server:', error.message)
  }

  // Give processes time to shut down gracefully
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Stop Docker database
  console.log('🗄️  Stopping database...')
  try {
    execSync('bun db:down', { stdio: 'inherit' })
    console.log('✅ Database stopped')
  } catch (error) {
    console.error('⚠️  Error stopping database:', error.message)
  }

  console.log('\n👋 Goodbye!\n')
  process.exit(0)
}

// Handle various termination signals
process.on('SIGINT', cleanup) // Ctrl+C
process.on('SIGTERM', cleanup) // Kill command

// Windows-specific handling
if (process.platform === 'win32') {
  const readline = require('readline')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  rl.on('SIGINT', cleanup)
}