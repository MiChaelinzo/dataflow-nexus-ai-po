import { useState, useEffect } from 'react'
import { 
import { 
  ChartBar, 
  Arrows
  Pause, 
  ArrowsOut, 
  ArrowsIn,
} from '@ph
import { Card, CardCo
import {
import { A
import { Label } fr
import 
interface Tabl
  s
  password: string
  personalAccessTokenSecret: string
}
interface DashboardEntry {
  url: string
}
export function TableauViewer() {
    serverUrl: '',
    username: '',
    personalAccessTokenName: '
    dashboardUrls: []

  const [selectedDashboar
  const [isLoading,
  const [refreshKe
  const isConfigur
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


      <motion.div
        initial={{ opacity: 0 }}
     
          isFullscreen ? 'fixed inset

          <div className="absolute inset
              <div cla
            </div>
        )}
        <iframe
          className="w-full h-full border-0"
          onLoad={() => setIsLoading(false)}
        
        <div
   

          >
              <ArrowsIn size={16} weigh
              <ArrowsOut size={16} weight="bold" />
      
   

              className="shad
            >
            </Button>
        </div>
    )

    r
   

          </p>

          <Warning size={18} weight
          <AlertDescription className="space-y-3">
        
            
     

                const tabsList = document.q
                  .find(el => e
                  (table
              }}
     
            </Button>
        </Alert>
        <Card className="p-12">
            <div className="w-20 h-20 rounded-full bg-p
      
   

              </p>
          </div>

  }
  re
      <motion.div
        animate={{ opacit
        <div className="flex items-center justify
            <h2 className="text-2xl font
              View and interact with embedded Tableau dashboa
          </div>
     

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
                   
     
   

                      
            
                        >
             
                        <Button
                          size="sm"
                          className="gap-2"
              
              

                  <CardContent className="p-0">
                      {renderDashboardEmbed()}
                  </CardContent>
              )}
          )}

          <Card>
              <C
                Ent
            </CardHeader>
              <div clas
                  <Label htmlFor="quick-url" className="sr-only">Dashboar
                    id="quick-
                    value={quickViewUrl}
                    onKeyDown={(e) => {
                        handleQuickView()
                    }}
                </div>
                 
                

                <LinkIcon size={18} weight="duoto
                <AlertDescriptio
                  Mak
              </Alert>
              {s

                    {renderDash
                </div>
            </CardContent>

            <CardH
              <Ca
            <CardContent className="space-y-3">
                {
                  url: 'https://public.tableau.com/views/COVID-19Cases_1678861200739
                {
                  
                {
                
              ]
            
     
   

          
                    }
                 
                >
                  {sample.name}
       
          </Card>
      </Tabs>
  )































































































































































































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
