# @Mentions Feature Documentation

## Overview
The @mentions feature allows users to tag and notify specific team members within annotation reply threads during session replay. This enhances team collaboration by enabling direct communication and ensuring important discussions reach the right people.

## Feature Highlights

### 🎯 Core Capabilities
- **Smart Autocomplete**: Type `@` to see a filtered list of available team members
- **Keyboard Navigation**: Arrow keys to navigate, Enter to select, Escape to close
- **Real-time Filtering**: Dynamic filtering as you type names
- **Visual Highlighting**: Mentioned users appear with colored backgrounds
- **Instant Notifications**: Mentioned users receive notifications immediately
- **Multiple Mentions**: Support for mentioning multiple users in one message
- **Persistent Storage**: Notifications persist across sessions using KV storage

### 🎨 User Experience
- Smooth animations and transitions
- Color-coded user identities
- Contextual notification previews
- One-click navigation to discussions
- Keyboard shortcuts for power users

## How to Test

### Quick Test (5 minutes)

1. **Navigate to Replay Tab**
   - Open the application
   - Click the "Replay" tab (video camera icon)

2. **Start a Recording**
   - Click "Start Recording"
   - Enter title: "Testing @Mentions"
   - Navigate between tabs for 30 seconds
   - Click "Stop Recording"

3. **Add Annotation**
   - Click "Play" on your recording
   - Click "Add Annotation" button
   - Add title and select a category
   - Click "Add Annotation"

4. **Test @Mentions**
   - Click on the annotation in the "Notes" tab
   - In the reply box, type `@`
   - See autocomplete suggestions appear
   - Use arrow keys or mouse to select a user
   - Complete your message and click "Reply"

5. **Verify Notifications**
   - Check the success toast showing "X people notified"
   - Click the bell icon in the header
   - See your mention notification

### Detailed Testing Guide
For comprehensive testing instructions, see [MENTIONS_TESTING_GUIDE.md](./MENTIONS_TESTING_GUIDE.md)

## Architecture

### Component Structure

```
SessionReplay.tsx
├── SessionPlaybackViewer.tsx
│   ├── AnnotationThread.tsx         ← Main mention handling
│   │   ├── MentionInput.tsx         ← Autocomplete UI
│   │   └── MentionNotifications.tsx ← Notification system
│   ├── AnnotationCard.tsx
│   ├── AddAnnotationDialog.tsx
│   └── Controls & Timeline
└── SessionRecordingCard.tsx
```

### Key Components

#### 1. MentionInput.tsx
**Purpose**: Custom textarea with @mention autocomplete functionality

**Features**:
- Detects `@` character in real-time
- Shows filtered user suggestions
- Keyboard navigation (↑↓ to navigate, Enter to select)
- Mouse selection support
- Visual highlighting of mentions

**Props**:
```typescript
interface MentionInputProps {
  value: string
  onChange: (value: string) => void
  onKeyDown?: (e: KeyboardEvent) => void
  placeholder?: string
  rows?: number
  availableUsers: User[]
  className?: string
}
```

**State Management**:
- `showSuggestions`: Boolean to control dropdown visibility
- `suggestions`: Filtered list of users matching current query
- `selectedIndex`: Currently highlighted suggestion
- `mentionQuery`: Current text after `@`
- `mentionStart`: Position where `@` was typed

#### 2. AnnotationThread.tsx
**Purpose**: Manages annotation discussions with reply functionality

**Features**:
- Displays annotation details and metadata
- Shows all replies with user attribution
- Handles mention extraction and notification sending
- Supports resolve/unresolve workflow

**Key Functions**:
```typescript
// Extract @mentions from text
const mentions = extractMentions(replyContent)

// Send notifications to mentioned users
await sendMentionNotifications(mentions, replyContent)

// Add reply with mentions
onAddReply(annotation.id, reply)
```

#### 3. MentionNotifications.tsx
**Purpose**: Display and manage mention notifications

**Features**:
- Badge with unread count
- Dropdown list of notifications
- Mark as read functionality
- Click to jump to annotation
- Persistent storage

**Data Structure**:
```typescript
interface MentionNotification {
  id: string
  recipientUserId: string
  mentionedByUserId: string
  mentionedByUserName: string
  mentionedByUserColor: string
  annotationId: string
  annotationTitle: string
  messagePreview: string
  timestamp: number
  read: boolean
}
```

### Data Flow

```
User types '@' in reply box
        ↓
MentionInput detects @ and shows suggestions
        ↓
User selects mention (keyboard/mouse)
        ↓
Mention inserted as @Username in text
        ↓
User clicks "Reply" button
        ↓
AnnotationThread extracts mentions via regex
        ↓
Creates notification for each mentioned user
        ↓
Saves to KV storage: mentions-{userId}
        ↓
Shows success toast with notification count
        ↓
Mentioned users see notification in bell icon
```

