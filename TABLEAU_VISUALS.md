# Tableau Integration Screenshots & Visuals

## Overview
This document describes the visual components and screenshots available in the Tableau integration section of the Analytics Intelligence Platform.

## 1. Tableau Dashboard Embeds Tab

### Layout
- **Header Card**: Gradient background (accent/primary) with lightning icon
  - Title: "Tableau Integration Examples"
  - Description of functionality
  - Live integration badge with pulsing indicator
  - Feature badges: REST API v3.19, Tableau Cloud, Real-time Updates

### Dashboard Selection Grid
Four interactive dashboard cards arranged in a responsive grid:

#### A. Regional Sales Performance
- **Category Badge**: Sales (cyan accent)
- **Description**: Interactive dashboard showing sales metrics across regions with drill-down capabilities
- **Features**: Region filter, Product Category filter, Time Period filter
- **Visual Elements**:
  - 4 KPI cards: Total Revenue ($4.2M), Orders (8,421), Avg Order Value ($499), Customers (6,234)
  - Regional breakdown chart with color-coded bars (West, East, Central, South)
  - Monthly trend line chart with 12-month data
  - Live data connection indicator

#### B. COVID-19 Global Tracker
- **Category Badge**: Operations (green success)
- **Description**: Real-time visualization of global COVID-19 statistics and trends
- **Features**: Country filter, Date Range filter, Metric Type filter
- **Visual Elements**:
  - 3 summary cards: Total Cases (756.2M), Recoveries (742.8M, 98.2%), Active Cases (6.8M, 0.9%)
  - Interactive map placeholder with geographic visualization concept
  - Real-time data badge with pulsing indicator

#### C. Financial Performance Overview
- **Category Badge**: Finance (purple metric)
- **Description**: Comprehensive financial metrics with predictive analytics and trend analysis
- **Features**: Quarter filter, Department filter, Account Type filter
- **Visual Elements**:
  - 5 financial KPI cards: Revenue ($12.4M), Expenses ($8.1M), Net Profit ($4.3M), Margin (34.7%), EBITDA ($5.2M)
  - Quarterly performance comparison chart (Q1-Q4)
  - Department breakdown with horizontal bars
  - Dual-colored bar chart (Revenue vs Profit)

#### D. Customer Behavior Analytics
- **Category Badge**: Marketing (amber warning)
- **Description**: Deep dive into customer segmentation, retention, and lifetime value
- **Features**: Segment filter, Cohort filter, Channel filter
- **Visual Elements**:
  - 4 customer metrics with emoji icons: Total Customers (156K), Avg LTV ($2,840), Retention (87.3%), NPS Score (72)
  - 6-segment customer grid (Champions, Loyal, Potential, At Risk, Hibernating, Lost)
  - Cohort retention heat map
  - Color-coded segments by value

### Dashboard Viewer
- **Controls**:
  - Dashboard selection dropdown
  - View mode toggle (Demo View / Live Embed)
  - Action buttons: Fullscreen, Export, Share
  - Interactive Dashboard badge

- **Display Area**:
  - Responsive iframe for live embeds (600px height)
  - High-fidelity screenshots for demo mode
  - Loading state with spinner and message
  - Filter chips showing available parameters

### Code Examples Section
Tabbed interface with 4 code example categories:

1. **JavaScript Tab**: 
   - Tableau JS API initialization
   - Event handling setup
   - Filter application example

2. **React Tab**:
   - React component integration
   - TableauEmbed component usage
   - Props and callbacks

3. **REST API Tab**:
   - Authentication flow
   - Token management
   - Workbook query example

## 2. REST API Showcase Tab

### Layout Structure

#### Left Sidebar (1/3 width)
**API Categories Panel**:
- All (total count badge)
- Authentication (Lock icon) - 1 endpoint
- Workbooks (ChartBar icon) - 3 endpoints
- Data Sources (Database icon) - 1 endpoint
- Users (Users icon) - 1 endpoint
- Views (Lightning icon) - 1 endpoint

