# Planning Guide

Create a professional API testing interface for validating Tableau REST API calls with request/response visualization, authentication handling, and comprehensive debugging capabilities.

**Experience Qualities**: 
1. **Professional** - Clean, technical interface that inspires confidence in developers and API testers
2. **Transparent** - Clear visibility into request/response cycles with detailed logging and error handling
3. **Efficient** - Quick setup and execution of API calls with saved configurations and reusable templates

**Complexity Level**: Light Application (multiple features with basic state)
This is a focused API testing tool with authentication, request building, response handling, and history tracking - similar complexity to Postman but focused specifically on Tableau REST API.

## Essential Features

### Authentication Manager
- **Functionality**: Handle Tableau authentication (sign-in, token management, site selection)
- **Purpose**: Securely authenticate users before making API calls
- **Trigger**: User enters server URL, username, password, and site
- **Progression**: Input credentials → Sign in → Store auth token → Enable API requests → Auto-refresh on expiry
- **Success criteria**: Successfully obtain and store authentication token, display token status and expiry

### API Request Builder
- **Functionality**: Construct and customize Tableau REST API requests with method, endpoint, headers, and body
- **Purpose**: Allow flexible API call configuration for any Tableau REST endpoint
- **Trigger**: User selects endpoint from dropdown or enters custom URL
- **Progression**: Select method (GET/POST/PUT/DELETE) → Choose/enter endpoint → Configure headers → Add request body if needed → Execute request
- **Success criteria**: Support all HTTP methods, dynamic endpoint building, custom header management, JSON body editing

### Response Viewer
- **Functionality**: Display API responses with syntax highlighting, status codes, headers, and timing
- **Purpose**: Provide clear visibility into API response data for debugging and validation
- **Trigger**: API request completes
- **Progression**: Request sent → Show loading state → Display status code → Render formatted response → Show response time and size
- **Success criteria**: Properly formatted JSON/XML, color-coded status codes, collapsible response sections, copy-to-clipboard functionality

### Request History
- **Functionality**: Store and recall previous API requests with timestamps
- **Purpose**: Enable quick re-execution of common requests and track testing sessions
- **Trigger**: Any API request is executed
- **Progression**: Request completes → Save to history → Display in sidebar → Click to load → Modify and re-execute
- **Success criteria**: Persistent history storage, search/filter capabilities, clear history action, export history

### Common Endpoints Library
- **Functionality**: Pre-configured templates for common Tableau REST API endpoints
- **Purpose**: Speed up testing with ready-to-use endpoint configurations
- **Trigger**: User browses endpoint library
- **Progression**: View categories → Select endpoint → Load template → Customize parameters → Execute
- **Success criteria**: Cover major Tableau REST API operations (workbooks, views, users, sites, data sources)

## Edge Case Handling

- **Authentication Failure**: Display clear error messages with troubleshooting tips for invalid credentials or server issues
- **Network Errors**: Show timeout/connection errors with retry options and network status indicators
- **Invalid JSON**: Validate request body before sending, highlight syntax errors in editor
- **Token Expiration**: Detect 401 responses, automatically prompt re-authentication, preserve current request state
- **Large Responses**: Implement pagination/truncation for massive responses, offer download option
- **Missing Required Fields**: Validate required parameters before allowing request execution

## Design Direction

The design should evoke a professional developer tool with a dark, high-contrast interface that reduces eye strain during extended testing sessions. Think modern API clients like Postman or Insomnia, but with Tableau-specific optimizations. The interface should feel precise, technical, and trustworthy.

## Color Selection

A dark, developer-focused palette with accent colors for status indicators and syntax highlighting.

- **Primary Color**: Electric Blue (oklch(0.55 0.18 240)) - Technical and precise, used for primary actions and active states
- **Secondary Colors**: 
  - Deep Slate (oklch(0.20 0.015 240)) - Main background for reduced eye strain
  - Steel Gray (oklch(0.35 0.02 240)) - Card backgrounds and panels
