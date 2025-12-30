# Multi-User Workspaces & Shared Dashboards Feature

## Overview

The Analytics Intelligence Platform now includes comprehensive multi-user workspace and shared dashboard capabilities, enabling teams to organize, collaborate, and manage analytics across different organizational structures.

## Key Features

### 🏢 Multi-User Workspaces

#### Workspace Types
- **Personal Workspaces**: Private spaces for individual users
- **Team Workspaces**: Shared spaces for specific teams or departments
- **Organization Workspaces**: Company-wide spaces for cross-functional collaboration

#### Workspace Management
- Create unlimited workspaces with custom names and descriptions
- Color-coded workspaces for visual organization
- Favorite workspaces for quick access
- Search and filter workspaces by type, visibility, and activity
- Duplicate workspaces to quickly set up similar structures
- Track workspace activity (last modified, total dashboards, member count)

#### Visibility Controls
- **Private**: Only invited members can access
- **Shared**: Team members can view content
- **Public**: Anyone in the organization can view

#### Member Management
- Add team members to workspaces with specific roles
- Manage member permissions and access levels
- View member activity and join dates
- Remove members or update their roles
- Track who has access to each workspace

### 📊 Shared Dashboards

#### Dashboard Creation
- Create dashboards within workspaces
- Add rich descriptions and metadata
- Tag dashboards for easy discovery
- Set visibility levels (private, workspace, organization, public)
- Generate shareable links automatically

#### Permission Management
Four distinct permission levels:
- **Viewer**: Can only view dashboard content
- **Commenter**: Can view and add comments
- **Editor**: Can view, comment, and edit dashboards
- **Admin**: Full control including sharing and deletion

#### Sharing Features
- Share dashboards via email invitation
- Copy shareable links for quick distribution
- Manage access permissions per user
- View all users with access to each dashboard
- Track sharing history and granted permissions

#### Dashboard Organization
- Mark dashboards as favorites for quick access
- View recently modified dashboards
- Filter by tags, workspace, or visibility
- Track dashboard views and engagement metrics
- See comment counts and activity

#### Access Requests
- Users can request access to private dashboards
- Dashboard owners receive pending access requests
- Approve or reject requests with one click
- Track request history and status
- Notify users when access is granted

## User Interface

### Workspaces Tab
Navigate to the **Workspaces** tab to:
- View all your workspaces in a card-based grid layout
- Create new workspaces with the "New Workspace" button
- Filter workspaces by: All, Favorites, or Recent
- Click any workspace to view details and manage members
- See quick stats: total workspaces, favorites, dashboards, and members

### Shared Dashboards Tab
Navigate to the **Shared** tab to:
- View all dashboards you own or have access to
- Create new shared dashboards
- Filter dashboards by: All, Favorites, or Recent
- See pending share requests requiring your action
- Click any dashboard to manage permissions and settings

### Workspace Details Dialog
When you click a workspace, you'll see:
- **Overview**: Quick stats, type, visibility, and owner info
- **Members**: Full list of workspace members with roles
- **Settings**: Options to duplicate, share, edit, or delete

### Dashboard Details Dialog
When you click a dashboard, you'll see:
- **Overview**: Activity stats, visibility, owner, and share link
- **Permissions**: All users with access and their permission levels
- **Settings**: Options to duplicate, edit, copy link, or delete

## Workflow Examples

### Example 1: Creating a Team Workspace
1. Click **Workspaces** tab
2. Click **New Workspace** button
3. Enter workspace details:
   - Name: "Marketing Analytics"
   - Description: "Dashboards for marketing team"
   - Type: Team
   - Visibility: Shared
   - Choose a color
4. Click **Create Workspace**
5. Invite team members by clicking on the workspace and going to Members tab

### Example 2: Sharing a Dashboard
1. Click **Shared** tab
2. Click **New Dashboard** button
3. Enter dashboard details and set visibility
4. Click **Create Dashboard**
5. In the dashboard details, go to **Permissions** tab
6. Click **Share** button
7. Enter colleague's email and select permission level
8. Click **Share** to grant access

### Example 3: Managing Access Requests
1. Navigate to **Shared** tab
2. Look for the yellow "Pending Share Requests" card
3. Review each request with user details and message
4. Click **Approve** to grant access or **Reject** to deny
5. User will be notified of your decision

## Data Persistence

