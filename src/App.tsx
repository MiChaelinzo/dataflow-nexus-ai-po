import { useState, useMemo, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ChartBar, 
  Sparkle, 
  TrendUp, 
  Funnel, 
  Shield, 
  Function, 
  Users, 
  ChartLineUp, 
  VideoCamera, 
  FileText, 
  ArrowsLeftRight, 
  SunHorizon, 
  House, 
  UserCircle,
  SquaresFour,
  ShareNetwork
} from '@phosphor-icons/react'
import { MetricCard } from '@/components/MetricCard'
import { TimeSeriesChart } from '@/components/TimeSeriesChart'
import { PredictionChart } from '@/components/PredictionChart'
import { InsightGenerator } from '@/components/InsightGenerator'
import { DataGovernance } from '@/components/DataGovernance'
import { SemanticLayer } from '@/components/SemanticLayer'
import { CollaborationHub } from '@/components/CollaborationHub'
import { TableauEmbed } from '@/components/TableauEmbed'
import { TableauAPIShowcase } from '@/components/TableauAPIShowcase'
import { TableauPulse } from '@/components/TableauPulse'
import { SessionReplay } from '@/components/SessionReplay'
import { MentionNotifications } from '@/components/MentionNotifications'
import { ReportBuilder } from '@/components/ReportBuilder'
import { ComparisonReport } from '@/components/ComparisonReport'
import { YoYComparison } from '@/components/YoYComparison'
import { SeasonalInsights } from '@/components/SeasonalInsights'
import { WelcomePage } from '@/components/WelcomePage'
import { AuthGate } from '@/components/AuthGate'
import { UserProfile, useUserActivity, useUserStats } from '@/components/UserProfile'
import { WorkspaceManager } from '@/components/WorkspaceManager'
import { SharedDashboards } from '@/components/SharedDashboards'
import { generateMetrics, generateTimeSeriesData, generateCategoryData, generatePredictionData } from '@/lib/data'
import { Insight } from '@/lib/types'
import { motion } from 'framer-motion'
import { Toaster } from '@/components/ui/sonner'
import { LiveCursors } from '@/components/LiveCursor'
import { PresenceIndicator } from '@/components/PresenceIndicator'
import { useCollaboration } from '@/hooks/use-collaboration'
import { useKV } from '@github/spark/hooks'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

