/* eslint-disable react-hooks/refs */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState, useRef } from 'react'
import type { Socket } from 'socket.io-client'
import { getSocket, disconnectSocket, reconnectSocket } from '@/lib/socket'

type Handler = (data: any) => void

export type UseSocketReturn = {
  connected: boolean
  subscribe: (event: string, handler: Handler) => () => void
  reconnect: () => void
  disconnect: () => void
  socket: Socket | null
}

export default function useSocket(
  token?: string,
  opts?: { onConnect?: () => void; onDisconnect?: () => void; onError?: (err: any) => void },
): UseSocketReturn {
  const [connected, setConnected] = useState<boolean>(false)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!token) {
      disconnectSocket()
      socketRef.current = null
      setConnected(false)
      return
    }

    const s = getSocket(token)
    socketRef.current = s

    function handleConnect() {
      setConnected(true)
      opts?.onConnect?.()
    }

    function handleDisconnect(reason: any) {
      setConnected(false)
      opts?.onDisconnect?.()
    }

    function handleError(err: any) {
      console.warn('[useSocket] error', err)
      opts?.onError?.(err)
    }

    s.on('connect', handleConnect)
    s.on('disconnect', handleDisconnect)
    s.on('connect_error', handleError)

    return () => {
      s.off('connect', handleConnect)
      s.off('disconnect', handleDisconnect)
      s.off('connect_error', handleError)
    }
  }, [token])

  const subscribe = (event: string, handler: Handler) => {
    const s = socketRef.current ?? (token ? getSocket(token) : null)
    if (!s) return () => {}
    s.on(event, handler)
    return () => s.off(event, handler)
  }

  return {
    connected,
    subscribe,
    reconnect: () => reconnectSocket(),
    disconnect: () => disconnectSocket(),
    socket: socketRef.current,
  }
}