**Quick Stats Box**:
- Total Endpoints: 6
- API Version: 3.19
- Auth Required: OAuth 2.0

#### Main Content Area (2/3 width)

**Available Endpoints List**:
Scrollable list of API endpoints with:
- Endpoint name (bold)
- HTTP method badge (GET/POST/PUT/DELETE with color coding)
- Endpoint URL in monospace font
- Brief description
- Hover and selection states

**Request Details Panel**:
- Selected endpoint name and method badge
- Endpoint URL input field (read-only)
- Parameter inputs (if applicable)
  - Parameter name placeholders
  - Type badges (string, array, etc.)
  - Required badges (red destructive color)
- Execute button with loading state
- Response section (expandable after execution)
  - Status indicator (200 OK with green checkmark)
  - Response time badge (e.g., 142ms)
  - Formatted JSON response in code block

### Integration Examples Section
Four-tab interface at bottom:

1. **Embedding**: JavaScript API with viz initialization and filter setup
2. **Dynamic Filtering**: Async filter application with parameter updates
3. **Publishing**: FormData construction and workbook upload
4. **Metadata API**: GraphQL queries for data lineage

## Color Coding System

### Method Badges
- **GET**: Cyan accent background (`bg-accent/20 text-accent`)
- **POST**: Green success background (`bg-success/20 text-success`)
- **PUT**: Yellow warning background (`bg-warning/20 text-warning`)
- **DELETE**: Red destructive background (`bg-destructive/20 text-destructive`)

### Category Badges
- **Sales**: Cyan accent
- **Operations**: Green success
- **Finance**: Purple metric
- **Marketing**: Amber warning

### Status Indicators
- **Live Data**: Pulsing green dot with "Live Data" text
- **Connected**: Pulsing accent dot with "Live Integration"
- **Success**: Green checkmark with "200 OK"

## Responsive Behavior

### Desktop (>1024px)
- Full 8-column tab layout
- 4-column dashboard selection grid
- Side-by-side API panels (1/3 + 2/3)

### Tablet (768px - 1024px)
- 4-column responsive tab layout
- 2-column dashboard grid
- Stacked API panels

### Mobile (<768px)
- Vertical icon-only tabs with labels hidden
- Single column dashboard cards
- Fully stacked panels
- Bottom sheet for responses

## Animation Details

### Entrance Animations
- Dashboard cards: Staggered fade-up (50ms delay between items)
- Tab content: Opacity and y-position transition (400ms)
- API response: Height expansion with opacity fade-in

### Interaction Animations
- Button hover: Scale 1.02 with ease-out
- Card selection: Border color transition (200ms)
- Loading spinner: 360° rotation with linear timing

### State Transitions
- Tab switching: Crossfade (200ms ease-in-out)
- View mode toggle: Smooth opacity transition
- Filter updates: Data transform with opacity

## Technical Implementation Notes

### Screenshot Components
Each dashboard screenshot is a fully-rendered React component with:
- Accurate metric values
- Color-coordinated visualizations
- Proper typography hierarchy
- Gradient backgrounds matching theme
- Realistic data patterns

### Live Embed Implementation
```typescript
<iframe
  src={`${embedUrl}?:embed=yes&:toolbar=top&:tabs=no`}
  className="w-full h-full border-0"
  title={vizName}
/>
```

### API Testing Simulation
- Mock API calls with 1500ms delay
- Toast notifications on completion
- Formatted JSON responses
- Loading states during execution

## Accessibility Features

- Semantic HTML structure
- Keyboard navigation support
- ARIA labels on interactive elements
- Focus indicators on all controls
- Screen reader friendly status messages
- High contrast color ratios (WCAG AA compliant)

## Integration Points

### With Main Dashboard
- Consistent design system
- Shared color palette
- Unified typography
- Matching animation patterns

### With Other Features
- Links to AI Insights from dashboard cards
- Cross-references to Semantic Layer
- Governance audit log connections
- Collaboration sharing workflows

---

**Note**: All screenshots and visuals are designed to be professional-quality representations suitable for hackathon submission and demo videos.
