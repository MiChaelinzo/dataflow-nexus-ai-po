import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, TrendUp, TrendDown, Calendar, Tag } from '@phosphor-icons/react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

export interface DrillDownData {
  title: string
  value: number | string
  category?: string
  breakdown?: Array<{
    label: string
    value: number
    percentage?: number
    change?: number
    trend?: 'up' | 'down' | 'neutral'
  }>
  timeSeries?: Array<{
    date: string
    value: number
  }>
  metadata?: {
    period?: string
    total?: number
    average?: number
    highest?: { label: string; value: number }
    lowest?: { label: string; value: number }
  }
  insights?: string[]
}

interface DrillDownDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: DrillDownData | null
}

export function DrillDownDialog({ open, onOpenChange, data }: DrillDownDialogProps) {
  const [activeView, setActiveView] = useState<'breakdown' | 'timeline' | 'insights'>('breakdown')

  if (!data) return null

  const handleExport = () => {
    const exportData = {
      ...data,
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${data.title.replace(/\s+/g, '-').toLowerCase()}-drilldown.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold mb-2">{data.title}</DialogTitle>
              <DialogDescription className="text-base">
                Detailed breakdown and analysis
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="gap-2"
            >
              <Download size={16} weight="bold" />
              Export
            </Button>
          </div>
          
          {data.category && (
            <div className="flex items-center gap-2 mt-3">
              <Tag size={14} weight="fill" className="text-muted-foreground" />
              <Badge variant="outline" className="text-xs">
                {data.category}
              </Badge>
            </div>
          )}
        </DialogHeader>

        <div className="px-6 py-4">
          {data.metadata && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {data.metadata.period && (
                <Card className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Calendar size={14} />
                    <span className="text-xs uppercase tracking-wide">Period</span>
                  </div>
                  <p className="text-sm font-semibold">{data.metadata.period}</p>
                </Card>
              )}
              {data.metadata.total !== undefined && (
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total</p>
                  <p className="text-lg font-bold font-mono">{data.metadata.total.toLocaleString()}</p>
                </Card>
              )}
              {data.metadata.average !== undefined && (
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Average</p>
                  <p className="text-lg font-bold font-mono">{data.metadata.average.toLocaleString()}</p>
                </Card>
              )}
              {data.metadata.highest && (
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Highest</p>
                  <p className="text-sm font-semibold mb-0.5">{data.metadata.highest.label}</p>
                  <p className="text-base font-bold font-mono text-accent">{data.metadata.highest.value.toLocaleString()}</p>
                </Card>
              )}
            </div>
          )}

          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="breakdown" disabled={!data.breakdown}>
                Breakdown
              </TabsTrigger>
              <TabsTrigger value="timeline" disabled={!data.timeSeries}>
                Timeline
              </TabsTrigger>
              <TabsTrigger value="insights" disabled={!data.insights || data.insights.length === 0}>
                Insights
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[400px] pr-4">
              <TabsContent value="breakdown" className="mt-0">
                {data.breakdown && (
                  <div className="space-y-3">
                    {data.breakdown.map((item, index) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="p-4 hover:border-accent/50 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <h4 className="font-semibold text-base">{item.label}</h4>
                              {item.trend && (
                                <div className={`flex items-center gap-1 text-xs ${
                                  item.trend === 'up' ? 'text-success' : 
                                  item.trend === 'down' ? 'text-destructive' : 
                                  'text-muted-foreground'
                                }`}>
                                  {item.trend === 'up' ? (
                                    <TrendUp size={14} weight="bold" />
                                  ) : item.trend === 'down' ? (
                                    <TrendDown size={14} weight="bold" />
                                  ) : null}
                                  {item.change !== undefined && (
                                    <span>{Math.abs(item.change)}%</span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold font-mono">{item.value.toLocaleString()}</p>
                              {item.percentage !== undefined && (
                                <p className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}%</p>
                              )}
                            </div>
                          </div>
                          
                          {item.percentage !== undefined && (
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${item.percentage}%` }}
                                transition={{ delay: index * 0.05 + 0.2, duration: 0.6 }}
                                className="h-full bg-gradient-to-r from-accent to-purple-500"
                              />
                            </div>
                          )}
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="timeline" className="mt-0">
                {data.timeSeries && (
                  <div className="space-y-2">
                    {data.timeSeries.map((point, index) => (
                      <motion.div
                        key={point.date}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <Card className="p-3 hover:bg-accent/5 transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground font-medium">
                              {point.date}
                            </span>
                            <span className="text-base font-bold font-mono">
                              {point.value.toLocaleString()}
                            </span>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="insights" className="mt-0">
                {data.insights && (
                  <div className="space-y-3">
                    {data.insights.map((insight, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="p-4 bg-accent/5 border-accent/20">
                          <p className="text-sm leading-relaxed">{insight}</p>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
