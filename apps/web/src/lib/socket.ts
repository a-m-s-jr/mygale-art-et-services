/* eslint-disable @typescript-eslint/no-explicit-any */
import { io, type Socket } from 'socket.io-client'

/**
 * Socket manager with:
 * - explicit returned Socket type (avoids complex inference issues)
 * - exponential backoff reconnect with jitter
 * - manual reconnect() / disconnect()
 * - application-level heartbeat (ping/pong) using 'health:ping'/'health:pong'
 *
 * Usage:
 *   import { getSocket, disconnectSocket, reconnectSocket } from '@/lib/socket'
 *   const s = getSocket(token)
 */

type SocketOpts = {
  token?: string
  path?: string
  autoConnect?: boolean
}

let socket: Socket | null = null
let currentToken: string | undefined
let heartBeatInterval: number | undefined
let lastPongAt: number | undefined

// Backoff state:
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 10
const BASE_DELAY_MS = 500 // initial backoff
const MAX_DELAY_MS = 30_000

function exponentialBackoff(attempt: number) {
  // exponential + jitter
  const exp = Math.min(MAX_DELAY_MS, BASE_DELAY_MS * 2 ** attempt)
  const jitter = Math.round(Math.random() * 0.2 * exp) // 0 - 20% jitter
  return Math.min(MAX_DELAY_MS, exp + jitter)
}

function startHeartbeat(s: Socket) {
  stopHeartbeat()
  // send ping every 10s
  heartBeatInterval = window.setInterval(() => {
    try {
      s.emit('health:ping', { ts: Date.now() })
      // If we haven't received a pong for >25s, consider reconnecting
      const now = Date.now()
      if (lastPongAt && now - lastPongAt > 25_000) {
        console.warn('Heartbeat missed — forcing reconnect')
        // graceful reconnect
        reconnectSocket()
      }
    } catch (err) {
      // ignore
    }
  }, 10_000) as unknown as number
}

function stopHeartbeat() {
  if (heartBeatInterval) {
    clearInterval(heartBeatInterval)
    heartBeatInterval = undefined
  }
  lastPongAt = undefined
}

function bindDefaultHandlers(s: Socket) {
  s.on('connect', () => {
    reconnectAttempts = 0
    // record connected state
    console.debug('[socket] connected', s.id)
  })

  s.on('disconnect', (reason) => {
    console.warn('[socket] disconnected', reason)
  })

  s.on('connect_error', (err: Error) => {
    console.warn('[socket] connect_error', err?.message ?? err)
  })

  s.on('health:pong', (payload: any) => {
    lastPongAt = Date.now()
    // optional debug
    // console.debug('[socket] pong', payload)
  })
}

/**
 * Create or return an existing socket instance.
 * If token changed, socket will be re-created.
 */
export function getSocket(token?: string, opts: SocketOpts = {}): Socket {
  const url = process.env.NEXT_PUBLIC_API_WS_URL ?? 'http://localhost:4000'

  if (socket && socket.connected && token === currentToken) {
    return socket
  }

  // If token changed (or no socket), recreate
  if (socket) {
    try {
      socket.removeAllListeners()
      socket.close()
    } catch (e) {
      // ignore
    }
    stopHeartbeat()
    socket = null
  }

  currentToken = token

  socket = io(url, {
    autoConnect: opts.autoConnect ?? true,
    transports: ['websocket'],
    auth: token ? { token } : undefined,
    path: opts.path ?? undefined,
    // we will control reconnect ourselves; however we still rely on base reconnection
    // set low attempts so we can implement nicer backoff:
    reconnectionAttempts: 2,
    reconnection: false,
  })

  // bind handlers
  bindDefaultHandlers(socket)

  // Listen for disconnect -> schedule reconnection with backoff
  socket.on('disconnect', (reason) => {
    scheduleReconnect()
  })

  // When connect_error occurs, also schedule
  socket.on('connect_error', () => {
    scheduleReconnect()
  })

  // Start a heartbeat ping/pong
  startHeartbeat(socket)

  // listen for server emitted contact events (example names)
  // your components can also attach their own listeners via socket.on(...)
  return socket
}

/** Graceful disconnect */
export function disconnectSocket() {
  try {
    if (socket) {
      stopHeartbeat()
      socket.removeAllListeners()
      socket.close()
    }
  } finally {
    socket = null
    reconnectAttempts = 0
    currentToken = undefined
  }
}

/** Attempt immediate reconnect (resets attempts) */
export function reconnectSocket() {
  if (!socket) {
    // create a new socket using last token
    getSocket(currentToken)
    return
  }

  // close existing and create again
  try {
    socket.removeAllListeners()
    socket.close()
  } catch (e) {
    // ignore
  }
  socket = null
  reconnectAttempts = 0
  getSocket(currentToken)
}

let reconnectTimerId: number | undefined
function scheduleReconnect() {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error('[socket] reached max reconnect attempts, not reconnecting automatically')
    return
  }

  reconnectAttempts += 1
  const delay = exponentialBackoff(reconnectAttempts - 1)
  console.info(`[socket] scheduling reconnect attempt #${reconnectAttempts} in ${delay}ms`)

  if (reconnectTimerId) {
    clearTimeout(reconnectTimerId)
    reconnectTimerId = undefined
  }

  reconnectTimerId = window.setTimeout(() => {
    try {
      // attempt re-create
      getSocket(currentToken)
    } catch (err) {
      console.error('[socket] reconnect attempt failed', err)
      scheduleReconnect()
    }
  }, delay) as unknown as number
}
