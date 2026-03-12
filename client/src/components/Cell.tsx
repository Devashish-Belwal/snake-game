// A Cell is a single square on the board.
// It receives what TYPE it is and renders the right color.
// It knows nothing about game logic — it just displays.

type CellType = 'head' | 'snake' | 'food' | 'empty'

type CellProps = {
  type: CellType
}

// Tailwind classes for each cell state.
// This replaces your .fill, .head, .food CSS classes.
const cellStyles: Record<CellType, string> = {
  empty: 'bg-transparent border-red-100/10 border',
  snake: 'bg-purple-400 rounded-sm border-red-100 border',
  head:  'bg-purple-200 rounded-sm border-red-100 border',
  food:  'bg-orange-500 rounded-sm animate-pulse border-red-100 border',
}

export default function Cell({ type }: CellProps) {
  return (
    <div className={`w-full h-full ${cellStyles[type]}`} />
  )
}