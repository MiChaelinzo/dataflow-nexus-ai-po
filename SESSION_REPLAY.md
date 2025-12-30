# Session Replay Feature Documentation

## Overview

The Session Replay feature provides comprehensive recording and playback capabilities for collaboration sessions within the Analytics Intelligence Platform. This powerful tool captures all user interactions, cursor movements, and activities in real-time, allowing teams to review workflows, create training materials, and analyze collaboration patterns.

## Key Features

### 1. Real-Time Recording
- **Cursor Tracking**: Captures precise cursor positions for all active users
- **Click Events**: Records all click interactions with element identification
- **Scroll Tracking**: Monitors scrolling behavior across the application
- **Tab Changes**: Logs navigation between different views
- **Custom Events**: Captures application-specific interactions (insight generation, filter application)
- **Automatic Batching**: Events are buffered and saved every 5 seconds for performance

### 2. Playback Controls
- **Play/Pause/Stop**: Full control over playback state
- **Seek**: Jump to any point in the timeline
- **Playback Speed**: Adjustable speed (0.5x, 1x, 1.5x, 2x)
- **Timeline Scrubbing**: Interactive slider for quick navigation
- **Skip Controls**: Jump forward/backward by 5 seconds

### 3. Event Timeline
- **Visual Event List**: See all captured events in chronological order
- **User Attribution**: Each event shows which user performed it
- **Event Icons**: Visual indicators for different event types
- **Detailed Descriptions**: Human-readable descriptions of each action
- **Timestamps**: Precise timing information for every event

### 4. Multi-User Support
- **Participant Tracking**: Records all users in the session
- **Color Coding**: Each user gets a unique color for easy identification
- **Join/Leave Events**: Tracks when participants enter or exit
- **Cursor Visualization**: Shows all active user cursors during playback

### 5. Metadata & Organization
- **Session Titles**: Descriptive names for easy identification
- **Descriptions**: Optional detailed notes about the session
- **Tags**: Categorize recordings for quick filtering
- **View Tracking**: Records which tabs/views were visited
- **Duration Tracking**: Automatic calculation of session length

## Technical Architecture

### Data Structures

#### SessionEvent
```typescript
{
  id: string
  timestamp: number
  type: 'cursor' | 'click' | 'scroll' | 'tab-change' | 'interaction' | 'insight-generate' | 'filter-apply'
  userId: string
  userName: string
  userColor: string
  data: any  // Event-specific data
}
```

#### SessionRecording
```typescript
{
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
}
```

### Components

#### `SessionReplay`
Main component that provides the recording interface and manages the overall state.

**Props:**
- `currentUserId`: ID of the current user
- `currentUserName`: Display name of the current user
- `currentUserColor`: Color assigned to the current user
- `currentView`: Currently active tab/view

**Features:**
- Start/stop recording controls
- Recording list display
- Dialog for creating new recordings
- Integration with toast notifications

#### `SessionRecordingCard`
Display component for individual recordings in the list.

**Props:**
- `recording`: The session recording data
- `onPlay`: Callback when play button is clicked
- `onDelete`: Callback when delete button is clicked

**Features:**
- Shows recording metadata (title, duration, participants)
- Displays participant avatars
- Quick play and delete actions
- Hover effects and animations

#### `SessionPlaybackViewer`
Full-screen playback interface for reviewing recorded sessions.

**Props:**
- `recording`: The session recording to play
- `onClose`: Callback when closing the viewer

**Features:**
- Real-time cursor rendering
- Event timeline with filtering
- Full playback controls
- Progress indicator
- Event details panel

### Hooks

#### `useSessionRecorder`
Manages recording state and event capture.

**Options:**
- `enabled`: Whether recording is active
- `currentUserId`: Current user's ID
- `currentUserName`: Current user's name
- `currentUserColor`: Current user's color
- `currentView`: Current view/tab

**Returns:**
- `isRecording`: Boolean indicating if recording is active
- `currentSession`: Current session data (if recording)
- `recordings`: Array of all saved recordings
- `startRecording`: Function to start a new recording
- `stopRecording`: Function to stop current recording
- `recordEvent`: Function to manually record custom events
- `deleteRecording`: Function to delete a recording
- `updateRecordingMetadata`: Function to update recording info

**Event Capture:**
- Mouse movements (throttled to 100ms)
- Mouse clicks with element info
- Scroll events (throttled to 200ms)
- Tab changes automatically
- Custom events via `recordEvent`

#### `useSessionPlayback`
Manages playback state and timeline navigation.

**Options:**
- `recording`: The recording to play
- `onEventPlay`: Callback fired when each event is played

**Returns:**
- `playbackState`: Current playback state (playing, paused, time, speed, etc.)
- `currentEvents`: Array of events played so far
- `progress`: Playback progress as percentage (0-100)
- `play`: Start playback
- `pause`: Pause playback
- `stop`: Stop and reset playback
- `seek`: Jump to specific time
- `setSpeed`: Change playback speed

## Usage Examples

### Starting a Recording

```typescript
import { useSessionRecorder } from '@/hooks/use-session-recorder'

const { startRecording, isRecording } = useSessionRecorder({
  enabled: true,
  currentUserId: 'user-123',
  currentUserName: 'Alice',
  currentUserColor: 'oklch(0.70 0.15 195)',
  currentView: 'dashboard'
})

// Start recording
startRecording('Q4 Review Meeting')
```

