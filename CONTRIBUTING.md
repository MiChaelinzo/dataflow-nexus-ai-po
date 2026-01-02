# Contributing Guide

Guide for developers working with the Analytics Intelligence Platform codebase.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Patterns](#code-patterns)
- [Adding Features](#adding-features)
- [Best Practices](#best-practices)

## 🏗️ Architecture Overview

### Application Structure
The platform is built as a single-page application (SPA) with multiple feature tabs managed by Radix UI Tabs component. The main `App.tsx` orchestrates:

- Tab-based navigation
- Global state management
- User authentication
- Real-time collaboration
- Activity tracking

### State Management
- **Local State**: React `useState` for transient UI state
- **Persistent State**: Spark KV store via `useKV` hook for data that survives sessions
- **Collaboration State**: Custom `useCollaboration` hook for real-time features

### Data Flow
1. User interacts with component
2. Component updates local/persistent state
3. State changes trigger re-renders
4. Activity logged to KV store
5. Collaboration hooks sync with other users

## 🛠️ Technology Stack

### Core
- **React 19**: UI framework with hooks
- **TypeScript**: Type-safe development
- **Vite**: Build tool and dev server

### Styling
- **Tailwind CSS v4**: Utility-first CSS framework
- **Shadcn v4**: Pre-built component library (40+ components)
- **Framer Motion**: Animation library

### Data & APIs
- **Spark SDK**: LLM, KV storage, user management
- **D3**: Advanced data visualizations
- **Recharts**: Chart library

### UI Components
- **Radix UI**: Accessible component primitives
- **Phosphor Icons**: Icon library
- **Sonner**: Toast notifications

## 📁 Project Structure

```
src/
├── App.tsx                          # Main application entry
├── ErrorFallback.tsx                # Error boundary component
├── main.tsx                         # Vite entry (DO NOT MODIFY)
├── main.css                         # Structural CSS (DO NOT MODIFY)
├── index.css                        # Custom theme and styles
│
├── components/                      # All React components
│   ├── ui/                          # Shadcn component library (40+ components)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   │
│   ├── MetricCard.tsx               # Animated metric displays
│   ├── TimeSeriesChart.tsx          # Time-based visualizations
│   ├── InsightGenerator.tsx         # AI insight generation
│   ├── TableauPulse.tsx             # Pulse integration
│   ├── SeasonalInsights.tsx         # Seasonal analysis
│   ├── DataGovernance.tsx           # Governance dashboard
│   ├── SemanticLayer.tsx            # Semantic query interface
│   ├── CollaborationHub.tsx         # Real-time collaboration
│   ├── SessionReplay.tsx            # Session recording/playback
│   ├── ReportBuilder.tsx            # Custom report creation
│   ├── WorkspaceManager.tsx         # Workspace management
│   ├── SharedDashboards.tsx         # Dashboard sharing
│   ├── SlackIntegration.tsx         # Slack notification config
│   └── ...
│
├── hooks/                           # Custom React hooks
│   ├── use-collaboration.ts         # Real-time collaboration state
│   ├── use-session-recorder.ts      # Session recording logic
│   ├── use-session-playback.ts      # Session playback controls
│   ├── use-mobile.ts                # Responsive breakpoint detection
│   └── ...
│
├── lib/                             # Utilities and helpers
│   ├── utils.ts                     # General utilities (cn, etc.)
│   ├── data.ts                      # Sample data generators
│   └── types.ts                     # TypeScript type definitions
│
└── styles/
    └── theme.css                    # Additional theme styles
```

## 💻 Development Workflow

### Running the Application
```bash
# Development server (auto-starts in Spark Codespace)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Hot Reload
Vite provides instant hot module replacement (HMR). Changes to React components update without full page reload.

### Type Checking
TypeScript types are checked automatically. Run explicit type check:
```bash
npx tsc --noEmit
```

## 🔨 Code Patterns

### Using Spark KV for Persistence

```typescript
import { useKV } from '@github/spark/hooks'

// ✅ CORRECT - Functional updates
const [items, setItems] = useKV('my-items', [])

// Add item
setItems(current => [...current, newItem])

// Update item
setItems(current => 
  current.map(item => 
    item.id === targetId ? { ...item, updated: true } : item
  )
)

// Remove item
setItems(current => current.filter(item => item.id !== targetId))

// ❌ WRONG - Don't reference closure value
setItems([...items, newItem]) // items is stale!
```

### Calling the LLM

```typescript
// Always use spark.llmPrompt for prompts
const prompt = spark.llmPrompt`
  Analyze these metrics and provide insights:
  ${JSON.stringify(metrics)}
  
  Return specific, actionable recommendations.
`

// Call LLM (use JSON mode if you need structured output)
const response = await spark.llm(prompt, 'gpt-4o', false)

// For JSON responses
const jsonPrompt = spark.llmPrompt`Return a JSON object with property "insights" containing an array`
const jsonResponse = await spark.llm(jsonPrompt, 'gpt-4o', true)
const data = JSON.parse(jsonResponse)
```

### Getting User Information

```typescript
// Get current user
const userInfo = await spark.user()
// Returns: { login, avatarUrl, email, id, isOwner }

// Use in component
useEffect(() => {
  const loadUser = async () => {
    const user = await spark.user()
    setUser(user)
  }
  loadUser()
}, [])
```

### Component Structure

```typescript
import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function MyComponent() {
  // Transient UI state
  const [isLoading, setIsLoading] = useState(false)
  
  // Persistent data
  const [data, setData] = useKV('my-data', [])
  
  const handleAction = async () => {
    setIsLoading(true)
    try {
      // Do work
      setData(current => [...current, newItem])
      toast.success('Success!')
    } catch (error) {
      toast.error('Failed')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <Card className="p-6">
      <Button onClick={handleAction} disabled={isLoading}>
        <Plus size={18} weight="duotone" />
        Add Item
      </Button>
    </Card>
  )
}
```

## ➕ Adding Features

### 1. Create Component

Create new component in `src/components/`:

```typescript
// src/components/MyFeature.tsx
export function MyFeature() {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">My Feature</h2>
      {/* Feature content */}
    </Card>
  )
}
```

### 2. Add Tab to App

In `App.tsx`:

```typescript
import { MyFeature } from '@/components/MyFeature'
import { MyIcon } from '@phosphor-icons/react'

// Add TabsTrigger
<TabsTrigger value="myfeature" className="gap-2 py-3">
  <MyIcon size={18} weight="duotone" />
  <span className="hidden sm:inline">My Feature</span>
</TabsTrigger>

// Add TabsContent
<TabsContent value="myfeature" className="space-y-6">
  <MyFeature />
</TabsContent>
```

### 3. Add Persistence (if needed)

```typescript
// In your component
const [featureData, setFeatureData] = useKV('my-feature-data', defaultValue)
```

### 4. Track Activity (optional)

```typescript
import { useUserActivity } from '@/components/UserProfile'

const { trackActivity } = useUserActivity()

// Track action
trackActivity('action', 'Description of what happened', 'context-info')
```

## 🎨 Styling Guidelines

### Use Tailwind Classes
```typescript
// ✅ Prefer Tailwind utilities
<div className="flex items-center gap-4 p-6 bg-card rounded-lg border border-border">

// ❌ Avoid inline styles
<div style={{ display: 'flex', padding: '24px' }}>
```

### Use Theme Colors
```typescript
// ✅ Use theme variables
className="bg-primary text-primary-foreground"
className="text-accent border-accent"

// ❌ Avoid hardcoded colors
className="bg-blue-500 text-white"
```

### Consistent Spacing
```typescript
// Card padding
className="p-6"  // Standard
className="p-4"  // Compact

// Gaps
className="gap-6"  // Sections
className="gap-4"  // Cards
className="gap-2"  // Tight groupings
```

### Responsive Design
```typescript
// Mobile first, then tablet, then desktop
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
className="text-sm md:text-base lg:text-lg"
className="p-4 md:p-6 lg:p-8"
```

## 🎭 Animation Best Practices

### Framer Motion Animations
```typescript
import { motion } from 'framer-motion'

// Fade in on mount
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>

// Stagger children
<motion.div>
  {items.map((item, i) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.1 }}
    />
  ))}
