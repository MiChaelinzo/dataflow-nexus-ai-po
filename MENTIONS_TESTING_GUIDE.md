# @Mentions Testing Guide

## Overview
This guide walks through testing the @mentions feature in annotation replies within the Session Replay tab. The @mentions feature allows team members to notify specific users by mentioning them in annotation discussions.

## Features Tested
1. **@Mention Autocomplete**: Type `@` to see a list of available team members
2. **Smart Filtering**: Start typing a name after `@` to filter suggestions
3. **Keyboard Navigation**: Use arrow keys and Enter to select mentions
4. **Visual Highlighting**: Mentioned users are highlighted with their user color
5. **Notification System**: Mentioned users receive notifications

## Step-by-Step Testing Instructions

### Step 1: Navigate to the Replay Tab
1. Open the Analytics Intelligence Platform
2. Click on the **"Replay"** tab (last tab with VideoCamera icon)
3. You should see the Session Replay interface

### Step 2: Create a Recording Session (if none exists)
1. Click **"Start Recording"** button
2. Enter a session title (e.g., "Testing @Mentions Feature")
3. Click **"Start Recording"**
4. Navigate between different tabs (Dashboard, Insights, etc.)
5. Click **"Stop Recording"** after 30+ seconds
6. The recording will appear in the Recordings tab

### Step 3: Open a Recording for Playback
1. Switch to the **"Recordings"** tab within the Replay section
2. Click the **"Play"** button on any recording card
3. The Session Playback Viewer will open in a full-screen overlay

### Step 4: Add an Annotation
1. In the Playback Viewer, click **"Add Annotation"** button (top right panel)
2. Fill in the annotation details:
   - **Title**: "Discussion point" (or any title)
   - **Category**: Select a category (e.g., "Question", "Issue", "Idea")
   - **Description**: Add context (optional)
3. Click **"Add Annotation"**
4. The annotation will appear in the "Notes" tab and on the timeline

### Step 5: Open Annotation Thread
1. Click on the **"Notes"** tab in the right panel
2. Click on any annotation card to open its thread
3. A slide-out panel will appear on the right with the full annotation details

### Step 6: Test @Mentions - Basic Autocomplete
1. In the reply input box at the bottom, type `@`
2. A suggestion dropdown should appear showing available team members
3. Observe:
   - Each user shown with avatar circle (colored background)
   - User name and user ID displayed
   - Up to 5 suggestions shown

### Step 7: Test @Mentions - Filtering
1. Continue typing after `@` (e.g., `@User`)
2. The suggestion list should filter to show only matching names
3. The filtering is case-insensitive

### Step 8: Test @Mentions - Keyboard Selection
1. Type `@` to show suggestions
2. Use **Arrow Down** key to move to the next suggestion
3. Use **Arrow Up** key to move to the previous suggestion
4. Press **Enter** to select the highlighted suggestion
5. The mention should be inserted as `@Username ` (with a space after)

### Step 9: Test @Mentions - Mouse Selection
1. Type `@` to show suggestions
2. Click on any user in the suggestion list
3. The mention should be inserted into the text

### Step 10: Test @Mentions - Multiple Mentions
1. In the reply box, type a message like:
   ```
   @User123 @User456 Can you both review this?
   ```
2. Each `@` should trigger the autocomplete
3. Select different users for each mention

### Step 11: Test Reply with @Mentions
1. Complete your reply message with one or more mentions
2. Click **"Reply"** button or press **Cmd/Ctrl+Enter**
3. Observe:
   - Reply appears in the thread
   - Success toast shows "Reply added and X people notified"
   - Mentioned usernames are highlighted in the reply

### Step 12: Test Mention Visual Highlighting
1. Look at the posted reply in the thread
2. Each `@Username` should be:
   - Highlighted with a colored background
   - Displayed in the mentioned user's color (if they're a participant)
   - Using accent color with light background

### Step 13: Test Mention Notifications
1. Check the notification bell icon in the top header
2. If you're testing with the mentioned user ID, click the notification icon
3. You should see a notification for the mention with:
   - Who mentioned you
   - The annotation title
   - A preview of the message
   - Time of the mention

### Step 14: Test Edge Cases

#### Empty Mention
1. Type `@` followed by a space without selecting anyone
2. The suggestion dropdown should close
3. The `@` symbol remains as plain text

#### Invalid Username
1. Type `@NonExistentUser` (user not in the list)
2. No suggestions should appear
3. The text remains as plain text