### Recording Custom Events

```typescript
const { recordEvent } = useSessionRecorder(/* ... */)

// Record a custom interaction
recordEvent('insight-generate', {
  insightType: 'trend',
  metric: 'revenue',
  confidence: 0.87
})

// Record a filter application
recordEvent('filter-apply', {
  filter: 'timeRange',
  value: 'last-30-days'
})
```

### Playing Back a Recording

```typescript
import { useSessionPlayback } from '@/hooks/use-session-playback'

const { play, pause, seek, setSpeed, playbackState } = useSessionPlayback({
  recording: myRecording,
  onEventPlay: (event) => {
    console.log('Event played:', event)
  }
})

// Start playback
play()

// Pause
pause()

// Jump to 30 seconds
seek(30000)

// Set 2x speed
setSpeed(2)
```

## Data Persistence

All recordings are stored using the Spark KV (Key-Value) persistence API:

- **Key**: `session-recordings`
- **Storage**: Persists between sessions
- **Access**: User-specific storage
- **Limits**: Subject to Spark KV storage limits

### Storage Format

Recordings are stored as an array of `SessionRecording` objects:

```typescript
const recordings = [
  {
    id: 'session-1234567890-abc123',
    startTime: 1640000000000,
    endTime: 1640003600000,
    duration: 3600000,
    events: [...],
    participants: [...],
    metadata: {...}
  },
  // ... more recordings
]
```

## Performance Considerations

### Recording Performance
- **Event Throttling**: Mouse and scroll events are throttled to prevent excessive capture
- **Batch Saving**: Events are buffered and saved in batches every 5 seconds
- **Memory Management**: Events are stored in a ref to minimize re-renders
- **Cleanup**: Automatic cleanup of stale sessions older than 5 minutes

### Playback Performance
- **Efficient Rendering**: Only renders visible events
- **Animation Frame**: Uses 60fps update loop (16ms intervals)
- **Virtual Scrolling**: Event timeline uses ScrollArea for large lists
- **Lazy Loading**: Events are filtered on-demand during playback

## Best Practices

### For Recording
1. **Clear Titles**: Use descriptive titles that explain the session purpose
2. **Stop Recording**: Always stop recording when finished to save properly
3. **Limit Duration**: Keep recordings under 30 minutes for best performance
4. **Clean Up**: Delete old or unnecessary recordings regularly

### For Playback
1. **Use Speed Control**: Speed up boring sections, slow down complex interactions
2. **Review Timeline**: Check the event list to understand what happened
3. **Share Context**: Add descriptions to recordings for future viewers
4. **Export Insights**: Document key findings from recorded sessions

## Future Enhancements

Potential improvements for the Session Replay feature:

1. **Video Export**: Convert sessions to MP4 video format
2. **Annotations**: Add notes and markers during playback
3. **Search & Filter**: Find specific events or users in recordings
4. **Sharing**: Share recordings with team members via links
5. **Analytics**: Generate insights from recorded sessions
6. **Screen Capture**: Optional screenshot capture at key moments
7. **Audio Recording**: Capture voice commentary during sessions
8. **Collaborative Playback**: Watch recordings together in real-time
9. **Bookmarks**: Mark important moments in recordings
10. **Export Timeline**: Generate reports from session events

## Integration Points

### With Collaboration Features
- Captures live cursor positions from `useCollaboration` hook
- Records presence and activity data
- Integrates with user identification system

### With Tableau Features
- Records interactions with embedded dashboards
- Captures filter and parameter changes
- Logs API calls and data requests

### With AI Insights
- Records insight generation events
- Captures confidence scores and recommendations
- Logs user feedback on insights

## Troubleshooting

### Recording Not Starting
- Check that `enabled` is set to true
- Verify user credentials are properly set
- Check browser console for errors

### Events Not Being Captured
- Ensure event listeners are properly attached
- Check throttling settings
- Verify the recording is actually active

### Playback Issues
- Verify the recording has events
- Check that duration is calculated correctly
- Ensure browser supports required features

### Storage Issues
- Check available KV storage space
- Try deleting old recordings
- Verify data is saving properly

## API Reference

### Utility Functions

```typescript
// Create a session event
createSessionEvent(
  type: SessionEvent['type'],
  userId: string,
  userName: string,
  userColor: string,
  data: any
): SessionEvent

// Calculate session duration
calculateDuration(events: SessionEvent[]): number

// Format duration for display
formatDuration(ms: number): string

// Format timestamp relative to now
formatTimestamp(timestamp: number): string

// Get events in time range
getEventsByTimeRange(
  events: SessionEvent[],
  startTime: number,
  endTime: number
): SessionEvent[]

// Get icon for event type
getEventIcon(type: SessionEvent['type']): string

// Get human-readable description
getEventDescription(event: SessionEvent): string
```

## Conclusion

The Session Replay feature provides powerful capabilities for reviewing and analyzing collaboration sessions. It's designed to be performant, easy to use, and seamlessly integrated with the rest of the Analytics Intelligence Platform.

For questions or feature requests, please refer to the main project documentation or submit an issue.
