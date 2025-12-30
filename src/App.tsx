import { useState, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChartBar, Sparkle, TrendUp, Funnel, Shield, Function, Users, ChartLineUp } from '@phosphor-icons/react'
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
import { generateMetrics, generateTimeSeriesData, generateCategoryData, generatePredictionData } from '@/lib/data'
import { motion } from 'framer-motion'
import { Toaster } from '@/components/ui/sonner'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  
  const metrics = useMemo(() => generateMetrics(), [])
  const timeSeriesData = useMemo(() => generateTimeSeriesData(30), [])
  const categoryData = useMemo(() => generateCategoryData(), [])
  const predictionData = useMemo(() => generatePredictionData(), [])
  
  return (
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
              >
                <Badge className="text-sm px-4 py-2 bg-accent/20 text-accent border-accent/30 gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  Live Data
                </Badge>
              </motion.div>
            </div>
          </div>
        </header>
        
        <main className="max-w-[1600px] mx-auto px-6 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-[1600px] grid-cols-4 lg:grid-cols-9 h-auto p-1">
              <TabsTrigger value="dashboard" className="gap-2 py-3">
                <ChartBar size={18} weight="duotone" />
                <span className="hidden sm:inline">Dashboard</span>
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
              <TabsTrigger value="explorer" className="gap-2 py-3">
                <Funnel size={18} weight="duotone" />
                <span className="hidden sm:inline">Explorer</span>
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
              >
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
              </motion.div>
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
            
            <TabsContent value="explorer" className="space-y-6">
              <Card className="p-12 text-center border-dashed">
                <Funnel size={64} weight="thin" className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Advanced Data Explorer</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Interactive data exploration with multi-dimensional filtering, custom segmentation, and export capabilities coming soon.
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="semantic" className="space-y-6">
              <SemanticLayer />
            </TabsContent>

            <TabsContent value="governance" className="space-y-6">
              <DataGovernance />
            </TabsContent>

            <TabsContent value="collaborate" className="space-y-6">
              <CollaborationHub />
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
      
      <Toaster />
    </div>
  )
}

export default App