function App() {
  const [showWelcome, setShowWelcome] = useKV<boolean>('welcome-page-seen', true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [user, setUser] = useState<{ login: string; avatarUrl: string; isOwner: boolean } | null>(null)
  
  const metrics = useMemo(() => generateMetrics(), [])
  const timeSeriesData = useMemo(() => generateTimeSeriesData(30), [])
  const categoryData = useMemo(() => generateCategoryData(), [])
  const predictionData = useMemo(() => generatePredictionData(), [])
  
  const [insights] = useKV<Insight[]>('analytics-insights', [])
  
  const { currentUser, cursors, activeUsers } = useCollaboration({
    currentView: activeTab,
    enabled: true
  })
  
  const { trackActivity } = useUserActivity()
  const { incrementStat } = useUserStats()
  
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userInfo = await window.spark.user()
        setUser(userInfo)
      } catch (error) {
        console.error('Failed to load user:', error)
      }
    }
    
    loadUser()
  }, [])
  
  useEffect(() => {
    trackActivity('view', `Viewed ${activeTab} tab`, activeTab)
  }, [activeTab, trackActivity])
  
  const handleGetStarted = () => {
    setShowWelcome(false)
  }
  
  if (showWelcome) {
    return (
      <>
        <WelcomePage onGetStarted={handleGetStarted} />
        <Toaster />
      </>
    )
  }
  
  return (
    <AuthGate>
      <div className="min-h-screen bg-background text-foreground">
        <div className="grid-background fixed inset-0 opacity-30" />
        
        <div className="relative z-10">
          <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-20">
            <div className="max-w-[1600px] mx-auto px-6 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <motion.h1 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-3xl font-bold tracking-tight"
                  >
                    Analytics Intelligence Platform
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-muted-foreground mt-1"
                  >
                    Real-time insights powered by AI and advanced analytics
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
                    onClick={() => setShowWelcome(true)}
                    className="gap-2"
                  >
                    <House size={16} weight="duotone" />
                    <span className="hidden sm:inline">Welcome</span>
                  </Button>
                  <MentionNotifications currentUserId={currentUser.userId} />
                  <PresenceIndicator users={activeUsers} />
                  <Badge className="text-sm px-4 py-2 bg-accent/20 text-accent border-accent/30 gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    Live Data
                  </Badge>
                  
                  {user && (
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-2 h-10 px-3">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={user.avatarUrl} alt={user.login} />
                            <AvatarFallback className="text-xs">
                              {user.login[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="hidden md:inline">{user.login}</span>
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
            <TabsList className="grid w-full max-w-[1600px] grid-cols-7 lg:grid-cols-14 h-auto p-1">
              <TabsTrigger value="dashboard" className="gap-2 py-3">
                <ChartBar size={18} weight="duotone" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="workspaces" className="gap-2 py-3">
                <SquaresFour size={18} weight="duotone" />
                <span className="hidden sm:inline">Workspaces</span>
              </TabsTrigger>
              <TabsTrigger value="shared" className="gap-2 py-3">
                <ShareNetwork size={18} weight="duotone" />
                <span className="hidden sm:inline">Shared</span>
              </TabsTrigger>
              <TabsTrigger value="tableau" className="gap-2 py-3">
                <ChartLineUp size={18} weight="duotone" />
                <span className="hidden sm:inline">Tableau</span>
              </TabsTrigger>
              <TabsTrigger value="pulse" className="gap-2 py-3">
                <Sparkle size={18} weight="duotone" />
                <span className="hidden sm:inline">Pulse</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="gap-2 py-3">
                <Sparkle size={18} weight="duotone" />
                <span className="hidden sm:inline">AI Insights</span>
              </TabsTrigger>
              <TabsTrigger value="seasonal" className="gap-2 py-3">
                <SunHorizon size={18} weight="duotone" />
                <span className="hidden sm:inline">Seasonal</span>
              </TabsTrigger>
              <TabsTrigger value="predictions" className="gap-2 py-3">
                <TrendUp size={18} weight="duotone" />
                <span className="hidden sm:inline">Predictions</span>
              </TabsTrigger>
              <TabsTrigger value="semantic" className="gap-2 py-3">
                <Function size={18} weight="duotone" />
                <span className="hidden sm:inline">Semantic</span>
              </TabsTrigger>
              <TabsTrigger value="governance" className="gap-2 py-3">
                <Shield size={18} weight="duotone" />
                <span className="hidden sm:inline">Governance</span>
              </TabsTrigger>
              <TabsTrigger value="collaborate" className="gap-2 py-3">
                <Users size={18} weight="duotone" />
                <span className="hidden sm:inline">Collaborate</span>
              </TabsTrigger>
              <TabsTrigger value="replay" className="gap-2 py-3">
                <VideoCamera size={18} weight="duotone" />
                <span className="hidden sm:inline">Replay</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="gap-2 py-3">
                <FileText size={18} weight="duotone" />
                <span className="hidden sm:inline">Reports</span>
              </TabsTrigger>
              <TabsTrigger value="comparison" className="gap-2 py-3">
                <ArrowsLeftRight size={18} weight="duotone" />
                <span className="hidden sm:inline">Compare</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="space-y-6">
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
                <TimeSeriesChart 
                  data={timeSeriesData}
                  title="Revenue Trend (Last 30 Days)"
                  color="oklch(0.70 0.15 195)"
                />
                
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-6">Revenue by Segment</h3>
                  <div className="space-y-4">
                    {categoryData.map((item, index) => {
                      const total = categoryData.reduce((sum, d) => sum + d.value, 0)
                      const percentage = (item.value / total) * 100
                      
                      return (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          className="space-y-2"
                        >
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{item.label}</span>
                            <span className="font-mono text-muted-foreground">
                              ${(item.value / 1000).toFixed(0)}K
                            </span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ delay: 0.5 + index * 0.1, duration: 0.6, ease: 'easeOut' }}
                              className="h-full bg-gradient-to-r from-accent to-metric-purple"
                            />
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                <Card className="p-6 bg-gradient-to-br from-warning/10 via-card to-primary/10 border-warning/20">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-warning/20 flex items-center justify-center">
                        <SunHorizon size={24} weight="fill" className="text-warning" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        Discover Seasonal Patterns
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        AI analyzes historical data to detect seasonal trends and provides automated recommendations for peak and low periods.
                      </p>
                      <Badge 
                        className="cursor-pointer bg-warning text-background hover:bg-warning/90"
                        onClick={() => setActiveTab('seasonal')}
                      >
                        View Seasonal Insights →
                      </Badge>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-accent/10 via-card to-metric-purple/10 border-accent/20">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                        <Sparkle size={24} weight="fill" className="text-accent" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        Want AI-powered insights from your data?
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Switch to the AI Insights tab to generate personalized recommendations and discover hidden patterns in your metrics.
                      </p>
                      <Badge 
                        className="cursor-pointer bg-accent text-accent-foreground hover:bg-accent/90"
                        onClick={() => setActiveTab('insights')}
                      >
                        Generate Insights →
                      </Badge>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6 bg-gradient-to-br from-success/10 via-card to-accent/10 border-success/20">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-success/20 flex items-center justify-center">
                        <Users size={24} weight="fill" className="text-success" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        Collaborate in real-time
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        See your team's cursors live, track who's viewing what, and collaborate seamlessly on analytics.
                      </p>
                      <Badge 
                        className="cursor-pointer bg-success text-white hover:bg-success/90"
                        onClick={() => setActiveTab('collaborate')}
                      >
                        View Collaboration →
                      </Badge>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6 bg-gradient-to-br from-metric-purple/10 via-card to-accent/10 border-metric-purple/20">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-metric-purple/20 flex items-center justify-center">
                        <ShareNetwork size={24} weight="fill" className="text-metric-purple" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        Share dashboards with your team
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Create shared dashboards, manage permissions, and collaborate across workspaces.
                      </p>
                      <Badge 
                        className="cursor-pointer bg-metric-purple text-white hover:bg-metric-purple/90"
                        onClick={() => setActiveTab('shared')}
                      >
                        View Shared Dashboards →
                      </Badge>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="workspaces" className="space-y-6">
              <WorkspaceManager />
            </TabsContent>
            
            <TabsContent value="shared" className="space-y-6">
              <SharedDashboards />
            </TabsContent>
            
            <TabsContent value="tableau" className="space-y-6">
              <Tabs defaultValue="embed" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="embed">Dashboard Embeds</TabsTrigger>
                  <TabsTrigger value="api">REST API</TabsTrigger>
                </TabsList>
                <TabsContent value="embed" className="mt-6">
                  <TableauEmbed />
                </TabsContent>
                <TabsContent value="api" className="mt-6">
                  <TableauAPIShowcase />
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="pulse" className="space-y-6">
              <TableauPulse metrics={metrics} />
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <InsightGenerator metrics={metrics} />
            </TabsContent>
            
            <TabsContent value="seasonal" className="space-y-6">
              <SeasonalInsights metrics={metrics} />
            </TabsContent>
            
            <TabsContent value="predictions" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <PredictionChart 
                  data={predictionData}
                  title="Revenue Forecast with Confidence Intervals"
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
                  <p className="text-3xl font-bold font-mono text-success">+23.4%</p>
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
                  <p className="text-3xl font-bold font-mono text-metric-purple">$3.51M</p>
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

            <TabsContent value="comparison" className="space-y-6">
              <Tabs defaultValue="period" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="period">Period Comparison</TabsTrigger>
                  <TabsTrigger value="yoy">Year-over-Year</TabsTrigger>
                </TabsList>
                
                <TabsContent value="period" className="mt-6">
                  <ComparisonReport
                    metrics={metrics}
                    timeSeriesData={timeSeriesData}
                  />
                </TabsContent>
                
                <TabsContent value="yoy" className="mt-6">
                  <YoYComparison />
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </main>
        
        <footer className="border-t border-border/50 mt-16">
          <div className="max-w-[1600px] mx-auto px-6 py-6">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <p>Analytics Intelligence Platform - Tableau Hackathon 2026</p>
              <p>Powered by AI & Advanced Analytics</p>
            </div>
          </div>
        </footer>
      </div>
      
      <LiveCursors cursors={cursors} />
      <Toaster />
    </div>
    </AuthGate>
  )
}

export default App
