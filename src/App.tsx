import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ChartBar, 
  Sparkle, 
  TrendUp, 
  Shield, 
  Function, 
  Users, 
  VideoCamera, 
  FileText, 
  SunHorizon, 
  House, 
  SquaresFour,
  ShareNetwork,
  Download,
  CalendarCheck,
  Gear,
  Lightning,
  ChatCircleDots
} from '@phosphor-icons/react'
import { Toaster } from 'sonner'
import { useKV } from '@github/spark/hooks'

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// Feature Components
import { MetricCard } from '@/components/MetricCard'
import { TimeSeriesChart } from '@/components/TimeSeriesChart'
import { PredictionChart } from '@/components/PredictionChart'
import { InsightGenerator } from '@/components/InsightGenerator'
import { DataGovernance } from '@/components/DataGovernance'
import { SemanticLayer } from '@/components/SemanticLayer'
import { CollaborationHub } from '@/components/CollaborationHub'
import { SessionReplay } from '@/components/SessionReplay'
import { MentionNotifications } from '@/components/MentionNotifications'
import { ReportBuilder } from '@/components/ReportBuilder'
import { SeasonalInsights } from '@/components/SeasonalInsights'
import { WelcomePage } from '@/components/WelcomePage'
import { AuthGate } from '@/components/AuthGate'
import { UserProfile, useUserStats } from '@/components/UserProfile'
import { WorkspaceManager } from '@/components/WorkspaceManager'
import { SharedDashboards } from '@/components/SharedDashboards'
import { LiveCursors } from '@/components/LiveCursor'
import { PresenceIndicator } from '@/components/PresenceIndicator'
import { MouseTrail } from '@/components/MouseTrail'
import { SafeErrorBoundary } from '@/components/SafeErrorBoundary'
import { ExportButton } from '@/components/ExportButton'
import { DataExportPanel } from '@/components/DataExportPanel'
import { ScheduledExportManager } from '@/components/ScheduledExportManager'
import { TableauSettings } from '@/components/TableauSettings'
import { TableauViewer } from '@/components/TableauViewer'
import { FunnelChart } from '@/components/FunnelChart'
import { GaugeChart } from '@/components/GaugeChart'
import { AreaChart } from '@/components/AreaChart'
import { RadarChart } from '@/components/RadarChart'
import { DonutChart } from '@/components/DonutChart'
import { InteractiveBarChart } from '@/components/InteractiveBarChart'
import { DrillDownData } from '@/components/DrillDownDialog'
import { AnomalyDetector } from '@/components/AnomalyDetector'
import { NaturalLanguageQuery } from '@/components/NaturalLanguageQuery'

// Hooks & Libs
import { useCollaboration } from '@/hooks/use-collaboration'
import { 
  generateMetrics, 
  generateTimeSeriesData, 
  generateCategoryData, 
  generatePredictionData,
  generateFunnelData,
  generateDonutData,
  generateRadarData,
  generateEngagementData
} from '@/lib/data'
import { Insight } from '@/lib/types'
import { exportMetrics, exportChartData, exportInsights, ExportFormat } from '@/lib/data-export'

