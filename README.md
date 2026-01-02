# Analytics Intelligence Platform

An enterprise-grade analytics intelligence platform showcasing the future of Tableau integration - combining real-time metrics, AI-powered insights, semantic data modeling, and actionable analytics in a stunning visual interface.

## 🎯 Overview

This platform demonstrates cutting-edge analytics capabilities including:

- **Live Analytics Dashboard** with real-time metric visualization
- **AI-Powered Insights** using LLM-based analysis and Tableau Pulse integration
- **Semantic Data Layer** with natural language querying
- **Predictive Analytics** with confidence intervals and forecasting
- **Data Governance** with audit trails and access controls
- **Real-Time Collaboration** with live cursors and session replay
- **Advanced Reporting** with scheduled exports and comparisons
- **Slack Integration** for team notifications and workflow automation

Built with React, TypeScript, Tailwind CSS, and the Spark runtime SDK.

## ✨ Key Features

### 🔐 GitHub Authentication
Secure authentication with personalized user profiles, activity tracking, and role-based access control.

### 📊 Interactive Dashboards
Real-time visualization of KPIs with animated metric cards, trend charts, and drill-down capabilities.

### 🤖 AI Insight Generation
LLM-powered analysis that surfaces actionable business insights with confidence scoring and recommendations.

### 🔮 Predictive Analytics
Advanced forecasting models with confidence intervals, seasonal trend detection, and scenario analysis.

### 🎯 Tableau Pulse Integration
Proactive AI-driven insights delivered automatically with Slack notifications and priority-based filtering.

### 🔍 Semantic Query Layer
Natural language interface to query data - just type what you want to know and get instant visualizations.

### 🛡️ Data Governance
Comprehensive data lineage, access controls, audit logs, and quality monitoring for enterprise compliance.

### 👥 Real-Time Collaboration
See team members' cursors live, track activity, add annotations, and replay collaboration sessions.

### 📹 Session Replay
Record and playback user sessions with full interaction timelines for training and workflow analysis.

### 📈 Advanced Reporting
Year-over-year comparisons, seasonal insights, automated report scheduling, and flexible export options.

### 💬 Slack Integration
Configure automated notification rules to send insights and alerts directly to team channels.

### 🏢 Workspace Management
Create and manage multiple workspaces with team sharing, permissions, and activity feeds.

## 🚀 Quick Start

The application is pre-configured and ready to run in your Spark environment.

1. **Launch**: The app starts automatically in your Spark Codespace
2. **Authenticate**: Sign in with your GitHub account
3. **Explore**: Navigate through tabs to discover different analytics features
4. **Generate Insights**: Click "Generate Insights" to see AI-powered analysis
5. **Collaborate**: Invite team members to see real-time collaboration features

## 🎨 Design Philosophy

The interface combines **command center aesthetics** with **sophisticated analytics design**:

- **Bold Color Palette**: Electric blue primary with cyan accents on dark backgrounds
- **Typography**: Space Grotesk for headlines, Inter for body, JetBrains Mono for data
- **Animations**: Purposeful micro-interactions that reinforce live, intelligent data
- **Layout**: Grid-based responsive design optimized for data density

## 🛠️ Technology Stack

- **Frontend**: React 19 with TypeScript
- **Styling**: Tailwind CSS v4 with custom theme
- **UI Components**: Shadcn v4 component library
- **Icons**: Phosphor Icons
- **Charts**: Recharts for visualizations
- **Animation**: Framer Motion
- **State Management**: React hooks with Spark KV persistence
- **AI Integration**: Spark LLM SDK for insights generation

## 📁 Project Structure

```
src/
├── App.tsx                      # Main application with tab navigation
├── components/
│   ├── ui/                      # Shadcn component library (40+ components)
│   ├── MetricCard.tsx           # Animated metric displays
│   ├── TimeSeriesChart.tsx      # Time-based data visualization
│   ├── InsightGenerator.tsx     # AI-powered insight generation
│   ├── TableauPulse.tsx         # Tableau Pulse integration
│   ├── SemanticLayer.tsx        # Natural language queries
│   ├── DataGovernance.tsx       # Security and compliance
│   ├── CollaborationHub.tsx     # Real-time collaboration
│   ├── SessionReplay.tsx        # Session recording/playback
│   ├── ReportBuilder.tsx        # Custom report creation
│   ├── WorkspaceManager.tsx     # Workspace management
│   ├── SharedDashboards.tsx     # Dashboard sharing
│   └── ...more
├── hooks/
│   ├── use-collaboration.ts     # Real-time collaboration state
│   ├── use-session-recorder.ts  # Session recording logic
│   └── use-mobile.ts            # Responsive breakpoint detection
├── lib/
│   ├── utils.ts                 # Helper functions
│   ├── data.ts                  # Sample data generators
│   └── types.ts                 # TypeScript definitions
├── index.css                    # Theme and global styles
└── main.tsx                     # App entry point
```

## 🎯 Core Tabs & Features

### Dashboard
Overview of key metrics with trend analysis and quick access to other features.

### Workspaces
Create and manage multiple workspaces with team collaboration and permissions.

### Shared
View and manage dashboards shared with your team, including access controls.

### Activity
Comprehensive activity feed with heatmaps, forecasting, and trend comparisons.

### Tableau
Embedded Tableau dashboards and REST API integration showcase.

### Pulse
Tableau Pulse integration with AI-driven insights and Slack notifications.

### AI Insights
Generate contextual insights from your data using LLM analysis.

### Seasonal
Detect seasonal patterns, peak/low periods, and get automated recommendations.

### Predictions
Forecast future trends with confidence intervals and scenario modeling.

### Semantic
Natural language data querying with business-friendly metric definitions.

### Governance
Data lineage, access controls, audit logs, and quality monitoring.

### Collaborate
Real-time collaboration with live cursors, presence indicators, and annotations.

### Replay
Record and playback collaboration sessions with full interaction history.

### Reports
Build custom reports with scheduling, export options, and template library.

### Compare
Period-over-period and year-over-year comparison with seasonal analysis.

## 🔑 Key Technologies

### Spark Runtime SDK
Leverages the global `spark` API for:
- **LLM Integration**: `spark.llm()` for AI-powered insights
- **User Management**: `spark.user()` for authentication
- **Persistence**: `spark.kv` for data storage
- **React Hooks**: `useKV` for reactive state management

### Data Persistence
All user data, preferences, insights, and workspaces persist between sessions using the Spark KV store.

### Real-Time Features
Live collaboration features track multiple users with cursor positions, active views, and presence indicators.

## 📊 Sample Data

The application includes rich sample data demonstrating:
- Historical metrics with trends and comparisons
- Time-series data for visualization
- User activities and collaboration events
- Workspace configurations and team sharing
- Generated insights with confidence scores

## 🎓 Learning Resources

Additional documentation files:
- `PRD.md` - Complete product requirements document
- `HACKATHON_README.md` - Tableau hackathon submission details
- `TABLEAU_INTEGRATION.md` - Tableau embed and API integration guide
- `TABLEAU_PULSE.md` - Pulse integration documentation
- `SESSION_REPLAY.md` - Session recording feature guide
- `SLACK_INTEGRATION.md` - Slack notification setup
- `WORKSPACES_AND_SHARING.md` - Workspace management guide
- `SEASONAL_INSIGHTS.md` - Seasonal analysis documentation

## 🤝 Contributing

This is a demonstration project showcasing advanced analytics capabilities. Feel free to explore the code, adapt patterns for your own projects, and experiment with the Spark SDK features.

## 📄 License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.

---

**Built for Tableau Hackathon 2026** | Powered by AI & Advanced Analytics
