#!/usr/bin/env node
const { spawn } = require('child_process')
const { execSync } = require('child_process')
const path = require('path')

console.log('🚀 Starting development environment...\n')

let isShuttingDown = false
let webProcess = null
let apiProcess = null

// Start Docker database
console.log('📦 Starting PostgreSQL database...')
try {
  execSync('pnpm db:up', { stdio: 'inherit' })
  console.log('✅ Database started\n')
} catch (error) {
  console.error('❌ Failed to start database')
  process.exit(1)
}

// Delay to ensure database is ready
setTimeout(() => {
  console.log('🔄 Starting web and api servers...\n')

  // Determine shell based on platform
  const isWindows = process.platform === 'win32'
  const shell = isWindows ? true : '/bin/sh'

  // Start web server
  webProcess = spawn('pnpm', ['dev'], {
    cwd: path.join(process.cwd(), 'apps', 'web'),
    stdio: ['inherit', 'inherit', 'inherit'],
    shell: shell,
  })

  // Start api server
  apiProcess = spawn('pnpm', ['start:dev'], {
    cwd: path.join(process.cwd(), 'apps', 'api'),
    stdio: ['inherit', 'inherit', 'inherit'],
    shell: shell,
  })

  // Handle web process exit
  webProcess.on('exit', (code) => {
    if (!isShuttingDown) {
      console.log(`\n⚠️  Web server exited with code ${code}`)
      cleanup()
    }
  })

  // Handle api process exit
  apiProcess.on('exit', (code) => {
    if (!isShuttingDown) {
      console.log(`\n⚠️  API server exited with code ${code}`)
      cleanup()
    }
  })
}, 1000)

// Cleanup function
async function cleanup() {
  if (isShuttingDown) return
  isShuttingDown = true

  console.log('\n\n🛑 Shutting down...')

  // Kill the processes
  console.log('⏹️  Stopping web and api servers...')

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

  try {
    if (apiProcess && !apiProcess.killed) {
      apiProcess.kill('SIGTERM')
      // Force kill if needed on Windows
      if (process.platform === 'win32') {
        setTimeout(() => {
          if (!apiProcess.killed) apiProcess.kill('SIGKILL')
        }, 2000)
      }
    }
  } catch (error) {
    console.error('⚠️  Error stopping api server:', error.message)
  }

  // Give processes time to shut down gracefully
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Stop Docker database
  console.log('🗄️  Stopping database...')
  try {
    execSync('pnpm db:down', { stdio: 'inherit' })
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