### Storage Schema

#### User Mentions
**Key**: `mentions-{userId}`
**Value**: Array of MentionNotification objects

```json
[
  {
    "id": "mention-abc123",
    "recipientUserId": "user-456",
    "mentionedByUserId": "user-123",
    "mentionedByUserName": "Alex Chen",
    "mentionedByUserColor": "oklch(0.70 0.15 195)",
    "annotationId": "annotation-xyz",
    "annotationTitle": "Dashboard Layout Discussion",
    "messagePreview": "@AlexChen can you review this metric?",
    "timestamp": 1704567890123,
    "read": false
  }
]
```

#### Session Recordings
Annotations include replies with mentions:

```json
{
  "id": "recording-123",
  "annotations": [
    {
      "id": "annotation-xyz",
      "replies": [
        {
          "id": "reply-abc",
          "content": "@AlexChen can you review this?",
          "mentions": ["AlexChen"],
          "userId": "user-789",
          "userName": "Jamie Lee"
        }
      ]
    }
  ]
}
```

## Technical Implementation

### Mention Detection (Regex)
```typescript
const mentionRegex = /@(\w+)/g
```
This regex:
- Matches `@` followed by word characters
- Captures the username without the `@`
- Global flag to find all mentions

### Mention Extraction
```typescript
export function extractMentions(text: string): string[] {
  const regex = /@(\w+)/g
  const matches = text.matchAll(regex)
  return Array.from(matches, m => m[1])
}
```

### Real-time Autocomplete Detection
```typescript
const detectMention = (text: string, cursorPosition: number) => {
  const beforeCursor = text.substring(0, cursorPosition)
  const lastAtIndex = beforeCursor.lastIndexOf('@')
  
  if (lastAtIndex === -1) return
  
  const textAfterAt = beforeCursor.substring(lastAtIndex + 1)
  
  // Don't show suggestions if space/newline after @
  if (textAfterAt.includes(' ') || textAfterAt.includes('\n')) return
  
  // Filter users based on query
  const query = textAfterAt.toLowerCase()
  const filtered = availableUsers.filter(user => 
    user.userName.toLowerCase().includes(query)
  )
  
  setSuggestions(filtered)
  setShowSuggestions(true)
}
```

### Notification Creation
```typescript
export function createMentionNotification(
  recipientUserId: string,
  mentionedByUserName: string,
  mentionedByUserColor: string,
  annotationId: string,
  annotationTitle: string,
  messagePreview: string
): MentionNotification {
  return {
    id: `mention-${Date.now()}-${Math.random()}`,
    recipientUserId,
    mentionedByUserId: currentUserId,
    mentionedByUserName,
    mentionedByUserColor,
    annotationId,
    annotationTitle,
    messagePreview: messagePreview.substring(0, 100),
    timestamp: Date.now(),
    read: false
  }
}
```

### Async Notification Sending
```typescript
const sendMentionNotifications = async (
  mentions: string[], 
  replyContent: string
) => {
  for (const mentionedUserName of mentions) {
    const mentionedUser = availableUsers.find(
      u => u.userName.toLowerCase() === mentionedUserName.toLowerCase()
    )
    
    if (mentionedUser && mentionedUser.userId !== currentUserId) {
      const notification = createMentionNotification(
        mentionedUser.userId,
        currentUserName,
        currentUserColor,
        annotation.id,
        annotation.title,
        replyContent
      )

      const storageKey = `mentions-${mentionedUser.userId}`
      const existing = await spark.kv.get(storageKey) || []
      await spark.kv.set(storageKey, [...existing, notification])
    }
  }
}
```

## UI/UX Details

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `@` | Show mention suggestions |
| `↑` `↓` | Navigate suggestions |
| `Enter` | Select highlighted mention |
| `Escape` | Close suggestions |
| `Cmd/Ctrl` + `Enter` | Send reply |

### Visual States

**Autocomplete Dropdown**:
- Appears below input when `@` is typed
- Max 5 suggestions visible
- Scrollable if more results
- Highlighted selection with accent color
- User avatars with colors
- Username and ID displayed

**Mention Highlighting**:
- Mentioned usernames in accent color
- Light background highlight
- Bold font weight
- User's color if they're a participant

**Notifications**:
- Red badge with count on bell icon
- Dropdown with notification cards
- Preview of message content
- Timestamp in relative format
- Hover states and click targets

### Animations

- Dropdown: Fade in/out with slide (150ms)
- Suggestions: Smooth transitions
- Notifications: Slide from right
- Badge: Pulse animation on new mentions

## Best Practices

### For Users
1. **Be Specific**: Mention only relevant people
2. **Add Context**: Include enough information in your message
3. **Check Notifications**: Review mention notifications regularly
4. **Reply Promptly**: Engage in discussions you're mentioned in

