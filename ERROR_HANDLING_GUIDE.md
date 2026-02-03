# Error Handling & Rate Limiting Guide

## Overview

The Analytics Intelligence Platform includes comprehensive error handling and rate limiting to prevent API errors (especially 429 rate limit errors) from affecting the user experience or causing cascading failures across the application.

## Rate Limiting System

### How It Works

The platform implements a client-side rate limiter that tracks API requests to prevent exceeding service limits:

- **Max Requests**: 5 requests per 60-second window
- **Automatic Tracking**: Every LLM API call is logged and tracked
- **Smart Reset**: Rate limits automatically reset after 60 seconds
- **Visual Feedback**: Users see remaining quota before making requests

### Implementation Details

Located in `/src/lib/rate-limiter.ts`:

```typescript
export class RateLimiter {
  private requests: number[] = []
  private config: RateLimiterConfig

  canMakeRequest(): boolean
  recordRequest(): void
  getTimeUntilNextRequest(): number
  getRemainingRequests(): number
  reset(): void
}
```

### Features Protected

1. **Tableau Pulse** (Pulse Tab)
   - AI insight generation
   - Real-time quota indicator
   - Disabled button when quota exhausted

2. **AI Insights** (AI Insights Tab)
   - Batch insight generation
   - Progress tracking with quota awareness
   - Graceful degradation on errors

3. **Other AI Features**
   - All LLM-powered components share the same rate limiter
   - Consistent user experience across the platform

## Error Handling Strategy

### Error Types Handled

#### 1. Rate Limit Errors (429)
**Symptom**: `429` status code or "rate limit" in error message

**Handling**:
- Display user-friendly toast notification
- Show countdown timer (e.g., "Please wait 30 seconds...")
- Reset rate limiter to clear tracked requests
- Disable generate buttons until quota refreshes

**User Experience**:
```
❌ API rate limit reached
Please wait 60 seconds before generating more insights.
```

#### 2. Network Errors
**Symptom**: "network" or "fetch" in error message

**Handling**:
- Display connectivity error message
- Suggest user actions (check connection, retry)
- Don't reset rate limiter (it's not a quota issue)

**User Experience**:
```
❌ Network error
Please check your connection and try again
```

#### 3. Generic Errors
**Symptom**: Any other unexpected error

**Handling**:
- Log full error to console for debugging
- Display generic but helpful error message
- Encourage retry without overwhelming the user

**User Experience**:
```
❌ Failed to generate insight
An unexpected error occurred. Please try again later.
```

### Error Boundaries

The application uses React Error Boundaries to prevent component crashes from taking down the entire app:

- **Located**: `/src/ErrorFallback.tsx`
- **Scope**: Wraps the entire application
- **Fallback UI**: Shows error details with "Try Again" button
- **Development**: Errors are rethrown to show helpful dev dialogs

## User-Facing Features

### Visual Indicators

1. **Quota Badge**
   - Shows remaining requests (e.g., "3/5")
   - Only visible when quota is low (< 5 requests remaining)
   - Updates in real-time every second

2. **Disabled States**
   - Buttons automatically disable when quota = 0
   - Clear visual feedback (grayed out, no hover effects)
   - Prevents frustrating failed requests

3. **Loading States**
   - Spinner animations during API calls
   - Progress indicators for long operations
   - Clear "Generating..." status text

### Toast Notifications

All errors and success states use the Sonner toast library for consistent, non-intrusive notifications:

- **Success**: Green checkmark with insight title
- **Error**: Red X with specific error details
- **Info**: Blue icon with helpful context

## Best Practices for Users

### Avoiding Rate Limits

1. **Watch the Quota**: Keep an eye on the "X/5" indicator
2. **Wait Between Requests**: Don't spam the Generate button
3. **Use Default Insights**: Review pre-generated insights before creating new ones
4. **Plan Ahead**: Generate insights strategically when you need them

### Recovery from Errors

1. **Rate Limit Errors**:
   - Wait the full 60 seconds before retrying
   - Check the quota indicator to confirm it's reset
   - Try again with Generate Insight

2. **Network Errors**:
   - Check your internet connection
   - Refresh the page if needed
   - Try again immediately (no quota penalty)

3. **Unexpected Errors**:
   - Try refreshing the page
   - Clear browser cache if persistent
   - Check browser console for detailed error logs

