/* eslint-disable react-hooks/refs */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useEffect, useRef } from 'react'
import { getSocket } from '@/lib/socket'

type Handler = (data: any) => void

export default function useSocket(event: string, handler: Handler, token?: string) {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    const socket = getSocket(token)

    const wrapper = (d: any) => handlerRef.current(d)
    socket.on(event, wrapper)

    return () => {
      socket.off(event, wrapper)
    }
  }, [event, token])
}