#### Mention at Start
1. Start your reply with `@Username` immediately
2. Autocomplete should still work

#### Mention at End
1. End your reply with `@Username`
2. Autocomplete should still work

#### Multiple @ Symbols
1. Type something like "Email me at user@example.com and @Username"
2. Only `@Username` with a word after it should trigger autocomplete

### Step 15: Test Reply Without Mentions
1. Add a reply without using `@` mentions
2. Click **"Reply"**
3. Success toast should say "Reply added" (without notification count)

## Expected Behavior Summary

### Autocomplete Dropdown
- ✅ Appears immediately when typing `@`
- ✅ Shows user avatar circles with colors
- ✅ Displays user names and IDs
- ✅ Filters results as you type
- ✅ Highlights selected item
- ✅ Shows "Enter" hint on selected item
- ✅ Closes on Escape key
- ✅ Closes when mention is complete

### Keyboard Controls
- ✅ **Arrow Down**: Next suggestion
- ✅ **Arrow Up**: Previous suggestion
- ✅ **Enter**: Select highlighted (when dropdown open)
- ✅ **Cmd/Ctrl+Enter**: Send reply (when dropdown closed)
- ✅ **Escape**: Close dropdown

### Visual Feedback
- ✅ Mentioned usernames highlighted with color
- ✅ User color applied if participant in session
- ✅ Accent color background on mentions
- ✅ Smooth animations

### Notifications
- ✅ Notification created for each mentioned user
- ✅ Notification includes mention context
- ✅ Toast shows notification count
- ✅ Notifications appear in header bell icon

## Code Components Involved

### Primary Components
- **`AnnotationThread.tsx`**: Main thread UI with reply functionality
- **`MentionInput.tsx`**: Custom input with @mention autocomplete
- **`MentionNotifications.tsx`**: Notification system for mentions
- **`SessionPlaybackViewer.tsx`**: Playback viewer containing annotations

### Helper Functions
- **`extractMentions()`**: Extracts @username patterns from text
- **`createMentionNotification()`**: Creates notification objects
- **`sendMentionNotifications()`**: Async function to send notifications

### Data Storage
- **`useKV`**: React hook for persistent storage
- **`spark.kv`**: Direct API for key-value storage
- **Storage Key**: `mentions-{userId}` for each user's notifications

## Testing Checklist

- [ ] Navigate to Replay tab
- [ ] Create a recording session
- [ ] Add an annotation to recording
- [ ] Open annotation thread
- [ ] Type `@` to trigger autocomplete
- [ ] Filter suggestions by typing
- [ ] Select mention with keyboard (arrows + Enter)
- [ ] Select mention with mouse click
- [ ] Add multiple mentions in one reply
- [ ] Send reply with mentions
- [ ] Verify visual highlighting of mentions
- [ ] Check notification count in toast
- [ ] View notification in header
- [ ] Test empty mentions edge case
- [ ] Test reply without mentions
- [ ] Verify mentions persist after page refresh

## Troubleshooting

### Autocomplete Not Appearing
- Check that you're typing `@` in the reply input (not title/description)
- Ensure there are participants in the recording
- Try clicking in the input and typing `@` again

### Mentions Not Highlighted
- Check that the mentioned username matches a participant
- Refresh the page to see if highlighting appears
- Check browser console for errors

### No Notifications Received
- Verify the mentioned user is different from current user
- Check that notifications are enabled
- Look for notifications under the bell icon in header
- Check browser console for storage errors

## Additional Notes

- The @mention feature only works within annotation replies (not in the initial annotation)
- Only recording participants can be mentioned
- Mentions are case-insensitive but stored as typed
- Notifications persist across sessions using KV storage
- The feature integrates with the existing notification system
- Self-mentions (mentioning yourself) don't create notifications

## Demo Scenarios

### Scenario 1: Code Review Discussion
```
@Sarah can you check this metric calculation? The values seem off.
```

### Scenario 2: Multi-Person Question
```
@John @Mike @Lisa - Do we need to update this dashboard before the meeting?
```

### Scenario 3: Follow-up Request
```
Thanks for the explanation! @David can you document this in the wiki?
```

## Success Criteria
✅ All checklist items completed
✅ No console errors during testing
✅ Smooth user experience with autocomplete
✅ Notifications delivered successfully
✅ Mentions persist across page refreshes
✅ Visual styling matches design system
