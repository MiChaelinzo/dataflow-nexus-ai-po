import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { 
  ChartBar, 
  ArrowsClockwise,
  Play,
  Pause, 
  ArrowsOut, 
  ArrowsIn,
  X,
  LinkSimple,
  Warning
} from '@phosphor-icons/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { motion, AnimatePresence } from 'framer-motion'

interface TableauConfig {
  serverUrl: string
  siteName: string
  username: string
  password: string
  personalAccessTokenName: string
  personalAccessTokenSecret: string
  dashboardUrls: string[]
}

interface DashboardEntry {
  id: string
  url: string
  name: string
}

export function TableauViewer() {
  const [config] = useKV<TableauConfig>('tableau-config', {
    serverUrl: '',
    siteName: '',
    username: '',
    password: '',
    personalAccessTokenName: '',
    personalAccessTokenSecret: '',
    dashboardUrls: []
  })

  const [dashboards] = useKV<DashboardEntry[]>('tableau-dashboards', [])
  const [selectedDashboard, setSelectedDashboard] = useState<DashboardEntry | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [quickViewUrl, setQuickViewUrl] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const isConfigured = config && config.serverUrl && (config.username || config.personalAccessTokenName)

  const handleQuickView = () => {
    if (!quickViewUrl) return
    
    const tempDashboard: DashboardEntry = {
      id: `temp-${Date.now()}`,
      url: quickViewUrl,
      name: 'Quick View Dashboard'
    }
    setSelectedDashboard(tempDashboard)
    setIsLoading(true)
  }

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
    setIsLoading(true)
  }

  const renderDashboardEmbed = () => {
    if (!selectedDashboard) return null

    const embedUrl = selectedDashboard.url

    return (
      <motion.div
        key={`${selectedDashboard.id}-${refreshKey}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`relative bg-white rounded-lg overflow-hidden ${
          isFullscreen ? 'fixed inset-0 z-50' : 'h-[600px]'
        }`}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground">Loading dashboard...</p>
            </div>
          </div>
        )}
        
        <iframe
          src={embedUrl}
          className="w-full h-full border-0"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />

        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="shadow-lg"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? (
              <ArrowsIn size={16} weight="bold" />
            ) : (
              <ArrowsOut size={16} weight="bold" />
            )}
          </Button>
          
          {isFullscreen && (
            <Button
              size="sm"
              variant="secondary"
              className="shadow-lg"
              onClick={() => setIsFullscreen(false)}
            >
              <X size={16} weight="bold" />
            </Button>
          )}
        </div>
      </motion.div>
    )
  }

  if (!isConfigured) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Alert>
          <Warning size={18} weight="duotone" />
          <AlertDescription className="space-y-3">
            <p>Tableau Server is not configured. Please configure your connection in Settings.</p>
            <Button
              size="sm"
              className="gap-2"
              onClick={() => {
                const tabsList = document.querySelector('[role="tablist"]')
                const settingsTab = Array.from(tabsList?.querySelectorAll('[role="tab"]') || [])
                  .find(el => el.textContent?.includes('Settings'))
                ;(settingsTab as HTMLElement)?.click()
              }}
            >
              Go to Settings
            </Button>
          </AlertDescription>
        </Alert>
        <Card className="p-12 mt-6">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <ChartBar size={40} weight="duotone" className="text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Tableau Dashboard Viewer</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                View and interact with embedded Tableau dashboards directly in this interface
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tableau Dashboard Viewer</h2>
          <p className="text-sm text-muted-foreground mt-1">
            View and interact with embedded Tableau dashboards
          </p>
        </div>
        {selectedDashboard && (
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={handleRefresh}
          >
            <ArrowsClockwise size={16} weight="bold" />
            Refresh
          </Button>
        )}
      </div>

      <Tabs defaultValue="quick-view" className="w-full">
        <TabsList>
          <TabsTrigger value="quick-view">Quick View</TabsTrigger>
          <TabsTrigger value="saved">Saved Dashboards</TabsTrigger>
          <TabsTrigger value="samples">Sample Dashboards</TabsTrigger>
        </TabsList>

        <TabsContent value="quick-view" className="space-y-6">
          {selectedDashboard && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{selectedDashboard.name}</CardTitle>
                <CardDescription>Viewing: {selectedDashboard.url}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <AnimatePresence mode="wait">
                  {renderDashboardEmbed()}
                </AnimatePresence>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick View URL</CardTitle>
              <CardDescription>
                Enter a Tableau dashboard URL to view it instantly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="quick-url" className="sr-only">Dashboard URL</Label>
                  <Input
                    id="quick-url"
                    placeholder="https://public.tableau.com/views/..."
                    value={quickViewUrl}
                    onChange={(e) => setQuickViewUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleQuickView()
                      }
                    }}
                  />
                </div>
                <Button onClick={handleQuickView} className="gap-2">
                  <Play size={16} weight="fill" />
                  View
                </Button>
              </div>
              
              <Alert className="mt-4">
                <LinkSimple size={18} weight="duotone" />
                <AlertDescription>
                  Make sure the dashboard URL allows embedding and is publicly accessible.
                </AlertDescription>
              </Alert>
              
              {selectedDashboard?.id.startsWith('temp-') && (
                <div className="pt-4">
                  <Separator className="mb-6" />
                  <AnimatePresence mode="wait">
                    {renderDashboardEmbed()}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Saved Dashboards</CardTitle>
              <CardDescription>Your configured Tableau dashboards</CardDescription>
            </CardHeader>
            <CardContent>
              {(dashboards || []).length === 0 ? (
                <div className="text-center py-12">
                  <ChartBar size={48} weight="duotone" className="text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">No dashboards saved yet</p>
                  <Button size="sm" variant="outline" className="mt-4">
                    Add Dashboard
                  </Button>
                </div>
              ) : (
                <div className="grid gap-3">
                  {(dashboards || []).map((dashboard) => (
                    <Button
                      key={dashboard.id}
                      variant="outline"
                      size="lg"
                      className="w-full justify-start gap-3"
                      onClick={() => {
                        setSelectedDashboard(dashboard)
                        setIsLoading(true)
                      }}
                    >
                      <ChartBar size={20} weight="duotone" />
                      {dashboard.name}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {selectedDashboard && !selectedDashboard.id.startsWith('temp-') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{selectedDashboard.name}</CardTitle>
                <CardDescription>Viewing: {selectedDashboard.url}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <AnimatePresence mode="wait">
                  {renderDashboardEmbed()}
                </AnimatePresence>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="samples" className="space-y-6">
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-base">Sample Tableau Public Dashboards</CardTitle>
              <CardDescription>Try these example URLs to see the viewer in action</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  name: 'COVID-19 Dashboard',
                  url: 'https://public.tableau.com/views/COVID-19Cases_16788612007390/Dashboard1'
                },
                {
                  name: 'Sales Performance',
                  url: 'https://public.tableau.com/views/RegionalSampleWorkbook/Storms'
                },
                {
                  name: 'World Indicators',
                  url: 'https://public.tableau.com/views/WorldIndicators/GDPpercapita'
                }
              ].map((sample, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    setQuickViewUrl(sample.url)
                    const tempDashboard: DashboardEntry = {
                      id: `temp-${Date.now()}`,
                      url: sample.url,
                      name: sample.name
                    }
                    setSelectedDashboard(tempDashboard)
                    setIsLoading(true)
                  }}
                >
                  <ChartBar size={16} weight="duotone" />
                  {sample.name}
                </Button>
              ))}
            </CardContent>
          </Card>

          {selectedDashboard?.id.startsWith('temp-') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{selectedDashboard.name}</CardTitle>
                <CardDescription>Viewing: {selectedDashboard.url}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <AnimatePresence mode="wait">
                  {renderDashboardEmbed()}
                </AnimatePresence>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