function App() {
  const [hasSeenWelcome, setHasSeenWelcome] = useKV<boolean>('welcome-page-seen', false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [user, setUser] = useState<{ login: string; avatarUrl?: string; isOwner?: boolean } | null>(null)
  
  const [insights] = useKV<Insight[]>('analytics-insights', [])
  
  const metrics = useMemo(() => generateMetrics(), [])
  const timeSeriesData = useMemo(() => generateTimeSeriesData(30), [])
  const categoryData = useMemo(() => generateCategoryData(), [])
  const predictionData = useMemo(() => generatePredictionData(), [])
  const funnelData = useMemo(() => generateFunnelData(), [])
  const donutData = useMemo(() => generateDonutData(), [])
  const radarData = useMemo(() => generateRadarData(), [])
  const engagementData = useMemo(() => generateEngagementData(), [])
  
  // Collaboration Hook
  const { currentUser, cursors, activeUsers } = useCollaboration({
    currentView: activeTab,
    enabled: true
  })
  
  // Analytics/Stats Hooks
  const { addActivity, incrementStat } = useUserStats()
  const trackActivity = addActivity // Alias for consistency

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (window.spark?.user) {
          const userInfo = await window.spark.user()
          setUser(userInfo)
        }
      } catch (error) {
        console.error('Failed to load user:', error)
      }
    }
    loadUser()
  }, [])
  
  useEffect(() => {
    trackActivity(`Viewed ${activeTab} tab`, 'view', activeTab)
  }, [activeTab, trackActivity])
  
  const handleGetStarted = () => {
    setHasSeenWelcome(true)
  }

  const handleExportMetrics = (format: ExportFormat, filename: string, includeHeaders: boolean) => {
    exportMetrics(metrics, format, { filename, includeHeaders })
    trackActivity(`Exported metrics as ${format.toUpperCase()}`, 'report', 'metrics')
  }

  const handleExportTimeSeriesData = (format: ExportFormat, filename: string, includeHeaders: boolean) => {
    exportChartData(timeSeriesData, format, { filename, includeHeaders })
    trackActivity(`Exported time series data as ${format.toUpperCase()}`, 'report', 'timeseries')
  }

  const handleExportCategoryData = (format: ExportFormat, filename: string, includeHeaders: boolean) => {
    exportChartData(categoryData, format, { filename, includeHeaders })
    trackActivity(`Exported category data as ${format.toUpperCase()}`, 'report', 'category')
  }

  const handleSegmentDrillDown = (item: any, index: number): DrillDownData | null => {
    trackActivity(`Drilled down into ${item.label} segment`, 'view', 'drill-down')
    
    return {
      title: `${item.label} - Detailed Analysis`,
      value: `$${(item.value / 1000).toFixed(1)}K`,
      category: 'Revenue Segment',
      breakdown: [
        { label: 'Q1 Revenue', value: Math.floor(item.value * 0.22), percentage: 22, trend: 'up' as const, change: 5.2 },
        { label: 'Q2 Revenue', value: Math.floor(item.value * 0.28), percentage: 28, trend: 'up' as const, change: 8.1 },
        { label: 'Q3 Revenue', value: Math.floor(item.value * 0.25), percentage: 25, trend: 'neutral' as const, change: 0 },
        { label: 'Q4 Revenue', value: Math.floor(item.value * 0.25), percentage: 25, trend: 'down' as const, change: -2.3 },
      ],
      timeSeries: Array.from({ length: 12 }, (_, i) => ({
        date: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        value: Math.floor(item.value * (0.06 + Math.random() * 0.04))
      })),
      metadata: {
        period: 'Last 12 Months',
        total: item.value,
        average: Math.floor(item.value / 12),
        highest: { label: 'June 2024', value: Math.floor(item.value * 0.12) },
        lowest: { label: 'January 2024', value: Math.floor(item.value * 0.06) }
      },
      insights: [
        `${item.label} shows consistent growth with ${((Math.random() * 20) + 10).toFixed(1)}% year-over-year increase.`,
        `Peak performance observed in Q2, driven by seasonal demand and successful marketing campaigns.`,
        `Opportunity to optimize Q4 performance through targeted promotions and customer engagement strategies.`
      ]
    }
  }

  const handleDonutDrillDown = (segment: any, index: number): DrillDownData | null => {
    trackActivity(`Drilled down into ${segment.label} device segment`, 'view', 'drill-down')
    
    return {
      title: `${segment.label} Traffic Analysis`,
      value: segment.value.toLocaleString(),
      category: 'Device Analytics',
      breakdown: [
        { label: 'New Users', value: Math.floor(segment.value * 0.35), percentage: 35, trend: 'up' as const, change: 12.4 },
        { label: 'Returning Users', value: Math.floor(segment.value * 0.65), percentage: 65, trend: 'up' as const, change: 6.2 },
      ],
      timeSeries: Array.from({ length: 14 }, (_, i) => ({
        date: `Day ${i + 1}`,
        value: Math.floor(segment.value * (0.05 + Math.random() * 0.05))
      })),
      metadata: {
        period: 'Last 14 Days',
        total: segment.value,
        average: Math.floor(segment.value / 14),
        highest: { label: 'Day 7', value: Math.floor(segment.value * 0.09) },
        lowest: { label: 'Day 1', value: Math.floor(segment.value * 0.05) }
      },
      insights: [
        `${segment.label} users demonstrate ${segment.percent.toFixed(1)}% of total traffic with strong engagement patterns.`,
        `Conversion rate on ${segment.label.toLowerCase()} devices is ${(Math.random() * 3 + 2).toFixed(1)}% above platform average.`,
        `User session duration averages ${(Math.random() * 5 + 3).toFixed(1)} minutes, indicating quality engagement.`
      ]
    }
  }

  const handleFunnelDrillDown = (stage: any, index: number): DrillDownData | null => {
    trackActivity(`Drilled down into ${stage.label} funnel stage`, 'view', 'drill-down')
    
    const conversionRate = index > 0 ? (stage.value / funnelData[index - 1].value) * 100 : 100
    
    return {
      title: `${stage.label} - Conversion Analysis`,
      value: stage.value.toLocaleString(),
      category: 'Funnel Stage',
      breakdown: [
        { label: 'Direct Traffic', value: Math.floor(stage.value * 0.40), percentage: 40, trend: 'up' as const, change: 7.8 },
        { label: 'Organic Search', value: Math.floor(stage.value * 0.30), percentage: 30, trend: 'up' as const, change: 11.2 },
        { label: 'Paid Ads', value: Math.floor(stage.value * 0.20), percentage: 20, trend: 'neutral' as const, change: 0 },
        { label: 'Referrals', value: Math.floor(stage.value * 0.10), percentage: 10, trend: 'up' as const, change: 15.3 },
      ],
      timeSeries: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
        value: Math.floor(stage.value * (0.12 + Math.random() * 0.05))
      })),
      metadata: {
        period: 'Last 7 Days',
        total: stage.value,
        average: Math.floor(stage.value / 7),
        highest: { label: 'Friday', value: Math.floor(stage.value * 0.16) },
        lowest: { label: 'Monday', value: Math.floor(stage.value * 0.12) }
      },
      insights: [
        `${stage.label} stage converts at ${conversionRate.toFixed(1)}% from the previous step.`,
        `Optimization potential identified: improving user experience could increase conversions by ${(Math.random() * 10 + 5).toFixed(1)}%.`,
        `Best performing day: Friday with ${(Math.random() * 20 + 10).toFixed(1)}% above average conversions.`
      ]
    }
  }


  if (!hasSeenWelcome) {
    return (
      <>
        <WelcomePage onGetStarted={handleGetStarted} />
        <Toaster />
      </>
    )
  }
  
  return (
    <AuthGate>
      <div className="min-h-screen bg-background text-foreground relative">
        <div className="grid-background fixed inset-0 opacity-30 pointer-events-none" />
        
        <div className="relative z-10">
          <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-20">
            <div className="max-w-[1600px] mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <motion.h1 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-2xl font-bold tracking-tight"
                  >
                    Next-Gen Analytics Platform
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-sm text-muted-foreground"
                  >
                    Smart anomaly detection, AI insights, and collaborative analytics
                  </motion.p>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setHasSeenWelcome(false)}
                    className="gap-2"
                  >
                    <House size={16} weight="duotone" />
                    <span className="hidden sm:inline">Welcome</span>
                  </Button>
                  
                  <MentionNotifications currentUserId={currentUser?.userId || 'anonymous'} />
                  <PresenceIndicator users={activeUsers} />
                  
                  <Badge className="text-xs px-3 py-1 bg-accent/20 text-accent border-accent/30 gap-2 hidden sm:flex">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    Live Data
                  </Badge>
                  
                  {user && (
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-2 h-9 px-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={user.avatarUrl} alt={user.login} />
                            <AvatarFallback className="text-[10px]">
                              {user.login?.[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="hidden md:inline text-sm">{user.login}</span>
                        </Button>
                      </SheetTrigger>
                      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                        <SheetHeader>
                          <SheetTitle>User Profile</SheetTitle>
                          <SheetDescription>
                            Your activity and statistics
                          </SheetDescription>
                        </SheetHeader>
                        <div className="mt-6">
                          <UserProfile />
                        </div>
                      </SheetContent>
                    </Sheet>
                  )}
                </motion.div>
              </div>
            </div>
          </header>
        
          <main className="max-w-[1600px] mx-auto px-6 py-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="w-full overflow-x-auto pb-2 scrollbar-none">
                <TabsList className="inline-flex h-auto p-1 w-max min-w-full justify-start">
                  <TabsTrigger value="dashboard" className="gap-2 py-2 px-4">
                    <ChartBar size={16} weight="duotone" />
                    <span>Dashboard</span>
                  </TabsTrigger>
                  <TabsTrigger value="workspaces" className="gap-2 py-2 px-4">
                    <SquaresFour size={16} weight="duotone" />
                    <span>Workspaces</span>
                  </TabsTrigger>
                  <TabsTrigger value="shared" className="gap-2 py-2 px-4">
                    <ShareNetwork size={16} weight="duotone" />
                    <span>Shared</span>
                  </TabsTrigger>
                  <TabsTrigger value="export" className="gap-2 py-2 px-4">
                    <Download size={16} weight="duotone" />
                    <span>Export</span>
                  </TabsTrigger>
                  <TabsTrigger value="scheduled" className="gap-2 py-2 px-4">
                    <CalendarCheck size={16} weight="duotone" />
                    <span>Scheduled</span>
                  </TabsTrigger>
                  <TabsTrigger value="insights" className="gap-2 py-2 px-4">
                    <Sparkle size={16} weight="duotone" />
                    <span>AI Insights</span>
                  </TabsTrigger>
                  <TabsTrigger value="seasonal" className="gap-2 py-2 px-4">
                    <SunHorizon size={16} weight="duotone" />
                    <span>Seasonal</span>
                  </TabsTrigger>
                  <TabsTrigger value="anomalies" className="gap-2 py-2 px-4">
                    <Lightning size={16} weight="duotone" />
                    <span>Anomalies</span>
                  </TabsTrigger>
                  <TabsTrigger value="nlquery" className="gap-2 py-2 px-4">
                    <ChatCircleDots size={16} weight="duotone" />
                    <span>Ask Data</span>
                  </TabsTrigger>
                  <TabsTrigger value="predictions" className="gap-2 py-2 px-4">
                    <TrendUp size={16} weight="duotone" />
                    <span>Predictions</span>
                  </TabsTrigger>
                  <TabsTrigger value="semantic" className="gap-2 py-2 px-4">
                    <Function size={16} weight="duotone" />
                    <span>Semantic</span>
                  </TabsTrigger>
                  <TabsTrigger value="governance" className="gap-2 py-2 px-4">
                    <Shield size={16} weight="duotone" />
                    <span>Governance</span>
                  </TabsTrigger>
                  <TabsTrigger value="collaborate" className="gap-2 py-2 px-4">
                    <Users size={16} weight="duotone" />
                    <span>Collaborate</span>
                  </TabsTrigger>
                  <TabsTrigger value="replay" className="gap-2 py-2 px-4">
                    <VideoCamera size={16} weight="duotone" />
                    <span>Replay</span>
                  </TabsTrigger>
                  <TabsTrigger value="reports" className="gap-2 py-2 px-4">
                    <FileText size={16} weight="duotone" />
                    <span>Reports</span>
                  </TabsTrigger>
                  <TabsTrigger value="tableau" className="gap-2 py-2 px-4">
                    <ChartBar size={16} weight="duotone" />
                    <span>Tableau</span>
                  </TabsTrigger>
                  <TabsTrigger value="tableau-settings" className="gap-2 py-2 px-4">
                    <Gear size={16} weight="duotone" />
                    <span>Tableau Setup</span>
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="dashboard" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Overview of key performance indicators
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ExportButton
                      onExport={handleExportMetrics}
                      defaultFilename="metrics-overview"
                      title="Export Metrics"
                      description="Export all current metrics with trends and changes"
                      label="Export Metrics"
                    />
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {metrics.map((metric, index) => (
                      <motion.div
                        key={metric.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                      >
                        <MetricCard metric={metric} />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold">Revenue Trend (Last 30 Days)</h3>
                      <ExportButton
                        onExport={handleExportTimeSeriesData}
                        defaultFilename="revenue-trend"
                        title="Export Time Series"
                        description="Export revenue trend data for the last 30 days"
                        variant="ghost"
                        size="sm"
                        label="Export"
                      />
                    </div>
                    <TimeSeriesChart 
                      data={timeSeriesData}
                      title=""
                      color="oklch(0.70 0.15 195)"
                    />
                  </Card>
                  
                  <div className="md:col-span-1">
                    <InteractiveBarChart
                      data={categoryData.map(item => ({
                        label: item.label,
                        value: item.value,
                        trend: Math.random() > 0.5 ? 'up' as const : 'down' as const,
                        change: Math.random() * 10
                      }))}
                      title="Revenue by Segment"
                      subtitle="Click any bar to see detailed breakdown"
                      onBarClick={handleSegmentDrillDown}
                    />
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  <Card className="p-6 bg-gradient-to-br from-yellow-500/10 via-card to-background border-yellow-500/20">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                          <SunHorizon size={20} weight="fill" className="text-yellow-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold mb-1">
                          Seasonal Patterns
                        </h3>
                        <p className="text-xs text-muted-foreground mb-3">
                           AI-detected trends and peak recommendations.
                        </p>
                        <Badge 
                          className="cursor-pointer bg-yellow-600 text-white hover:bg-yellow-700"
                          onClick={() => setActiveTab('seasonal')}
                        >
                          View Trends →
                        </Badge>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-gradient-to-br from-accent/10 via-card to-background border-accent/20">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                          <Sparkle size={20} weight="fill" className="text-accent" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold mb-1">
                          AI Insights
                        </h3>
                        <p className="text-xs text-muted-foreground mb-3">
                          Generate actionable recommendations.
                        </p>
                        <Badge 
                          className="cursor-pointer bg-accent text-accent-foreground hover:bg-accent/90"
                          onClick={() => setActiveTab('insights')}
                        >
                          Generate →
                        </Badge>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-6 bg-gradient-to-br from-green-500/10 via-card to-background border-green-500/20">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                          <Users size={20} weight="fill" className="text-green-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold mb-1">
                          Collaboration
                        </h3>
                        <p className="text-xs text-muted-foreground mb-3">
                          Track live cursors and shared views.
                        </p>
                        <Badge 
                          className="cursor-pointer bg-green-600 text-white hover:bg-green-700"
                          onClick={() => setActiveTab('collaborate')}
                        >
                          Join Hub →
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                  <FunnelChart 
                    data={funnelData}
                    title="Conversion Funnel Analysis"
                    onStageClick={handleFunnelDrillDown}
                  />
                  
                  <DonutChart 
                    data={donutData}
                    title="Traffic by Device"
                    centerLabel="Total Sessions"
                    onSegmentClick={handleDonutDrillDown}
                  />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.4 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                  <GaugeChart 
                    value={12847}
                    max={15000}
                    title="Customer Retention"
                    subtitle="Current active customers vs target"
                  />
                  
                  <div className="lg:col-span-2">
                    <AreaChart 
                      data={engagementData}
                      title="User Engagement Trend (14 Days)"
                      color="oklch(0.60 0.18 290)"
                      secondaryColor="oklch(0.70 0.15 195)"
                    />
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1, duration: 0.4 }}
                >
                  <RadarChart 
                    data={radarData}
                    title="Product Performance Metrics"
                    color="oklch(0.65 0.15 145)"
                  />
                </motion.div>
              </TabsContent>
              
              <TabsContent value="workspaces" className="space-y-6">
                <WorkspaceManager />
              </TabsContent>
              
              <TabsContent value="shared" className="space-y-6">
                <SharedDashboards />
              </TabsContent>
              
              <TabsContent value="export" className="space-y-6">
                <DataExportPanel
                  metrics={metrics}
                  timeSeriesData={timeSeriesData}
                  categoryData={categoryData}
                  insights={insights || []}
                />
              </TabsContent>
              
              <TabsContent value="scheduled" className="space-y-6">
                <ScheduledExportManager />
              </TabsContent>

              <TabsContent value="insights" className="space-y-6">
                <SafeErrorBoundary>
                  <InsightGenerator metrics={metrics} />
                </SafeErrorBoundary>
              </TabsContent>
              
              <TabsContent value="seasonal" className="space-y-6">
                <SafeErrorBoundary>
                  <SeasonalInsights metrics={metrics} />
                </SafeErrorBoundary>
              </TabsContent>
              
              <TabsContent value="anomalies" className="space-y-6">
                <SafeErrorBoundary>
                  <AnomalyDetector metrics={metrics} />
                </SafeErrorBoundary>
              </TabsContent>
              
              <TabsContent value="nlquery" className="space-y-6">
                <SafeErrorBoundary>
                  <NaturalLanguageQuery />
                </SafeErrorBoundary>
              </TabsContent>
              
              <TabsContent value="predictions" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <PredictionChart 
                    data={predictionData}
                    title="Revenue Forecast"
                  />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <Card className="p-6">
                    <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
                      Predicted Growth
                    </p>
                    <p className="text-3xl font-bold font-mono text-green-500">+23.4%</p>
                    <p className="text-xs text-muted-foreground mt-2">Over next 14 days</p>
                  </Card>
                  
                  <Card className="p-6">
                    <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
                      Confidence Level
                    </p>
                    <p className="text-3xl font-bold font-mono text-accent">87%</p>
                    <p className="text-xs text-muted-foreground mt-2">Model accuracy score</p>
                  </Card>
                  
                  <Card className="p-6">
                    <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
                      Expected Revenue
                    </p>
                    <p className="text-3xl font-bold font-mono text-purple-500">$3.51M</p>
                    <p className="text-xs text-muted-foreground mt-2">14-day forecast</p>
                  </Card>
                </motion.div>
              </TabsContent>
              
              <TabsContent value="semantic" className="space-y-6">
                <SemanticLayer />
              </TabsContent>

              <TabsContent value="governance" className="space-y-6">
                <DataGovernance />
              </TabsContent>

              <TabsContent value="collaborate" className="space-y-6">
                <CollaborationHub activeUsers={activeUsers} currentUser={currentUser} />
              </TabsContent>

              <TabsContent value="replay" className="space-y-6">
                <SessionReplay
                  currentUserId={currentUser.userId}
                  currentUserName={currentUser.userName}
                  currentUserColor={currentUser.userColor}
                  currentView={activeTab}
                />
              </TabsContent>

              <TabsContent value="reports" className="space-y-6">
                <ReportBuilder
                  metrics={metrics}
                  timeSeriesData={timeSeriesData}
                  categoryData={categoryData}
                  predictionData={predictionData}
                  insights={insights || []}
                />
              </TabsContent>

              <TabsContent value="tableau" className="space-y-6">
                <TableauViewer />
              </TabsContent>

              <TabsContent value="tableau-settings" className="space-y-6">
                <TableauSettings />
              </TabsContent>
            </Tabs>
          </main>
          
          <footer className="border-t border-border/50 mt-16 bg-background/50 backdrop-blur-sm">
            <div className="max-w-[1600px] mx-auto px-6 py-6">
              <div className="flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground gap-4">
                <p>© 2026 Analytics Intelligence Platform. All rights reserved.</p>
                <div className="flex items-center gap-4">
                  <p>Powered by AI & Advanced Analytics</p>
                  <span className="hidden md:inline">•</span>
                  <p>Tableau Hackathon 2026</p>
                </div>
              </div>
            </div>
          </footer>
        </div>
        
        <LiveCursors cursors={cursors} />
        <MouseTrail />
        <Toaster />
      </div>
    </AuthGate>
  )
}

export default App