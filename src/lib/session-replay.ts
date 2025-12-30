export interface SessionEvent {
  id: string
  timestamp: number
  type: 'cursor' | 'click' | 'scroll' | 'tab-change' | 'interaction' | 'insight-generate' | 'filter-apply'
  userId: string
  userName: string
  userColor: string
  data: any
}

export interface Annotation {
  id: string
  sessionId: string
  timestamp: number
  userId: string
  userName: string
  userColor: string
  title: string
  description?: string
  category: 'important' | 'question' | 'issue' | 'highlight' | 'note'
  createdAt: number
}

export interface Bookmark {
  id: string
  sessionId: string
  timestamp: number
  userId: string
  userName: string
  userColor: string
  label: string
  color: string
  createdAt: number
}

export interface SessionRecording {
  id: string
  startTime: number
  endTime?: number
  duration: number
  events: SessionEvent[]
  participants: Array<{
    userId: string
    userName: string
    userColor: string
    joinedAt: number
    leftAt?: number
  }>
  metadata: {
    title: string
    description?: string
    tags: string[]
    views: string[]
  }
  annotations?: Annotation[]
  bookmarks?: Bookmark[]
}

export interface PlaybackState {
  isPlaying: boolean
  isPaused: boolean
  currentTime: number
  playbackSpeed: 1 | 1.5 | 2 | 0.5
  currentEventIndex: number
}

export function createSessionEvent(
  type: SessionEvent['type'],
  userId: string,
  userName: string,
  userColor: string,
  data: any
): SessionEvent {
  return {
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    timestamp: Date.now(),
    type,
    userId,
    userName,
    userColor,
    data
  }
}

export function calculateDuration(events: SessionEvent[]): number {
  if (events.length === 0) return 0
  const first = events[0].timestamp
  const last = events[events.length - 1].timestamp
  return last - first
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  }
  return `${seconds}s`
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString()
}

export function getEventsByTimeRange(
  events: SessionEvent[],
  startTime: number,
  endTime: number
): SessionEvent[] {
  return events.filter(
    event => event.timestamp >= startTime && event.timestamp <= endTime
  )
}

export function getEventIcon(type: SessionEvent['type']): string {
  switch (type) {
    case 'cursor': return '👆'
    case 'click': return '🖱️'
    case 'scroll': return '📜'
    case 'tab-change': return '🗂️'
    case 'interaction': return '⚡'
    case 'insight-generate': return '✨'
    case 'filter-apply': return '🔍'
    default: return '📍'
  }
}

export function getEventDescription(event: SessionEvent): string {
  switch (event.type) {
    case 'cursor':
      return `Moved cursor to (${event.data.x}, ${event.data.y})`
    case 'click':
      return `Clicked on ${event.data.target || 'element'}`
    case 'scroll':
      return `Scrolled to ${event.data.scrollY}px`
    case 'tab-change':
      return `Switched to ${event.data.tab} tab`
    case 'interaction':
      return event.data.description || 'Interacted with element'
    case 'insight-generate':
      return `Generated AI insights`
    case 'filter-apply':
      return `Applied filter: ${event.data.filter}`
    default:
      return 'Unknown event'
  }
}

export function createAnnotation(
  sessionId: string,
  timestamp: number,
  userId: string,
  userName: string,
  userColor: string,
  title: string,
  category: Annotation['category'],
  description?: string
): Annotation {
  return {
    id: `ann-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    sessionId,
    timestamp,
    userId,
    userName,
    userColor,
    title,
    description,
    category,
    createdAt: Date.now()
  }
}

export function createBookmark(
  sessionId: string,
  timestamp: number,
  userId: string,
  userName: string,
  userColor: string,
  label: string,
  color: string
): Bookmark {
  return {
    id: `bmk-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    sessionId,
    timestamp,
    userId,
    userName,
    userColor,
    label,
    color,
    createdAt: Date.now()
  }
}

export function getCategoryColor(category: Annotation['category']): string {
  switch (category) {
    case 'important': return 'oklch(0.55 0.22 25)'
    case 'question': return 'oklch(0.45 0.15 250)'
    case 'issue': return 'oklch(0.70 0.15 70)'
    case 'highlight': return 'oklch(0.70 0.15 195)'
    case 'note': return 'oklch(0.60 0.18 290)'
    default: return 'oklch(0.70 0.15 195)'
  }
}

export function getCategoryIcon(category: Annotation['category']): string {
  switch (category) {
    case 'important': return '⚠️'
    case 'question': return '❓'
    case 'issue': return '🐛'
    case 'highlight': return '⭐'
    case 'note': return '📝'
    default: return '📌'
  }
}
