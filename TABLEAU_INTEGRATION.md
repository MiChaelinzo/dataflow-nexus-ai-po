# Tableau Integration Guide

## Overview

This Analytics Intelligence Platform demonstrates comprehensive Tableau integration capabilities, showcasing how to embed, extend, and integrate Tableau dashboards and data using the Tableau Developer Platform.

## Features Implemented

### 1. **Tableau Dashboard Embedding** 
The platform includes real working examples of Tableau dashboard embeds with:

- **Interactive Dashboard Embeds**: Multiple pre-configured Tableau Public dashboards demonstrating different use cases (Sales, COVID-19 tracking, Financial analytics, Customer behavior)
- **Responsive iframe Integration**: Fully responsive embedded dashboards that adapt to screen sizes
- **Toggle Views**: Switch between live Tableau embeds and high-fidelity demo screenshots
- **Category-based Navigation**: Organized dashboards by business function (Sales, Operations, Finance, Marketing)
- **Filter Visualization**: Display available Tableau filters and parameters for each dashboard

**Location in App**: Navigate to the **Tableau** tab → **Dashboard Embeds** sub-tab

### 2. **Tableau REST API Integration**
Comprehensive REST API examples demonstrating:

#### Authentication
- OAuth 2.0 sign-in flow
- Token management
- Multi-site authentication

#### Workbook Management
- Query all workbooks on a site
- Publish new workbooks programmatically
- Update workbook metadata
- Manage workbook permissions

#### Data Source Operations
- Query published data sources
- Verify data source certification
- View connection details
- Track update timestamps

#### User & Access Management
- Add users to sites
- Assign site roles
- Update user permissions
- Query user activities

#### Views & Analytics
- Query dashboard views
- Retrieve usage statistics
- Access view metadata
- Export view images

**Location in App**: Navigate to the **Tableau** tab → **REST API** sub-tab

### 3. **Interactive API Testing**
The platform includes a live API testing interface where you can:

- Select from 6+ pre-configured API endpoints
- Filter endpoints by category (Auth, Workbooks, Data Sources, Users, Views)
- View request parameters and requirements
- Execute mock API calls
- View formatted JSON responses
- See response times and status codes

### 4. **Code Examples & Integration Patterns**

Four comprehensive code example tabs:

#### **Embedding**
- JavaScript API initialization
- Event handling (onFirstInteractive)
- Workbook and sheet access
- Filter queries

#### **Dynamic Filtering**
- Programmatic filter application
- Parameter updates
- Selection handling
- Multi-filter coordination

#### **Publishing**
- REST API workbook publishing
- FormData construction
- Project assignment
- Metadata configuration

#### **Metadata API**
- GraphQL query examples
- Data lineage tracking
- Column-level metadata
- Upstream dependencies

## Technical Implementation

### Tableau JavaScript API Integration

```typescript
import tableauSoftware from '@tableau/embedding-api';

const viz = new tableauSoftware.Viz(
  containerElement,
  vizUrl,
  {
    width: '100%',
    height: '600px',
    hideTabs: true,
    hideToolbar: false,
    onFirstInteractive: () => {
      // Dashboard ready
      const workbook = viz.getWorkbook();
      const sheet = workbook.getActiveSheet();
      
      // Apply filters
      sheet.applyFilterAsync('Region', 'West', 
        tableau.FilterUpdateType.REPLACE);
    }
  }
);
```

### REST API Authentication

```typescript
const response = await fetch(
  `${tableauServer}/api/3.19/auth/signin`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      credentials: {
        name: 'username',
        password: 'password',
        site: { contentUrl: 'site-name' }
      }
    })
  }
);

const { token } = await response.json();
```

### Programmatic Filtering

```typescript
async function applyFilters(viz, filters) {
  const sheet = viz.getWorkbook().getActiveSheet();
  
  for (const [field, values] of Object.entries(filters)) {
    await sheet.applyFilterAsync(
      field,
      values,
      tableau.FilterUpdateType.REPLACE
    );
  }
}
```

## Tableau Cloud & Tableau Next Integration Points

### Salesforce Platform Integration
The platform is designed to integrate with Tableau Next on Salesforce:

