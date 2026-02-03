# 🛡️ API Rate Limit - User Guide

## What Are Rate Limits?

Rate limits prevent the application from making too many API requests in a short time. Think of it like a speed limit for API calls - it keeps everything running smoothly and prevents overload.

## Current Limits

- **8 requests per minute** across all AI features
- **Minimum 3 seconds** between any two requests
- **Automatic queuing** when multiple requests are made

## Which Features Use Rate Limits?

### Limited Features (Use API Calls):
- 🔮 **Tableau Pulse** - "Generate Insight" button
- ✨ **AI Insights** - "Generate Insights" button  
- 🌤️ **Seasonal Insights** - "Refresh Analysis" button

### Unlimited Features (No API Calls):
- 📊 **Dashboard** - View metrics and charts
- 📁 **Workspaces** - Manage workspaces
- 🤝 **Shared Dashboards** - Share and collaborate
- 📤 **Export** - Export data to CSV/Excel
- 📅 **Scheduled Exports** - Schedule automatic exports
- 📈 **Activity** - View activity feed
- 🎨 **Tableau** - View embedded dashboards
- 🔮 **Predictions** - View forecast charts (pre-generated)
- 🔍 **Semantic** - Browse data catalog
- 🔒 **Governance** - View governance dashboard
- 👥 **Collaborate** - Real-time collaboration
- 📹 **Replay** - Session recording and playback
- 📄 **Reports** - Build and view reports
- ⚖️ **Compare** - Compare metrics and YoY

## How To Use AI Features Safely

### ✅ Best Practices

1. **Wait Between Requests**
   - After clicking any "Generate" button, wait at least 3 seconds
   - The button will show remaining requests when < 5 left
   - Example: `Generate Insight (4/8)` means 4 requests remaining

2. **Plan Your Requests**
   - Instead of rapidly clicking, think about what insight you want
   - Use one feature at a time
   - Space out your requests across different tabs

3. **Use Manual Triggers**
   - Seasonal Insights no longer auto-generates
   - You control when to make API calls
   - Click "Refresh Analysis" only when you need new data

4. **Watch The Indicators**
   - Button shows remaining count when low
   - Disabled buttons mean you're at the limit
   - Wait time displayed in error messages

### ❌ What To Avoid

1. **Don't Spam Click**
   - Clicking 10 times won't make it faster
   - Requests are queued anyway
   - You'll hit the rate limit

2. **Don't Use Multiple Features Simultaneously**
   - All features share the same 8-request pool
   - Generate insights in Pulse OR AI Insights, not both at once
   - Wait for one to finish before using another

3. **Don't Refresh Unnecessarily**
   - Seasonal Insights doesn't need constant refreshing
   - AI Insights persist - you can review them later
   - Page refresh doesn't give you more requests

## What Happens When You Hit The Limit?

### Friendly Error Message
```
⚠️ Rate limit reached
Please wait 30 seconds before generating more insights.
```

### What You'll See:
- Clear error message with exact wait time
- Button stays disabled until cooldown finishes
- Other tabs and features continue working normally
- You can view existing data while waiting

### What To Do:
1. ✅ **Wait** - Check the error message for wait time (usually 30-60 seconds)
2. ✅ **Use Other Features** - Browse dashboards, export data, view reports
3. ✅ **Review Existing Insights** - Re-read previous AI-generated insights
4. ✅ **Plan Next Request** - Think about what insight you want next
5. ❌ **Don't Refresh** - Page refresh doesn't help and loses your data

## Request Counter Guide

### What The Numbers Mean:
- `(8/8)` = Full capacity, all requests available
- `(5/8)` = 5 requests left (counter starts showing at < 5)
- `(1/8)` = Only 1 request left, use wisely!
- `(0/8)` = At limit, button disabled, wait for cooldown

### When Counter Shows:
- Counter is **hidden** when you have 5+ requests (plenty available)
- Counter **appears** when you drop below 5 requests (getting low)
- Counter is **red/warning** when at 1-2 requests (almost at limit)

## Recovery Tips

### If You Get A 429 Error:

