import { motion, AnimatePresence } from 'framer-motion'
import { CursorPosition } from '@/lib/types'

interface LiveCursorProps {
  cursor: CursorPosition
}

export function LiveCursor({ cursor }: LiveCursorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed pointer-events-none z-50"
      style={{
        left: `${cursor.x}px`,
        top: `${cursor.y}px`,
        transform: 'translate(-2px, -2px)'
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.65376 12.3673L9.37816 20.7815C9.56149 21.2216 10.1494 21.3473 10.4903 21.0064L12.6889 18.8078C12.8862 18.6105 13.1614 18.5252 13.4313 18.5772L18.9321 19.5866C19.4722 19.6881 19.9346 19.2257 19.8331 18.6856L13.019 2.03958C12.9104 1.47639 12.2057 1.30219 11.8492 1.75585L5.32091 10.3323C5.04022 10.6871 5.47128 11.1861 5.65376 12.3673Z"
          fill={cursor.userColor}
          stroke="white"
          strokeWidth="1.5"
        />
      </svg>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="absolute left-6 top-0 px-2 py-1 rounded text-xs font-medium whitespace-nowrap shadow-lg"
        style={{
          backgroundColor: cursor.userColor,
          color: 'white'
        }}
      >
        {cursor.userName}
      </motion.div>
    </motion.div>
  )
}

interface LiveCursorsProps {
  cursors: CursorPosition[]
}

export function LiveCursors({ cursors }: LiveCursorsProps) {
  return (
    <AnimatePresence mode="popLayout">
      {cursors.map((cursor) => (
        <LiveCursor key={cursor.userId} cursor={cursor} />
      ))}
    </AnimatePresence>
  )
}