All workspace and dashboard data is persisted using the Spark KV store:
- **user-workspaces**: Stores all workspace configurations
- **shared-dashboards**: Stores all dashboard metadata and permissions
- **share-requests**: Tracks pending and processed access requests
- **current-user-info**: Stores current user details for ownership tracking

Data persists across browser sessions and page refreshes.

## Collaboration Benefits

### For Teams
- **Organized Structure**: Separate workspaces for different projects and teams
- **Clear Ownership**: Know who owns each workspace and dashboard
- **Flexible Sharing**: Share at workspace or individual dashboard level
- **Activity Tracking**: See who's accessing what and when

### For Managers
- **Permission Control**: Fine-grained access control per user
- **Visibility Management**: Control what's private, shared, or public
- **Usage Analytics**: Track views, comments, and engagement
- **Quick Approval**: Manage access requests efficiently

### For Individual Users
- **Personal Organization**: Create personal workspaces for your own dashboards
- **Easy Discovery**: Find dashboards through favorites, recent activity, and tags
- **Request Access**: Request access to dashboards you need
- **Collaboration**: Comment and collaborate on shared dashboards

## Security & Permissions

### Role-Based Access Control
Each workspace and dashboard implements strict role-based access:
- Owners have full control
- Admins can manage members and settings
- Editors can create and modify content
- Viewers have read-only access

### Visibility Layers
Multiple layers of access control:
1. **Workspace-level**: Controls who can see the workspace exists
2. **Dashboard-level**: Controls who can view specific dashboards
3. **Permission-level**: Controls what actions users can take

### Audit Trail
Track important actions:
- When dashboards were created and modified
- Who granted access to whom
- When members joined workspaces
- Access request history

## Integration with Existing Features

### Works With Collaboration Features
- Real-time presence in shared dashboards
- Comments and mentions across shared content
- Live cursors for collaborative editing
- Session replay for shared dashboard activity

### Works With Analytics Features
- Share AI-generated insights across teams
- Collaborate on seasonal analysis
- Distribute scheduled reports to workspace members
- Share Tableau embeds within workspaces

## Best Practices

### Organizing Workspaces
1. Create workspaces by department or project
2. Use descriptive names and detailed descriptions
3. Choose distinct colors for easy visual identification
4. Set appropriate visibility levels for each workspace
5. Regularly review and clean up unused workspaces

### Managing Dashboard Access
1. Start with private visibility and expand as needed
2. Grant minimum necessary permissions
3. Regularly audit who has access to sensitive dashboards
4. Use tags to organize dashboards within workspaces
5. Leverage favorites for frequently accessed dashboards

### Collaboration Tips
1. Use comments feature for dashboard discussions
2. @mention team members for notifications
3. Share dashboard links instead of duplicating content
4. Set up role-based digest subscriptions for updates
5. Request access when needed instead of asking directly

## Technical Implementation

### Components
- `WorkspaceManager.tsx`: Main workspace management interface
- `SharedDashboards.tsx`: Dashboard sharing and permission management
- Both components integrate with existing collaboration and team management

### Data Structures
```typescript
interface Workspace {
  id: string
  name: string
  description: string
  type: 'personal' | 'team' | 'organization'
  visibility: 'private' | 'shared' | 'public'
  ownerId: string
  ownerName: string
  members: WorkspaceMember[]
  dashboards: number
  createdAt: number
  lastModified: number
  color: string
  isFavorite?: boolean
}

interface SharedDashboard {
  id: string
  name: string
  description: string
  workspaceId: string
  visibility: 'private' | 'workspace' | 'organization' | 'public'
  shareLink?: string
  permissions: DashboardPermission[]
  views: number
  comments: number
  tags: string[]
  // ... additional fields
}
```

## Future Enhancements

Potential improvements for future iterations:
- Dashboard templates within workspaces
- Workspace-level analytics and reports
- Integration with external identity providers
- Advanced permission inheritance rules
- Workspace activity feeds
- Dashboard version history
- Bulk permission management
- Custom workspace roles

## Support

For questions or issues with workspaces and shared dashboards:
1. Check this documentation for guidance
2. Review the in-app tooltips and help text
3. Contact your system administrator
4. Submit feedback through the user profile menu

---

**Last Updated**: January 2026  
**Feature Version**: 1.0  
**Compatible With**: Analytics Intelligence Platform v2.0+