1. **Embedded Analytics**: Dashboards can be embedded in Salesforce Lightning components
2. **Data 360 Integration**: Connect to Salesforce Data Cloud for unified customer views
3. **Slack Integration**: Share dashboards and insights directly to Slack channels
4. **Agentforce**: AI-powered analytics recommendations integrated with Salesforce agents

### Extensibility Features
Demonstrating Tableau Developer Platform capabilities:

- **Custom Embedding**: Responsive, branded dashboard embeds
- **API Orchestration**: Automated workbook publishing and management
- **Permission Management**: Programmatic access control
- **Metadata Queries**: Data lineage and impact analysis
- **Usage Analytics**: Track dashboard views and user engagement

## Use Cases Demonstrated

### 1. Sales Performance Dashboard
- Regional breakdown with drill-down capabilities
- Monthly trend visualization
- KPI tracking with sparklines
- Year-over-year comparisons

### 2. COVID-19 Global Tracker
- Real-time data visualization
- Geographic heat maps
- Time-series playback
- Recovery rate analysis

### 3. Financial Performance Overview
- Quarterly performance metrics
- Department expense tracking
- Profit margin analysis
- EBITDA calculations

### 4. Customer Behavior Analytics
- Customer segmentation analysis
- Cohort retention tracking
- Lifetime value calculations
- NPS score visualization

## Best Practices Implemented

### Security
- Token-based authentication
- Role-based access control (RBAC)
- Content-level permissions
- Audit logging

### Performance
- Lazy loading for embeds
- Efficient API pagination
- Response caching strategies
- Optimized filter updates

### User Experience
- Loading states and skeleton screens
- Error handling with helpful messages
- Mobile-responsive embeds
- Smooth animations and transitions

### Scalability
- Multi-site support
- Batch API operations
- Efficient data queries
- Asynchronous operations

## API Endpoints Covered

| Category | Endpoint | Method | Purpose |
|----------|----------|--------|---------|
| Auth | `/auth/signin` | POST | Authenticate and get token |
| Workbooks | `/sites/{site-id}/workbooks` | GET | List all workbooks |
| Workbooks | `/sites/{site-id}/workbooks` | POST | Publish workbook |
| Workbooks | `/workbooks/{id}/permissions` | PUT | Update permissions |
| Data Sources | `/sites/{site-id}/datasources` | GET | List data sources |
| Users | `/sites/{site-id}/users` | POST | Add user to site |
| Views | `/sites/{site-id}/views` | GET | Query all views |

## Next Steps & Extensions

### Potential Enhancements
1. **Connected Apps**: Implement OAuth 2.0 with Connected Apps for secure authentication
2. **Webhooks**: Real-time notifications when dashboards are updated
3. **Custom Extensions**: Build Tableau Dashboard Extensions for specialized interactions
4. **Pulse Integration**: Integrate Tableau Pulse for intelligent insights delivery
5. **Einstein Integration**: Connect AI-powered recommendations from Tableau Einstein
6. **Mobile SDK**: Native mobile app integration using Tableau Mobile SDK

### Integration Opportunities
- Salesforce Flow integration for automated actions
- Slack command interface for dashboard queries
- Microsoft Teams integration for collaborative analytics
- Email digest automation with embedded visualizations
- Custom alerting based on dashboard thresholds

## Resources

- **Tableau Developer Platform**: https://help.tableau.com/current/api/rest_api/en-us/REST/rest_api.htm
- **Embedding API Documentation**: https://help.tableau.com/current/api/embedding_api/en-us/
- **Tableau Metadata API**: https://help.tableau.com/current/api/metadata_api/en-us/
- **Tableau Extensions API**: https://tableau.github.io/extensions-api/

## Support

For questions about the Tableau integration implementation in this platform:
- Review the inline code comments in `/src/components/TableauEmbed.tsx`
- Check the API examples in `/src/components/TableauAPIShowcase.tsx`
- Refer to Tableau's official documentation for production deployments

---

**Note**: The dashboard embeds in this demo use Tableau Public URLs for demonstration purposes. For production implementations with Tableau Cloud or Tableau Server, replace these URLs with your organization's Tableau environment URLs and implement proper authentication.