## Technical Implementation

### Component Integration

Every component that uses the LLM API follows this pattern:

```typescript
import { llmRateLimiter } from '@/lib/rate-limiter'

const generateInsight = async () => {
  // Check quota before making request
  if (!llmRateLimiter.canMakeRequest()) {
    const waitTime = Math.ceil(llmRateLimiter.getTimeUntilNextRequest() / 1000)
    toast.error('Rate limit reached', {
      description: `Please wait ${waitTime} seconds...`
    })
    return
  }

  try {
    // Record the request
    llmRateLimiter.recordRequest()
    
    // Make API call
    const response = await window.spark.llm(prompt, 'gpt-4o-mini', true)
    
    // Handle success
    toast.success('Insight generated!')
    
  } catch (error: any) {
    const errorMessage = error?.message || String(error)
    
    // Handle specific error types
    if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('rate limit')) {
      llmRateLimiter.reset()
      toast.error('API rate limit reached', {
        description: 'Please wait 60 seconds...'
      })
    } else if (errorMessage.includes('network')) {
      toast.error('Network error', {
        description: 'Check your connection and try again'
      })
    } else {
      toast.error('Failed to generate insight', {
        description: 'Please try again later'
      })
    }
  }
}
```

### State Management

```typescript
// Track remaining requests
const [remainingRequests, setRemainingRequests] = useState(
  llmRateLimiter.getRemainingRequests()
)

// Update quota display every second
useEffect(() => {
  const interval = setInterval(() => {
    setRemainingRequests(llmRateLimiter.getRemainingRequests())
  }, 1000)
  
  return () => clearInterval(interval)
}, [])
```

### Button Rendering

```tsx
<Button
  onClick={generateInsight}
  disabled={isGenerating || remainingRequests === 0}
>
  {isGenerating ? (
    <>
      <Spinner />
      Generating...
    </>
  ) : (
    <>
      <Sparkle />
      Generate Insight
      {remainingRequests < 5 && (
        <Badge>{remainingRequests}/5</Badge>
      )}
    </>
  )}
</Button>
```

## Troubleshooting

### "Rate limit reached" immediately after loading

**Cause**: Previous session exhausted quota  
**Solution**: Wait 60 seconds for automatic reset

### Quota indicator not updating

**Cause**: React state not syncing  
**Solution**: Refresh the page to reinitialize

### Persistent errors after waiting

**Cause**: Possible backend issue  
**Solution**: Try a different browser or clear cache

### Error: "Something went wrong (429)"

**Cause**: You've hit the actual API rate limit  
**Solution**: 
1. Wait 60 seconds minimum
2. Check quota indicator shows 5/5
3. Try generating one insight at a time
4. If persists, wait 5 minutes for full reset

## Monitoring & Debugging

### Console Logging

All errors are logged to the browser console:

```
Error generating insight: Error: Rate limit exceeded
  at generateAIInsight (TableauPulse.tsx:165)
  ...
```

### Network Tab

Check the Network tab in DevTools:
- Look for failed requests (red status)
- Check response codes (429, 500, etc.)
- Inspect request/response payloads

### React DevTools

Use React DevTools to inspect:
- `remainingRequests` state
- Rate limiter instance state
- Component re-render patterns

## Future Enhancements

### Potential Improvements

1. **Persistent Storage**: Save rate limit state to localStorage
2. **Queue System**: Queue requests when limit reached, auto-process when available
3. **Batch Operations**: Combine multiple insights into single API call
4. **Adaptive Limits**: Adjust based on user tier or subscription
5. **Server-Side Tracking**: Coordinate limits across multiple clients
6. **Progressive Loading**: Generate insights incrementally vs. all at once

### Advanced Features

1. **Predictive Warnings**: Warn users before hitting limit
2. **Priority Queue**: Critical insights jump the queue
3. **Caching**: Cache similar requests to avoid redundant API calls
4. **Retry with Backoff**: Automatic exponential backoff for transient errors

## Summary

The rate limiting and error handling system provides:

✅ **Protection** from cascading failures  
✅ **Transparency** about API usage  
✅ **Guidance** for recovery from errors  
✅ **Resilience** in the face of service issues  

Users can confidently use AI features knowing the platform will guide them through any issues that arise.