1. **Stay Calm** 😌
   - This is normal and expected behavior
   - The system is protecting itself
   - Everything will work again soon

2. **Check The Message** 📝
   - Look for the wait time: "Please wait X seconds"
   - Typical wait times: 30-60 seconds
   - Timer starts from the error, not from when you wait

3. **Use Other Features** 🎯
   - Switch to Dashboard tab - view your metrics
   - Export data to CSV/Excel - no rate limits
   - Review existing insights - they're still there
   - Check Activity feed - see what your team is doing

4. **Wait The Full Time** ⏰
   - If it says 30 seconds, wait 30 seconds
   - No need to stare at it - use the time productively
   - Browser notifications or set a timer if needed

5. **Try Again** 🔄
   - After waiting, click "Try Again" or the generate button
   - Should work immediately
   - If not, wait a bit longer (maybe 60s total)

### If Issues Persist:

**Try These Steps:**
```
1. Wait 60 seconds (full minute)
2. Clear browser cache (Ctrl+Shift+Delete)
3. Try in incognito/private window
4. Clear local storage: F12 → Console → localStorage.clear()
5. Refresh the page (as last resort)
```

## Advanced: Request Queue

### How It Works:
When you make multiple requests quickly, they're automatically queued:

```
You click: Generate → Generate → Generate
System does: Request 1 → Wait 3s → Request 2 → Wait 3s → Request 3
You see: All three insights generated, properly spaced
```

### Benefits:
- ✅ No need to manually wait between clicks
- ✅ Requests execute in order
- ✅ Automatic spacing prevents errors
- ✅ Transparent to you

### Limitations:
- Queue is in-memory (lost on page refresh)
- Maximum of 8 queued requests (rate limit)
- Each still takes 3+ seconds to execute

## Tips For Heavy Users

### If You Use AI Features Frequently:

1. **Batch Your Questions**
   - Instead of generating 10 separate insights, think of the most valuable 3-4
   - Quality over quantity

2. **Use Existing Data**
   - Review already-generated insights
   - Check if your question is already answered
   - Insights persist between sessions

3. **Time Your Usage**
   - Wait for counter to reset (60 seconds)
   - Use features during low-demand times
   - Plan requests in advance

4. **Leverage Non-AI Features**
   - Dashboard visualizations
   - Manual data exploration
   - Exports and reports
   - These have no rate limits

## FAQ

**Q: Why do rate limits exist?**
A: To prevent API abuse, control costs, and ensure fair usage for all users.

**Q: Can I increase my rate limit?**
A: The limits are set at the application level. Everyone shares the same pool.

**Q: What if I really need more insights quickly?**
A: Use the existing insights, export data for offline analysis, or wait for the cooldown.

**Q: Do limits reset daily?**
A: No, they reset every 60 seconds on a rolling window. If you used 8 requests, wait 60s and you have 8 more.

**Q: Why can't I just refresh the page?**
A: Rate limits are tracked server-side. Refreshing doesn't help and you'll lose unsaved work.

**Q: What if I get an error but haven't used the feature?**
A: Rate limits are shared across all users in some cases. Could be backend API limits.

**Q: How do I know when I can request again?**
A: The error message tells you exactly: "Please wait X seconds"

**Q: Can I queue unlimited requests?**
A: No, the queue respects the rate limit. Maximum 8 requests in the queue.

## Support

If you continue experiencing issues after following this guide:

1. **Check the documentation**: `RATE_LIMIT_FIXES.md` for technical details
2. **Review the summary**: `CODE_REVIEW_SUMMARY.md` for overview
3. **Open browser console**: F12 → Console tab → Look for errors
4. **Note the pattern**: When does it happen? What were you doing?
5. **Report the issue**: Include console logs and reproduction steps

---

## Remember:

- 🎯 **You control when API calls happen** - All AI features are manual triggers now
- ⏰ **3 seconds between requests** - Automatic, but good to know
- 🔢 **8 requests per minute** - Generous limit for normal usage
- 🛡️ **Other features unaffected** - Most features don't use rate limits
- 🔄 **Recovery is automatic** - Just wait and try again

**Use the AI features thoughtfully and you'll never hit the limits!** 🚀
