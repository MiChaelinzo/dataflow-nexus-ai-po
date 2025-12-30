# Analytics Report Export Feature

## Overview
The Analytics Report Export feature enables users to create, customize, and export comprehensive analytics reports with charts, graphs, and insights in multiple formats (PDF, CSV, JSON). It also supports scheduled report generation and automated distribution.

## Features

### 1. Report Templates
Pre-built report templates for common use cases:
- **Executive Summary**: High-level KPIs and key insights
- **Detailed Analytics**: Comprehensive analysis with all metrics and visualizations
- **Custom Report**: Build your own report with selected components

### 2. Report Sections
Each report can include multiple customizable sections:
- **Metrics**: Display key performance indicators with trends
- **Time Series**: Historical data visualization (line, area, or bar charts)
- **Category Data**: Segment analysis with bar charts
- **Predictions**: Forecasts with confidence intervals
- **AI Insights**: Generated insights from the Insight Generator

### 3. Export Formats

#### PDF Export
- Professional formatting with headers and footers
- Print-ready layout
- Configurable page size (Letter, A4, Tabloid)
- Portrait or landscape orientation
- Includes timestamps and branding

#### CSV Export
- Tabular data export
- Ideal for spreadsheet analysis
- Includes all metrics and time-series data
- Compatible with Excel, Google Sheets, etc.

#### JSON Export
- Complete data structure export
- Programmatic access to report data
- Includes metadata and timestamps
- Easy integration with other systems

### 4. Report Builder Interface

#### Quick Export
One-click export of the Executive Summary in any format:
- Quick CSV button
- Quick JSON button
- Quick PDF button

#### Template Management
- View all available templates
- Configure template sections
- Enable/disable specific report components
- Preview reports before export
- Delete custom templates

#### Export Configuration
Configure export options:
- Select export format
- Choose page size (PDF only)
- Set orientation (PDF only)
- Include/exclude timestamp

### 5. Scheduled Reports

#### Create Schedules
- Select report template
- Set frequency (Daily, Weekly, Monthly)
- Choose specific days and times
- Specify export format
- Add email recipients

#### Schedule Management
- View all scheduled reports
- Enable/disable schedules
- Run reports immediately
- Delete schedules
- Track next run time

#### Frequency Options
- **Daily**: Generate reports every day at a specific time
- **Weekly**: Generate on a specific day of the week
- **Monthly**: Generate on a specific day of the month

## Usage Guide

### Creating a Basic Report

1. Navigate to the **Reports** tab
2. Click on a report template card
3. Click **Export** button
4. Choose export format (PDF, CSV, or JSON)
5. Configure export options
6. Click **Export Report**

### Customizing a Report Template

1. Select a template card
2. Click **Configure** button
3. Toggle sections on/off
4. Click **Preview** to see the result
5. Export when satisfied

### Scheduling Automated Reports

1. Go to **Reports** tab
2. Switch to **Scheduled Reports** sub-tab
3. Click **Schedule Report** button
4. Fill in report details:
   - Report name
   - Select template
   - Choose frequency
   - Set time
   - Add recipients
5. Click **Create Schedule**

### Running a Scheduled Report Immediately

1. Find the scheduled report in the list
2. Click **Run Now** button
3. Report will be generated and downloaded

## Technical Implementation

### Data Flow
```
Metrics + Charts + Insights
    ↓
Report Template (selected sections)
    ↓
Generate Report Data
    ↓
Format for Export (PDF/CSV/JSON)
    ↓
Download or Schedule
```

### Key Components

#### ReportBuilder (`/src/components/ReportBuilder.tsx`)
Main component managing templates, exports, and UI

#### ReportPreview (`/src/components/ReportPreview.tsx`)
Live preview of report with all charts and visualizations

#### ScheduledReportsManager (`/src/components/ScheduledReportsManager.tsx`)
Manage automated report generation schedules

#### Report Export Library (`/src/lib/report-export.ts`)
Core functions for:
- Template management
- Data transformation
- Export formatting
- File generation

### Data Persistence
- Report templates stored in `useKV('report-templates')`
- Scheduled reports stored in `useKV('scheduled-reports')`
- Syncs across sessions and devices

## Report Format Examples

### PDF Report Structure
```
┌─────────────────────────────────┐
│ Report Title                    │
│ Generated: [timestamp]          │
├─────────────────────────────────┤
│ Section: Key Metrics            │
│ [Metric Cards in Grid]          │
├─────────────────────────────────┤
│ Section: Time Series Chart      │
│ [Line/Area Chart]               │
├─────────────────────────────────┤
│ Section: AI Insights            │
│ [Insight Cards]                 │
├─────────────────────────────────┤
│ Footer: Branding                │
└─────────────────────────────────┘
```

### CSV Export Structure
```csv
Section,Metric,Value,Unit,Change,Trend
Key Metrics,Total Revenue,2847650,$,21.6,up
Key Metrics,Active Customers,12847,,14.4,up
Time Series,Dec 1,52345,,,
Time Series,Dec 2,54892,,,
```

### JSON Export Structure
```json
{
  "title": "Executive Summary",
  "generatedAt": "2024-01-15T10:30:00Z",
  "sections": [
    {
      "title": "Key Performance Indicators",
      "type": "metrics",
      "data": [...]
    },
    {
      "title": "Revenue Trend",
      "type": "timeseries",
      "data": [...]
    }
  ]
}
```

## Integration with Other Features

### AI Insights
- Reports automatically include generated insights
- Insights are pulled from the Insight Generator
- Displays confidence scores and types

### Tableau Integration
- Can export Tableau embedded visualizations
- Includes Tableau Pulse metrics
- REST API data included in exports

### Collaboration
- Share exported reports with team members
- Schedule reports for stakeholders
- Email distribution to multiple recipients

## Best Practices

### For Executives
Use **Executive Summary** template:
- Quick overview of key metrics
- Top insights only
- Export as PDF for presentations

### For Analysts
Use **Detailed Analytics** template:
- All metrics and visualizations
- Export as CSV for further analysis
- Export as JSON for custom processing

### For Automated Distribution
Set up scheduled reports:
- Weekly summaries on Monday mornings
- Monthly reports on the 1st of each month
- Daily performance snapshots

## Troubleshooting

### PDF Not Generating
- Ensure browser allows pop-ups
- Try Quick PDF button first
- Check browser's print settings

### CSV Missing Data
- Verify all sections are enabled in template
- Check that insights have been generated
- Confirm metrics are loaded

### Schedule Not Running
- Verify schedule is enabled (not paused)
- Check next run time is in the future
- Ensure recipients list is not empty

## Future Enhancements
- PNG/Image export of individual charts
- Email delivery integration
- Report history and versioning
- Custom branding and logos
- Advanced filtering and date ranges
- Multi-language support
- Chart type customization per section