### For Developers
1. **Validate Mentions**: Check user exists before sending notification
2. **Prevent Self-Mentions**: Don't notify users who mention themselves
3. **Sanitize Input**: Validate mention format and content
4. **Handle Errors**: Gracefully handle storage failures
5. **Test Keyboard Nav**: Ensure all keyboard shortcuts work
6. **Mobile Support**: Touch-friendly selection on mobile

## Known Limitations

1. **Offline Storage**: Mentions stored locally; won't sync across devices
2. **User Scope**: Can only mention users who participated in the recording
3. **Edit Mentions**: Can't edit mentions after reply is posted
4. **Delete Cascade**: Deleting annotations doesn't delete related notifications
5. **Case Sensitivity**: Mentions are case-insensitive in search but preserve typed case

## Future Enhancements

### Short-term
- [ ] Edit mentions in existing replies
- [ ] Delete notifications when annotation is deleted
- [ ] Notification sound/browser notification
- [ ] Mention history/autocomplete from recent

### Long-term
- [ ] @team or @all mentions for groups
- [ ] Mention analytics (who mentions who most)
- [ ] Email notifications for mentions
- [ ] Slack/Teams integration for mentions
- [ ] AI-suggested mentions based on context

## Troubleshooting

### Autocomplete Not Showing
**Problem**: Typing `@` doesn't show suggestions
**Solutions**:
- Ensure you're in the reply input (not annotation title)
- Check that recording has participants
- Verify cursor is after the `@` character
- Check browser console for errors

### Mentions Not Highlighted
**Problem**: `@Username` appears as plain text
**Solutions**:
- Verify username matches a participant exactly
- Check regex pattern is working (browser console)
- Refresh the page
- Clear browser cache

### Notifications Not Appearing
**Problem**: Mentioned users don't see notifications
**Solutions**:
- Verify different userId (can't mention yourself)
- Check KV storage is working
- Look for errors in toast messages
- Check browser console for storage errors

### Performance Issues
**Problem**: Slow autocomplete or lag
**Solutions**:
- Limit filtering to 5 suggestions
- Debounce input detection (50ms)
- Use React.memo for suggestion items
- Optimize re-renders with useCallback

## Testing Checklist

- [ ] Type `@` shows autocomplete
- [ ] Filtering works as you type
- [ ] Arrow keys navigate suggestions
- [ ] Enter selects mention
- [ ] Mouse click selects mention
- [ ] Multiple mentions in one message
- [ ] Mentions highlighted in posted reply
- [ ] Notifications created for mentioned users
- [ ] Notification count shown in badge
- [ ] Click notification opens thread
- [ ] Mark as read works
- [ ] Keyboard shortcuts work
- [ ] Mobile touch works
- [ ] Edge cases handled (empty, invalid)
- [ ] Performance acceptable

## API Reference

### extractMentions()
Extracts @username mentions from text.

```typescript
function extractMentions(text: string): string[]
```

**Example**:
```typescript
extractMentions("Hey @John and @Jane, check this")
// Returns: ["John", "Jane"]
```

### createMentionNotification()
Creates a notification object for a mention.

```typescript
function createMentionNotification(
  recipientUserId: string,
  mentionedByUserName: string,
  mentionedByUserColor: string,
  annotationId: string,
  annotationTitle: string,
  messagePreview: string
): MentionNotification
```

### useKV Hook
React hook for persistent storage.

```typescript
const [mentions, setMentions] = useKV<MentionNotification[]>(
  `mentions-${userId}`,
  []
)
```

## Code Examples

### Adding a Mention-aware Input
```typescript
import { MentionInput } from '@/components/MentionInput'

function MyComponent() {
  const [message, setMessage] = useState('')
  const availableUsers = [
    { userId: 'user-1', userName: 'John', userColor: '#ff0000' }
  ]
  
  return (
    <MentionInput
      value={message}
      onChange={setMessage}
      availableUsers={availableUsers}
      placeholder="Type @ to mention..."
    />
  )
}
```

### Processing Mentions in a Reply
```typescript
const handleReply = async () => {
  const mentions = extractMentions(replyContent)
  
  // Create reply
  const reply = {
    content: replyContent,
    mentions,
    userId: currentUserId
  }
  
  // Send notifications
  for (const username of mentions) {
    const user = findUser(username)
    if (user) {
      await notifyUser(user, reply)
    }
  }
}
```

## Support

For issues, questions, or feature requests related to @mentions:
1. Check this documentation
2. Review the [Testing Guide](./MENTIONS_TESTING_GUIDE.md)
3. Check browser console for errors
4. Test in a clean browser profile

---

**Last Updated**: January 2026
**Feature Version**: 1.0
**Status**: ✅ Production Ready