</motion.div>
```

### Timing Guidelines
- Quick actions: 100-150ms
- State changes: 200-300ms  
- Page transitions: 300-500ms
- Stagger delay: 50-100ms between items

## 🧪 Testing Patterns

### Manual Testing Checklist
- [ ] Feature works on mobile, tablet, desktop
- [ ] Data persists after page refresh
- [ ] Loading states display correctly
- [ ] Error states handled gracefully
- [ ] Animations are smooth (60fps)
- [ ] Keyboard navigation works
- [ ] Screen reader accessible

### Console Debugging
```typescript
// Development logging
if (import.meta.env.DEV) {
  console.log('Debug info:', data)
}
```

## 📝 Best Practices

### Do's ✅
- Use `useKV` for persistent data
- Use functional updates with state
- Import assets explicitly
- Use Shadcn components over HTML elements
- Use Phosphor icons with `weight="duotone"`
- Track user activities for engagement analytics
- Add loading and error states
- Use toast notifications for feedback
- Follow responsive design patterns
- Use theme colors from Tailwind config

### Don'ts ❌
- Don't use `localStorage` or `sessionStorage` directly
- Don't reference state from closures with `useKV`
- Don't use `alert()`, `confirm()`, or `prompt()`
- Don't modify `main.tsx`, `main.css`, or `vite.config.ts`
- Don't install Node-only packages
- Don't hardcode colors outside theme
- Don't create components that clash with Shadcn names
- Don't add unnecessary comments (code should be self-documenting)

### Performance Tips
- Memoize expensive computations with `useMemo`
- Memoize callbacks with `useCallback`
- Use `React.memo` for pure components
- Lazy load heavy components
- Virtual scroll large lists

### TypeScript Tips
- Define interfaces for complex objects
- Use discriminated unions for states
- Leverage type inference when possible
- Export types from components that define them

## 🚀 Deployment

The application is automatically deployed through the Spark platform. No manual deployment steps needed.

### Build Optimization
Production builds are automatically optimized:
- Code splitting
- Tree shaking
- Minification
- Asset optimization

## 📚 Additional Resources

- **Spark SDK Docs**: Check prompt context for `spark` global API
- **Shadcn Docs**: [ui.shadcn.com](https://ui.shadcn.com)
- **Tailwind Docs**: [tailwindcss.com](https://tailwindcss.com)
- **Framer Motion**: [framer.com/motion](https://framer.com/motion)
- **Radix UI**: [radix-ui.com](https://radix-ui.com)

## 🤝 Questions?

Review the existing components in `src/components/` for implementation examples. Most patterns are demonstrated in:
- `InsightGenerator.tsx` - LLM usage
- `WorkspaceManager.tsx` - CRUD operations with KV
- `SessionReplay.tsx` - Complex state management
- `CollaborationHub.tsx` - Real-time features
- `SlackIntegration.tsx` - External API integration

---

**Happy coding!** 🎉
