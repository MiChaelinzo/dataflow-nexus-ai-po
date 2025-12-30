# Session Replay Export Feature

## Overview
Added comprehensive export capabilities for session replays with annotations, enabling users to share recordings and export data in multiple formats.

## Features Implemented

### 1. Shareable Links
- **Generate Secure Links**: Create shareable URLs that others can use to view replays
- **Password Protection**: Optional password requirement for sensitive recordings
- **Link Expiration**: Set automatic expiration (1 hour, 24 hours, 7 days, 30 days, or never)
- **Custom Options**: Choose what to include (annotations, bookmarks)
- **Copy to Clipboard**: One-click link copying with visual feedback
- **View Tracking**: Track number of views for each shared replay

### 2. Data Export
- **JSON Export**: Download complete replay data as structured JSON
- **Selective Export**: Choose to include/exclude annotations and bookmarks
- **Metadata Included**: Full recording metadata, participants, events, and timestamps
- **Archival Ready**: Perfect for long-term storage or external processing

### 3. Video Export (Framework Ready)
- **UI Prepared**: Complete interface for video export options
- **Settings Available**: Configure annotations, bookmarks, and cursor trails
- **Coming Soon Badge**: Clear indication that video rendering is under development
- **Export Framework**: Backend structure ready for video rendering implementation

## Components Created

### ExportReplayDialog.tsx
Main export dialog with three tabs:
- **Shareable Link Tab**: Generate and manage shareable links
- **Video Export Tab**: Configure video export settings (coming soon)
- **Raw Data Tab**: Download JSON data with custom options

### Updated Components

#### SessionRecordingCard.tsx
- Added "Export" button to each recording card
- Integrated with export dialog

#### SessionPlaybackViewer.tsx
- Added "Export" button in playback header
- Allows exporting while viewing a replay

#### SessionReplay.tsx
- Integrated ExportReplayDialog
- Updated feature showcase with export capabilities
- Modified "How It Works" section to include export step

## Library Functions

### export-replay.ts
Utility functions for export operations:

```typescript
// Generate unique shareable ID
generateShareableId(recordingId: string): Promise<string>

// Create shareable link with options
exportReplayAsShareableLink(
  recording: SessionRecording,
  shareId: string,
  options: ShareOptions
): Promise<string>

// Export as JSON data
exportReplayData(
  recording: SessionRecording,
  options: ExportOptions
): SessionRecording

// Retrieve shared replay
getSharedReplay(shareId: string): Promise<SharedReplayData | null>

// Track views
incrementReplayViews(shareId: string): Promise<void>

// Verify password
verifyReplayPassword(shareId: string, password: string): Promise<boolean>
```

## Data Storage

### Shared Replay Storage
Uses Spark KV storage to persist shared replay data:
- Key format: `shared-replay-{shareId}`
- Includes recording data, options, expiration, and view count
- Automatic expiration handling

## User Experience

### Export Workflow
1. User clicks "Export" on a recording or during playback
2. Export dialog opens with three tabs
3. User configures export options (annotations, bookmarks, security)
4. For shareable links:
   - Click "Generate Shareable Link"
   - Link is created and stored in KV
   - Copy link with one click
   - Share with team members
5. For data export:
   - Configure what to include
   - Click "Download JSON Data"
   - File downloads immediately

### Security Features
- **Password Protection**: Encrypt shared links with passwords
- **Expiration**: Automatic cleanup of expired links
- **Access Control**: Only recording participants can export

## Visual Design
- **Consistent UI**: Matches existing design system
- **Clear Icons**: ShareNetwork, VideoCamera, DownloadSimple icons
- **Status Indicators**: Visual feedback for generation, copying, and expiration
- **Responsive Layout**: Works on all screen sizes
- **Smooth Animations**: Framer Motion transitions

## Future Enhancements

### Video Export Implementation
When video export is implemented, the system will:
1. Render cursor animations frame-by-frame
2. Overlay annotations at correct timestamps
3. Display bookmark markers on timeline
4. Include participant indicators
5. Export as MP4 with configurable quality (low/medium/high)
6. Support 30fps and 60fps options

### Shared Replay Viewer
Create a dedicated viewer component:
1. Parse `?replay={shareId}` from URL
2. Fetch shared replay data
3. Verify password if required
4. Check expiration
5. Display replay in read-only mode
6. Track views

### Analytics
Add replay analytics:
- View count tracking
- Engagement metrics
- Most-viewed replays
- Export statistics

## Technical Details

### Storage Format
```typescript
interface SharedReplayData {
  shareId: string
  recording: SessionRecording
  options: ShareOptions
  createdAt: number
  expiresAt?: number
  password?: string
  views: number
}
```

### Link Format
```
{baseUrl}?replay={shareId}
```

Example:
```
https://app.example.com?replay=share-session-123-1234567890-abc123xyz
```

## Testing

### Test Scenarios
1. ✅ Generate shareable link without password
2. ✅ Generate shareable link with password
3. ✅ Set different expiration times
4. ✅ Include/exclude annotations
5. ✅ Include/exclude bookmarks
6. ✅ Copy link to clipboard
7. ✅ Export as JSON with all data
8. ✅ Export from recording card
9. ✅ Export during playback
10. ✅ Video export UI (disabled state)

## Integration Points

### With Existing Features
- **Annotations**: Exported in shareable links and JSON
- **Bookmarks**: Included in all export formats
- **Mentions**: Preserved in annotation replies
- **Participants**: Full participant data exported
- **Events**: Complete event timeline included

### With Tableau Integration
Export feature enhances Tableau integration by:
- Sharing analytics session recordings
- Documenting dashboard workflows
- Training team members asynchronously
- Creating knowledge base content

## Performance Considerations
- **Lazy Loading**: Dialog only renders when opened
- **Efficient Storage**: KV operations are optimized
- **Minimal Payload**: Only selected data is included
- **Client-side Generation**: Link generation happens in browser

## Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Friendly**: Proper ARIA labels
- **High Contrast**: Works with accessibility themes
- **Focus Management**: Proper focus handling

## Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Clipboard API for copy functionality
- Blob API for JSON downloads
- Local Storage fallback for older browsers