- **Accent Color**: Cyan (oklch(0.70 0.15 200)) - Attention-grabbing for CTAs, success indicators, and interactive elements
- **Foreground/Background Pairings**:
  - Background (Deep Slate oklch(0.20 0.015 240)): Light text (oklch(0.95 0.01 240)) - Ratio 11.2:1 ✓
  - Primary (Electric Blue oklch(0.55 0.18 240)): White text (oklch(0.98 0 0)) - Ratio 5.8:1 ✓
  - Accent (Cyan oklch(0.70 0.15 200)): Dark text (oklch(0.20 0.015 240)) - Ratio 5.2:1 ✓
  - Success (Green oklch(0.65 0.15 145)): White text - Ratio 4.9:1 ✓
  - Error (Red oklch(0.55 0.22 25)): White text - Ratio 5.1:1 ✓

## Font Selection

Professional, monospace-friendly typography that enhances code readability while maintaining clean UI text. Use JetBrains Mono for all code/JSON displays and Inter for UI elements to create a modern developer tool aesthetic.

- **Typographic Hierarchy**:
  - H1 (Main Title): Inter Bold/24px/tight letter spacing - Used for main "API Tester" heading
  - H2 (Section Headers): Inter SemiBold/18px/normal spacing - Request builder, response viewer sections
  - H3 (Subsections): Inter Medium/14px/normal spacing - Headers, status labels
  - Body Text: Inter Regular/14px/1.5 line height - General UI text, descriptions
  - Code/JSON: JetBrains Mono Regular/13px/1.6 line height - All request/response data
  - Labels: Inter Medium/12px/uppercase/wide spacing - Input labels, method badges

## Animations

Animations should enhance the technical, responsive feel of the interface. Use quick, purposeful transitions that don't delay actions but provide feedback. Focus on state changes (loading → success/error), smooth panel expansions, and subtle hover effects on interactive elements. Avoid decorative animations that could distract from the core testing workflow.

## Component Selection

- **Components**: 
  - Tabs (Shadcn) for switching between Request/Response/History views
  - Select (Shadcn) for HTTP method and endpoint selection dropdowns with search
  - Input (Shadcn) for URL parameters and header key-value pairs
  - Textarea (Shadcn) for JSON request body with monospace styling
  - Button (Shadcn) with variants for Send/Clear/Save actions
  - Card (Shadcn) for grouping related controls and displaying responses
  - Badge (Shadcn) for HTTP status codes with color coding (green=2xx, yellow=3xx, red=4xx/5xx)
  - Alert (Shadcn) for error messages and warnings
  - Accordion (Shadcn) for collapsible response sections (body, headers, timing)
  - ScrollArea (Shadcn) for long response bodies and request history
  - Dialog (Shadcn) for authentication modal and endpoint template selector
  - Separator (Shadcn) for visual division between sections

- **Customizations**: 
  - Custom JSON editor with syntax highlighting using basic color coding
  - Status badge component with dynamic color based on HTTP status code
  - Request history item component with timestamp, method, and URL preview
  - Endpoint template card with description and quick-load action

- **States**: 
  - Buttons: Default (blue), Hover (brighter blue), Loading (spinner + disabled), Success (green pulse), Error (red shake)
  - Inputs: Default (gray border), Focus (cyan border + glow), Error (red border)
  - Response sections: Loading (skeleton), Success (green border), Error (red border + error icon)

- **Icon Selection**: 
  - PaperPlaneTilt for Send request
  - Key for Authentication
  - ClockCounterClockwise for History
  - Code for JSON/Code view
  - Copy for Copy to clipboard
  - Check for Success indicators
  - Warning for Error states
  - CaretDown/CaretUp for Accordion toggles
  - Lightning for Quick templates

- **Spacing**: 
  - Use Tailwind's 4-unit spacing (1rem/16px) as base for consistent gaps
  - Container padding: p-6 (24px) for main content areas
  - Card padding: p-4 (16px) for grouped elements
  - Gap between form elements: gap-4 (16px)
  - Tight gaps for related items: gap-2 (8px)

- **Mobile**: 
  - Stack request builder and response viewer vertically on mobile
  - Collapsible sidebar for endpoint templates and history
  - Full-width inputs and dropdowns
  - Sticky header with authentication status
  - Bottom sheet for history access on mobile
  - Touch-friendly button sizes (min 44px height)
