# Tableau Integration Setup Guide

## Overview

The Analytics Intelligence Platform now includes a dedicated **Tableau Setup** tab that allows you to manually configure Tableau Server or Tableau Cloud credentials for demonstration purposes. This feature provides a user-friendly interface to input and manage your Tableau integration settings.

## Accessing Tableau Setup

1. Navigate to the application
2. Click on the **Tableau Setup** tab in the main navigation
3. You'll see the Tableau Integration Settings interface

## Features

### 1. Server Configuration

Configure your Tableau Server or Tableau Cloud connection:

#### **Server URL**
- Enter your Tableau Server or Tableau Cloud URL
- Format examples:
  - Tableau Cloud: `https://10ay.online.tableau.com`
  - Tableau Server: `https://your-server.tableau.com`
  - On-premises: `https://your-domain.com`

#### **Site Name** (Optional)
- Leave empty for the default site
- Enter the content URL of your site (not the display name)
- This is the site identifier used in API calls

### 2. Authentication Methods

Choose between two authentication methods:

#### **Method 1: Username & Password**
- **Username**: Your Tableau account username
- **Password**: Your Tableau account password
- Toggle visibility with the eye icon
- Simple but less secure for production use

#### **Method 2: Personal Access Token (Recommended)**
- **Token Name**: The name of your PAT
- **Token Secret**: The secret value of your PAT
- More secure than username/password
- Can be revoked independently
- Recommended for production environments

**How to generate a Personal Access Token:**
1. Log into your Tableau Server or Tableau Cloud
2. Go to your user settings/profile
3. Navigate to "Personal Access Tokens"
4. Click "Generate New Token"
5. Give it a name and copy the token secret immediately
6. Paste both the name and secret into the settings

### 3. Dashboard URLs

Add one or more Tableau dashboard URLs for embedding and demo purposes:

#### **Adding a Dashboard**
1. Enter a descriptive name (e.g., "Sales Dashboard")
2. Enter the full dashboard URL
3. Click "Add" or press Enter

#### **URL Format Examples**

**Tableau Cloud:**
```
https://10ay.online.tableau.com/#/site/sitename/views/WorkbookName/DashboardName
```

**Tableau Public:**
```
https://public.tableau.com/views/WorkbookName/DashboardName
```

**Tableau Server:**
```
https://your-server.com/#/site/sitename/views/WorkbookName/DashboardName
```

#### **Managing Dashboards**
- View all configured dashboards in a list
- Remove dashboards individually with the trash icon
- Dashboards are saved locally in your browser

### 4. Actions

#### **Save Configuration**
- Saves all your settings locally in the browser
- Data persists between sessions
- No data is sent to external servers

#### **Test Connection**
- Simulates a connection test with your credentials
- Validates that required fields are filled
- Note: This is a demo simulation, not an actual API call

#### **Clear All**
- Removes all saved settings and dashboards
- Requires confirmation via the UI
- Useful for starting fresh or switching accounts

## Data Security

### Local Storage
- All credentials are stored **locally in your browser** using the Spark KV storage
- Credentials are **never transmitted** to external servers
- Data persists only on your device

### Production Recommendations
For production deployments:
- Use Personal Access Tokens instead of passwords
- Implement OAuth 2.0 with Connected Apps
- Use environment variables for sensitive data
- Never commit credentials to version control
- Rotate tokens regularly
- Implement proper access controls

## Configuration Status

The interface shows a status badge indicating whether your Tableau integration is configured:
- **Configured** (green): Server URL and at least one authentication method are set
- **Not Configured** (gray): Missing required configuration

## Use Cases

### Demo Presentations
- Quickly configure Tableau credentials for live demos
- Switch between different Tableau environments
- Show multiple dashboard embeddings

### Development & Testing
- Test API integrations locally
- Validate dashboard URLs
- Prototype Tableau embedded analytics features

### Multi-Environment Setup
- Manage connections to dev, staging, and production
- Store multiple dashboard URLs for different projects
- Easy switching between Tableau Cloud and Server

## Troubleshooting

### "Missing credentials" error
- Ensure you've entered a Server URL
- Provide either Username/Password OR Personal Access Token
- Click "Save Configuration" before testing

### Dashboards not appearing
- Verify the dashboard URL format is correct
- Ensure you have access permissions to the dashboard
- Check that the dashboard is published and not private

### Configuration not persisting
- Make sure you click "Save Configuration"
- Check browser local storage is enabled
- Verify you're not in incognito/private browsing mode

## Best Practices

1. **Use Personal Access Tokens** for better security
2. **Document your dashboard URLs** with descriptive names
3. **Test connectivity** after configuration
4. **Clear sensitive data** when sharing your device
5. **Rotate credentials** regularly
6. **Use site-specific URLs** for multi-tenancy

## API Integration (Future Enhancement)

The configuration stored in this interface can be used by other components for:
- Tableau REST API calls
- Dashboard embedding
- Data source connections
- Automated workbook publishing
- Usage analytics retrieval

## Related Documentation

- [Tableau Integration Guide](./TABLEAU_INTEGRATION.md)
- [Tableau Products Used](./TABLEAU_PRODUCTS_USED.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Security Best Practices](./SECURITY.md)

## Support

For questions about Tableau integration:
- Review Tableau's official documentation
- Check the Tableau Developer Platform resources
- Contact your Tableau administrator for credentials
- Refer to the inline help text in the interface

---

**Note**: This feature is designed for demonstration and development purposes. For production deployments, implement proper authentication flows, secret management, and security controls as outlined in the [Security](./SECURITY.md) documentation.
