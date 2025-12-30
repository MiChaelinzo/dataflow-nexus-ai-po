# Real-Time Collaboration Features

## Overview
The Analytics Intelligence Platform now includes comprehensive real-time collaboration capabilities, allowing team members to work together seamlessly while analyzing data and exploring insights. This includes live cursor tracking, presence indicators, and session replay for reviewing past collaboration sessions.

## Key Features

### 🎯 Live Cursor Tracking
- **Real-time cursor visualization**: See where your teammates are pointing in real-time
- **Color-coded cursors**: Each user has a unique color for easy identification
- **Name labels**: Hover indicators show which team member is collaborating
- **Smooth animations**: Cursor movements are fluid and natural, updating every 50ms

### 👥 Active User Presence
- **Live presence indicator**: See who's currently viewing the dashboard
- **User avatars**: Color-coded avatars with initials in the header
- **Activity status**: Real-time updates showing active vs. inactive users
- **View tracking**: Know which dashboard section each user is viewing

### 📍 Location Awareness
- **Current view display**: Track which tab/section each user is on
- **Last seen timestamps**: Know when users were last active
- **Automatic cleanup**: Inactive users (5+ minutes) are automatically removed
- **Presence heartbeat**: Activity updates every 10 seconds

### 🎬 Session Replay & Recording (NEW!)
- **Full session recording**: Capture all collaboration activities for later review
- **Cursor playback**: Watch exactly how team members navigated and collaborated
- **Event timeline**: Detailed log of clicks, scrolls, tab changes, and interactions
- **Playback controls**: Play, pause, seek, and adjust speed (0.5x to 2x)
- **Multi-user visualization**: See all participants' cursors during replay
- **Training & documentation**: Perfect for onboarding and workflow analysis
- **Persistent storage**: Recordings saved for future reference

### 🎨 Visual Design
- **Distinct user colors**: 8 carefully chosen colors from the oklch palette
- **Animated transitions**: Smooth entry/exit animations for cursors and presence
- **Responsive indicators**: Adapts to different screen sizes
- **Glassmorphic UI**: Modern, polished collaboration panel design

## Technical Implementation

### Architecture
The collaboration system is built using:
- **Spark KV Store**: Persistent, real-time data synchronization
- **React Hooks**: Custom `useCollaboration` hook for state management
- **Framer Motion**: Smooth animations and transitions
- **TypeScript**: Full type safety across all components

### Components

#### `useCollaboration` Hook
Location: `/src/hooks/use-collaboration.ts`

Manages all collaboration state including:
- User presence tracking
- Cursor position updates
- Automatic inactivity detection
- Cleanup of stale user data

```typescript
const { currentUser, cursors, activeUsers } = useCollaboration({
  currentView: 'dashboard',
  enabled: true
})
```

#### `LiveCursor` Component
Location: `/src/components/LiveCursor.tsx`

Renders individual user cursors with:
- SVG cursor icon
- User name label
- Smooth positioning
- Entry/exit animations

#### `PresenceIndicator` Component
Location: `/src/components/PresenceIndicator.tsx`

Shows active users in the header:
- Stacked avatar display
- Overflow count (+N)
- Active indicator badges
- Hover interactions

#### `CollaborationPanel` Component
Location: `/src/components/CollaborationPanel.tsx`

Full collaboration interface featuring:
- Active users list
- Search functionality
- Current view tracking
- User information display
- Your profile card

#### `CollaborationDemo` Component
Location: `/src/components/CollaborationDemo.tsx`

Demo mode that simulates multiple users:
- 4 simulated users with different colors
- Animated cursor movements
- Random position updates
- Easy toggle on/off

## User Experience

### For Individual Users
1. **Automatic setup**: No configuration needed - each user gets a unique ID and color
2. **Persistent identity**: User info stored in localStorage for consistency
3. **Privacy-focused**: Only cursor position and view location are shared
4. **Lightweight**: Minimal performance impact with throttled updates

### For Teams
1. **Awareness**: Know who's viewing what in real-time
2. **Coordination**: See where colleagues are focusing
3. **Engagement**: Feel connected even when working remotely
4. **Discovery**: Find out what sections teammates find interesting

## Demo Mode

