'use client'

import type { ReactNode } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export type DragHandleProps = React.HTMLAttributes<HTMLButtonElement>

export function DragHandle({ dragHandleProps }: { dragHandleProps: DragHandleProps }) {
  return (
    <button
      type="button"
      {...dragHandleProps}
      aria-label="Drag to reorder"
      className="cursor-grab touch-none rounded border border-neutral-700 px-2 py-1 text-xs text-neutral-400 active:cursor-grabbing"
    >
      ⠿
    </button>
  )
}

export function SortableCard({
  id,
  className,
  children,
}: {
  id: string
  className?: string
  children: (props: { dragHandleProps: DragHandleProps; isDragging: boolean }) => ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className={className}>
      {children({ dragHandleProps: { ...attributes, ...listeners }, isDragging })}
    </div>
  )
}

export function SortableRow({
  id,
  className,
  children,
}: {
  id: string
  className?: string
  children: (props: { dragHandleProps: DragHandleProps; isDragging: boolean }) => ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  }

  return (
    <tr ref={setNodeRef} style={style} className={className}>
      {children({ dragHandleProps: { ...attributes, ...listeners }, isDragging })}
    </tr>
  )
}
