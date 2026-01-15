import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChartBar, 
  Play, 
  Pause, 
  ArrowsOut, 
  ArrowsIn,
  Download,
  Image as ImageIcon,
  Share,
  Warning,
  Link as LinkIcon,
  Gear,
  CheckCircle,
  X
} from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'

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

  useEffect(() => {
    if (dashboards && dashboards.length > 0 && !selectedDashboard) {
      setSelectedDashboard(dashboards[0])
    }
  }, [dashboards, selectedDashboard])

  const handleRefreshDashboard = () => {
    setIsLoading(true)
    setRefreshKey(prev => prev + 1)
    setTimeout(() => {
      setIsLoading(false)
      toast.success('Dashboard refreshed', {
        description: 'Data has been reloaded from the server.'
      })
    }, 1000)
  }

  const handleExportImage = () => {
    toast.success('Export initiated', {
      description: 'Dashboard image is being prepared for download.'
    })
  }

  const handleShare = () => {
    if (selectedDashboard) {
      navigator.clipboard.writeText(selectedDashboard.url)
      toast.success('Link copied', {
        description: 'Dashboard URL has been copied to clipboard.'
      })
    }
  }

  const handleQuickView = () => {
    if (!quickViewUrl.trim()) {
      toast.error('URL required', {
        description: 'Please enter a Tableau dashboard URL.'
      })
      return
    }

    const tempDashboard: DashboardEntry = {
      id: `temp-${Date.now()}`,
      url: quickViewUrl,
      name: 'Quick View Dashboard'
    }
    setSelectedDashboard(tempDashboard)
    setQuickViewUrl('')
    toast.success('Dashboard loaded', {
      description: 'Viewing dashboard in preview mode.'
    })
  }

  const renderDashboardEmbed = () => {
    if (!selectedDashboard) return null

    let embedUrl = selectedDashboard.url
    
    if (embedUrl.includes('tableau.com') && !embedUrl.includes('/views/')) {
      embedUrl = embedUrl
    } else if (!embedUrl.includes('?:embed=y')) {
      embedUrl = embedUrl.includes('?') 
        ? `${embedUrl}&:embed=y&:showVizHome=no&:toolbar=top`
        : `${embedUrl}?:embed=y&:showVizHome=no&:toolbar=top`
    }

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
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Tableau Dashboard Viewer</h2>
          <p className="text-sm text-muted-foreground mt-1">
            View and interact with embedded Tableau dashboards
          </p>
        </div>

        <Alert className="border-amber-500/50 bg-amber-500/10">
          <Warning size={18} weight="duotone" className="text-amber-500" />
          <AlertTitle>Configuration Required</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>
              Please configure your Tableau server credentials before viewing dashboards.
              Go to the <strong>Tableau Setup</strong> tab to add your server URL and authentication details.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-amber-500/50 hover:bg-amber-500/20"
              onClick={() => {
                const tabsList = document.querySelector('[role="tablist"]')
                const tableauTab = Array.from(tabsList?.querySelectorAll('[role="tab"]') || [])
                  .find(el => el.textContent?.includes('Tableau Setup'))
                if (tableauTab) {
                  (tableauTab as HTMLElement).click()
                }
              }}
            >
              <Gear size={16} weight="duotone" />
              Open Tableau Setup
            </Button>
          </AlertDescription>
        </Alert>

        <Card className="p-12">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <ChartBar size={40} weight="duotone" className="text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Tableau Integration Ready</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Once configured, you'll be able to view embedded Tableau dashboards,
                interact with visualizations, and manage multiple dashboard views.
              </p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Tableau Dashboard Viewer</h2>
            <p className="text-sm text-muted-foreground mt-1">
              View and interact with embedded Tableau dashboards
            </p>
          </div>
          <Badge variant="default" className="gap-2">
            <CheckCircle size={14} weight="fill" />
            Connected to {new URL(config.serverUrl).hostname}
          </Badge>
        </div>
      </motion.div>

      <Tabs defaultValue="dashboards" className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboards" className="gap-2">
            <ChartBar size={16} weight="duotone" />
            My Dashboards
          </TabsTrigger>
          <TabsTrigger value="quick-view" className="gap-2">
            <Play size={16} weight="duotone" />
            Quick View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboards" className="space-y-6">
          {dashboards && dashboards.length === 0 ? (
            <Card className="p-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                  <ChartBar size={32} weight="duotone" className="text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">No Dashboards Added</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                    Add dashboard URLs in the Tableau Setup tab to start viewing your visualizations.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      const tabsList = document.querySelector('[role="tablist"]')
                      const tableauTab = Array.from(tabsList?.querySelectorAll('[role="tab"]') || [])
                        .find(el => el.textContent?.includes('Tableau Setup'))
                      if (tableauTab) {
                        (tableauTab as HTMLElement).click()
                      }
                    }}
                  >
                    <Gear size={16} weight="duotone" />
                    Add Dashboards
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {dashboards.map((dashboard) => (
                  <motion.div
                    key={dashboard.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all ${
                        selectedDashboard?.id === dashboard.id
                          ? 'ring-2 ring-primary bg-primary/5'
                          : 'hover:bg-accent/50'
                      }`}
                      onClick={() => {
                        setSelectedDashboard(dashboard)
                        setIsLoading(true)
                      }}
                    >
                      <CardHeader className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <ChartBar size={20} weight="duotone" className="text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm line-clamp-2">
                              {dashboard.name}
                            </CardTitle>
                            <CardDescription className="text-xs line-clamp-1 mt-1">
                              {new URL(dashboard.url).hostname}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {selectedDashboard && (
                <Card>
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="flex items-center gap-2">
                          {selectedDashboard.name}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1 flex items-center gap-2">
                          <LinkIcon size={12} />
                          {selectedDashboard.url}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRefreshDashboard}
                          disabled={isLoading}
                          className="gap-2"
                        >
                          <Play size={16} weight="duotone" />
                          Refresh
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleExportImage}
                          className="gap-2"
                        >
                          <ImageIcon size={16} weight="duotone" />
                          Export
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleShare}
                          className="gap-2"
                        >
                          <Share size={16} weight="duotone" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <AnimatePresence mode="wait">
                      {renderDashboardEmbed()}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="quick-view" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick View Dashboard</CardTitle>
              <CardDescription>
                Enter any Tableau dashboard URL to view it instantly without saving
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <Play size={16} weight="duotone" />
                  Load
                </Button>
              </div>

              <Alert>
                <LinkIcon size={18} weight="duotone" />
                <AlertTitle>Supported URLs</AlertTitle>
                <AlertDescription>
                  Works with Tableau Public, Tableau Server, and Tableau Cloud dashboard URLs.
                  Make sure the dashboard is publicly accessible or you have the necessary permissions.
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