The platform includes a built-in demo mode to showcase collaboration features:

1. Navigate to the **Collaborate** tab
2. Click **Start Demo** in the Collaboration Panel
3. Watch as 4 simulated users appear with moving cursors
4. Observe the presence indicators update in the header
5. Click **Stop Demo** to clean up

Simulated users:
- **Alex Rivera** (Teal) - Viewing Dashboard
- **Sam Chen** (Purple) - Viewing AI Insights
- **Jordan Lee** (Green) - Viewing Predictions
- **Morgan Taylor** (Yellow) - Viewing Tableau

## Data Persistence

All collaboration data is stored in Spark's KV store:

### Key: `user-presence`
Structure:
```typescript
{
  [userId: string]: {
    userId: string
    userName: string
    userColor: string
    currentView: string
    isActive: boolean
    lastSeen: number
    cursor?: {
      userId: string
      userName: string
      userColor: string
      x: number
      y: number
      timestamp: number
    }
  }
}
```

### Automatic Cleanup
- Users inactive for 30 seconds: Marked as inactive
- Users inactive for 5 minutes: Removed from presence
- Cleanup runs every 60 seconds

## Performance Optimization

### Throttling
- Mouse movements throttled to 50ms intervals
- Presence updates sent every 10 seconds
- Cursor rendering optimized with Framer Motion

### Memory Management
- Automatic cleanup of stale data
- Efficient state updates using functional setters
- Minimal re-renders with React.memo patterns

### Network Efficiency
- Only active cursor positions are stored
- Delta updates instead of full state replacement
- Inactive users don't generate updates

## Integration Points

The collaboration system integrates with:

1. **Main App Component**: Presence indicator in header
2. **All Dashboard Tabs**: View tracking across sections
3. **Collaboration Hub**: Full-featured collaboration interface
4. **Team Management**: User roster and permissions

## Browser Compatibility

Tested and working on:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

Requires:
- JavaScript enabled
- localStorage access
- Modern CSS support (CSS Grid, Flexbox, oklch colors)

## Future Enhancements

Potential improvements for future iterations:

1. **Pointer Events**: Click and selection sharing
2. **Annotations**: Pin comments to specific locations
3. **Follow Mode**: Follow a user's navigation
4. **Laser Pointer**: Temporary attention highlighting
5. **Video Avatars**: Optional webcam integration
6. **Voice Chat**: In-app audio communication
7. **Screen Sharing**: Share specific dashboard views
8. **Replay Mode**: Record and replay collaboration sessions

## Security & Privacy

### Data Handling
- No personal information collected beyond what users provide
- Cursor positions are ephemeral (auto-deleted after 5 minutes)
- All data stored client-side in Spark KV
- No third-party analytics or tracking

### User Control
- Users can see all active collaborators
- Demo mode clearly labeled
- Activity status visible to user
- No hidden tracking or monitoring

## API Reference

### `useCollaboration(options)`

**Parameters:**
- `currentView` (string): Current dashboard section
- `enabled` (boolean): Enable/disable tracking

**Returns:**
```typescript
{
  currentUser: {
    userId: string
    userName: string
    userColor: string
  }
  cursors: CursorPosition[]
  activeUsers: UserPresence[]
  updatePresence: (updates: Partial<UserPresence>) => void
}
```

### Types

See `/src/lib/types.ts` for full type definitions:
- `CursorPosition`
- `UserPresence`

## Troubleshooting

### Cursors Not Showing
1. Check that collaboration is enabled in `useCollaboration`
2. Verify multiple users/demo mode is active
3. Check browser console for errors
4. Clear localStorage and refresh

### Performance Issues
1. Reduce number of simultaneous users
2. Check for conflicting animations
3. Disable demo mode if active
4. Clear old presence data

### User Not Appearing
1. Verify localStorage is accessible
2. Check network connectivity
3. Ensure KV store is working
4. Try refreshing the page

## Credits

Built with:
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Framer Motion** - Animations
- **Spark Runtime** - KV persistence
- **Phosphor Icons** - Icon library
- **Tailwind CSS** - Styling

---

**Version**: 1.0.0
**Last Updated**: January 2026
**Tableau Hackathon 2026 Entry**
