# Archived Features

## Overview
The following features have been temporarily archived to prevent runtime errors and ensure application stability.

## Archived Components

### 1. TableauEmbed.tsx
- **Purpose**: Embed Tableau visualizations directly in the application
- **Status**: Archived due to React error #185
- **Location**: `/src/components/TableauEmbed.tsx`
- **Backup**: `/src/components/TableauEmbed.archived.tsx`

### 2. TableauPulse.tsx
- **Purpose**: Display Tableau Pulse insights and notifications
- **Status**: Archived due to rate limiting issues (429 errors) and React errors
- **Location**: `/src/components/TableauPulse.tsx`
- **Backup**: `/src/components/TableauPulse.archived.tsx`

### 3. TableauAPIShowcase.tsx
- **Purpose**: Demonstrate Tableau API integration capabilities
- **Status**: Archived due to API integration errors
- **Location**: `/src/components/TableauAPIShowcase.tsx`
- **Backup**: `/src/components/TableauAPIShowcase.archived.tsx`

### 4. ActivityHeatmap.tsx
- **Purpose**: Display user activity in a heatmap visualization
- **Status**: Archived due to component rendering errors
- **Location**: `/src/components/ActivityHeatmap.tsx`
- **Backup**: `/src/components/ActivityHeatmap.archived.tsx`

### 5. ActivityForecast.tsx
- **Purpose**: Forecast future activity based on historical data
- **Status**: Archived due to missing dependencies and errors
- **Location**: `/src/components/ActivityForecast.tsx`
- **Backup**: `/src/components/ActivityForecast.archived.tsx`

### 6. ComparisonReport.tsx
- **Purpose**: Compare metrics across different time periods
- **Status**: Archived due to React rendering errors
- **Location**: `/src/components/ComparisonReport.tsx`
- **Backup**: `/src/components/ComparisonReport.archived.tsx`

## Impact

All archived features now display a user-friendly message indicating they are temporarily unavailable. The application remains fully functional with all other features intact:

- ✅ Dashboard with metrics and charts
- ✅ Workspaces management
- ✅ Shared dashboards
- ✅ Data export (CSV/Excel)
- ✅ Scheduled exports
- ✅ AI Insights generation
- ✅ Seasonal analysis
- ✅ Predictions
- ✅ Semantic layer
- ✅ Data governance
- ✅ Collaboration features
- ✅ Session replay
- ✅ Report builder

## Restoration

To restore any archived feature:
1. Locate the backup file (e.g., `TableauEmbed.archived.tsx`)
2. Review and fix the original issues causing errors
3. Test thoroughly in a development environment
4. Replace the stub component with the fixed version

## Error Details

The primary error that was occurring:
```
Minified React error #185
Visit https://react.dev/errors/185 for the full message
```

This typically indicates:
- Rendering errors in React components
- State management issues
- Improper hook usage
- API rate limiting (429 errors)

## Date Archived
December 2024
