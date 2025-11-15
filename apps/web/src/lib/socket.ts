import { io, type Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getSocket(token?: string): Socket {
  if (socket && socket.connected) return socket

  const url = process.env.NEXT_PUBLIC_API_WS_URL ?? 'http://localhost:4000'

  socket = io(url, {
    autoConnect: true,
    transports: ['websocket'],
    auth: token ? { token } : undefined,
  })

  socket.on('connect_error', (err) => {
    console.warn("Socket connect_error", err);
  })

  return socket
}
