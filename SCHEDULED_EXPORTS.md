# Scheduled Data Exports Feature

## Overview

The Scheduled Data Exports feature allows users to automate recurring data exports with automatic delivery to specified recipients. This powerful feature eliminates manual export tasks and ensures stakeholders receive timely data updates.

## Key Features

### 1. Flexible Scheduling Options
- **Daily**: Export data every day at a specified time
- **Weekly**: Choose a specific day of the week
- **Monthly**: Select a day of the month (1-31)
- Customizable time for each schedule

### 2. Multiple Data Types
Configure exports for different data sources:
- **Metrics Overview**: Key performance indicators and metrics
- **Time Series Data**: Historical trend data
- **Category Data**: Segmented revenue/category breakdowns
- **AI Insights**: Generated insights and recommendations
- **Activity Feed**: Workspace activity logs
- **All Data**: Comprehensive export of all available data

### 3. Format Options
Export data in multiple formats:
- **CSV**: Comma-separated values for spreadsheet applications
- **Excel (XLSX)**: Native Microsoft Excel format with formatting
- **JSON**: Structured data for API integrations

### 4. Multi-Recipient Delivery
- Add multiple email recipients per schedule
- Manage recipient lists easily
- Automatic delivery notifications

### 5. Export Management
- **Enable/Disable**: Pause schedules without deleting them
- **Run Now**: Execute exports on-demand
- **Edit Schedules**: Update configuration at any time
- **Delete**: Remove schedules permanently

### 6. Export History
- Track all completed exports
- View delivery status (success/failed)
- Monitor file sizes
- See recipient counts
- Review timestamps

## How to Use

### Creating a Scheduled Export

1. Navigate to the **Scheduled** tab
2. Click **New Schedule** button
3. Configure the export:
   - **Name**: Descriptive name for the export
   - **Description** (optional): Additional context
   - **Data Type**: Select what data to export
   - **Format**: Choose CSV, Excel, or JSON
   - **Frequency**: Daily, weekly, or monthly
   - **Time**: When to run the export
   - **Day** (for weekly/monthly): Specific day
   - **Recipients**: Email addresses to receive the export

4. Click **Create Schedule**

### Managing Exports

#### Enable/Disable
Click the power icon (⚡) to pause or resume a schedule without deleting it.

#### Run Now
Click **Run Now** to execute an export immediately without waiting for the next scheduled time.

#### Edit
Click the pencil icon (✏️) to modify any aspect of the schedule.

#### Delete
Click the trash icon (🗑️) to permanently remove a schedule.

### Viewing History

Each scheduled export shows recent execution history:
- Click the dropdown arrow to expand history
- View up to 5 recent executions
- See timestamps, recipient counts, and file sizes
- Check success/failure status

## Use Cases

### Daily Metrics Reports
Set up a daily export of key metrics delivered to your team every morning at 9 AM.

```
Name: Daily Metrics Digest
Data Type: Metrics Overview
Format: Excel
Frequency: Daily at 09:00
Recipients: team@company.com, manager@company.com
```

### Weekly Executive Summary
Create a weekly comprehensive report for leadership.

```
Name: Weekly Executive Summary
Data Type: All Data
Format: Excel
Frequency: Weekly (Monday) at 08:00
Recipients: ceo@company.com, cfo@company.com
```

### Monthly Activity Reports
Generate monthly activity reports for stakeholder review.

```
Name: Monthly Activity Report
Data Type: Activity Feed
Format: CSV
Frequency: Monthly (1st) at 00:00
Recipients: operations@company.com
```

### AI Insights Delivery
Automatically deliver AI-generated insights to data analysts.

```
Name: AI Insights Feed
Data Type: AI Insights
Format: JSON
Frequency: Daily at 06:00
Recipients: data-team@company.com
```

## Technical Details

### Data Persistence
- Schedules are stored using the `useKV` persistence API
- Export history is maintained for the last 50 executions
- All configurations persist between sessions

### Execution
- Schedules are checked every 60 seconds
- Executions trigger when current time >= next run time
- Next run is automatically calculated after each execution
- Timezone is based on the browser's local time

### Notifications
- Success notifications show upon export completion
- Delivery confirmation includes recipient count
- Failed exports are logged in history

## Dashboard Overview

The Scheduled Exports dashboard provides three key metrics:

1. **Total Schedules**: Total number of configured exports
2. **Active**: Number of enabled schedules
3. **Exports Delivered**: Total historical export count

## Best Practices

### Naming Conventions
Use clear, descriptive names that indicate:
- What data is being exported
- Who it's for
- When it runs

Example: "Daily Sales Metrics - Finance Team"

### Recipient Management
- Group recipients by team or function
- Use distribution lists when possible
- Keep recipient lists updated

### Schedule Timing
- Consider recipient time zones
- Run exports before business hours for morning delivery
- Avoid peak system usage times

### Data Selection
- Export only the data recipients need
- Use specific data types rather than "All Data" when possible
- Balance comprehensiveness with file size

## Integration with Other Features

### Collaboration
- Scheduled exports complement real-time collaboration
- Provides offline access to data
- Creates audit trail of data distribution

### Reports
- Automate delivery of custom reports
- Schedule comparison reports for regular review
- Distribute seasonal insights automatically

### Activity Tracking
- Export activity feeds for archival
- Share workspace engagement metrics
- Monitor team productivity trends

## Troubleshooting

### Exports Not Running
- Check if the schedule is enabled (power icon should be green)
- Verify the next run time is in the future
- Ensure at least one recipient is configured

### Missing Recipients
- Recipients are required for all schedules
- Add at least one email address
- Check for typos in email addresses

### Editing Existing Schedules
- Click the pencil icon to edit
- All fields can be modified
- Next run time updates automatically

## Future Enhancements

Potential improvements for future iterations:
- Email template customization
- Webhook delivery options
- Cloud storage integration (S3, Google Drive)
- Advanced filters and transformations
- Conditional exports based on data thresholds
- Export bundling (combine multiple data types)
- Recipient group management
- Custom scheduling (e.g., "every 3 days")
- Export compression options
- Password-protected files

## API Integration

The scheduled exports system is built on modular components that can be extended:

```typescript
import { ScheduledExport, calculateNextRun } from '@/lib/scheduled-export'

// Create a custom schedule programmatically
const schedule: ScheduledExport = {
  id: crypto.randomUUID(),
  name: "Custom Export",
  dataType: "metrics",
  format: "csv",
  frequency: "daily",
  time: "09:00",
  enabled: true,
  recipients: ["user@example.com"],
  nextRun: calculateNextRun('daily', '09:00').toISOString(),
  createdAt: new Date().toISOString(),
  createdBy: "api-user"
}
```

## Compliance & Security

- Exports are generated client-side
- No data is transmitted to external servers
- Recipients are managed locally
- Export history is stored securely
- User authentication required for access

---

## Quick Start

1. Go to **Scheduled** tab
2. Click **New Schedule**
3. Fill in the form
4. Add recipients
5. Click **Create Schedule**

Your automated data exports are now configured! ✨
