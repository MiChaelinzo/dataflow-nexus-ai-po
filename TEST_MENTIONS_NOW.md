# ⚡ Test @Mentions Feature RIGHT NOW!

## 🎯 Goal
Demonstrate the @mentions feature in annotation replies during session replay playback.

---

## ✅ 4 Simple Steps (30 seconds total)

### 1️⃣ **Navigate to Replay Tab** (5 sec)
- Click the **"Replay"** tab at the top (last tab, has a camera/video icon 🎥)

### 2️⃣ **Create Demo Recording** (10 sec)
- Look for the blue card titled **"Test @Mentions Feature"**
- Click the big button: **"Start Demo Recording with Sample Data"**
- Click **"Recordings"** sub-tab (appears automatically or manually switch)
- You'll see a recording titled: **"🎯 Demo Session - Test @Mentions Here"** with a sparkly ✨ Demo badge

### 3️⃣ **Play the Recording** (5 sec)
- Click the **"Play"** button on the demo recording card
- Full-screen playback viewer opens

### 4️⃣ **Test @Mentions** (10 sec)
- Click the pulsing **"Add Annotation"** button (top right area)
- Enter any title (e.g., "Question about metrics")
- Select a category (e.g., "Question")
- Click **"Add Annotation"**
- Click **"Notes"** tab in right panel
- Click your annotation to open the thread (slides in from right)
- In the reply box, type: `Hey @Alice can you review this?`
- Watch the autocomplete dropdown appear when you type `@`
- Use arrow keys or mouse to select **Alice** from the list
- Click **"Reply"** or press Cmd/Ctrl+Enter

### ✨ What You'll See
- Toast notification: "🎉 Reply sent with mentions! Notified 1 person: @Alice"
- Reply appears in thread with **@Alice** highlighted in purple
- Bell icon in header updates (shows notification was created)

---

## 🎬 Demo Recording Details

The demo recording includes these participants you can @mention:

| Name | Username | Avatar Color | Try This |
|------|----------|-------------|----------|
| Alice | user-001 | Purple 🟣 | `@Alice` |
| Bob | user-002 | Blue 🔵 | `@Bob` |
| Charlie | user-003 | Green 🟢 | `@Charlie` |
| You | (current) | (your color) | `@YourName` |

---

## 🎯 What to Test

### ✅ Basic @Mention
```
@Alice can you check this metric?
```

### ✅ Multiple @Mentions
```
@Alice @Bob @Charlie please review the dashboard
```

### ✅ Autocomplete Features
- Type `@` → See all 4 users
- Type `@Al` → Filters to just Alice
- Use `↓` and `↑` arrow keys to navigate
- Press `Enter` to select
- Press `Esc` to close dropdown

### ✅ Visual Features
- Mentioned names appear with colored backgrounds
- Each user's color matches their avatar
- Notification toast shows count of people notified
- Thread updates in real-time
- Bell icon shows notification badge

---

## 📱 Where Everything Is Located

```
┌─────────────────────────────────────────────────────┐
│ Analytics Intelligence Platform          🔔 Bell    │ ← Notification icon
├─────────────────────────────────────────────────────┤
│ Dashboard │ Tableau │ ... │ [Replay] ← Click here  │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────┐      │
│  │ 🎯 Test @Mentions Feature                │      │
│  │                                           │      │
│  │ [Start Demo Recording] ← Click this!     │      │
│  └──────────────────────────────────────────┘      │
│                                                      │
│  About │ [Recordings (1)] ← Then click here        │
│                                                      │
│  ┌──────────────────────────────────────────┐      │
│  │ ✨ Demo  🎯 Demo Session - Test...       │      │
│  │ Just now • 1m 0s                         │      │
│  │ 4 participants • 7 events        [Play]  │ ← Click
│  └──────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────┘
```

---

## 🎉 Success Indicators

You know it's working when you see:

1. ✅ **Dropdown appears** when typing `@`
2. ✅ **Users are listed** with colored avatars
3. ✅ **Filtering works** as you type after `@`
4. ✅ **Selection inserts** `@Username ` into text
5. ✅ **Toast shows** "🎉 Reply sent with mentions!"
6. ✅ **Mentions highlighted** in the posted reply
7. ✅ **Bell icon updates** with notification badge

---

## 🆘 Troubleshooting

**Q: Don't see the Replay tab?**
- Scroll the tab bar if needed (might be at the far right)
- Look for a camera/video icon

**Q: Demo recording button not visible?**
- Make sure you're on the "About" sub-tab within Replay
- Scroll to the top of the page

**Q: Autocomplete not appearing?**
- Make sure you're typing in the **reply box** (at bottom of thread)
- Type `@` and wait a moment
- Click in the input and try again

**Q: Can't find the annotation after adding it?**
- Click the **"Notes"** tab in the right panel
- Your annotation should be listed there
- Click it to open the thread

**Q: Demo recording not showing?**
- Check the **"Recordings"** sub-tab
- Look for title with emoji: "🎯 Demo Session..."
- Refresh the page if needed

---

## 📚 More Information

- **Quick Guide**: [MENTIONS_QUICK_TEST.md](./MENTIONS_QUICK_TEST.md)
- **Full Testing Guide**: [MENTIONS_TESTING_GUIDE.md](./MENTIONS_TESTING_GUIDE.md)
- **Feature Documentation**: [MENTIONS_FEATURE_DOCS.md](./MENTIONS_FEATURE_DOCS.md)
- **Implementation Summary**: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

---

## 💡 Pro Tips

1. **Try keyboard shortcuts**: Arrow keys + Enter is faster than mouse
2. **Test multiple mentions**: Mention all 3 users in one message
3. **Check notifications**: Click the bell icon to see the notification center
4. **Explore the thread**: Add multiple replies to see the conversation grow
5. **Speed adjustment**: Use playback speed controls (0.5x - 2x)

---

**🚀 Ready? Go to the Replay tab and click that demo button! You're 30 seconds away from seeing @mentions in action!**
