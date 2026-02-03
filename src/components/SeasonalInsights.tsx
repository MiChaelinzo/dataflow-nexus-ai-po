import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkle, TrendUp, TrendDown, Warning, CheckCircle, Clock, ArrowRight, Calendar, ChartBar, Target } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Metric, SeasonalPattern, SeasonalRecommendation, SeasonalForecast } from '@/lib/types'
import { analyzeSeasonalPattern, generateSeasonalRecommendations, generateSeasonalForecasts } from '@/lib/seasonal-analysis'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface SeasonalInsightsProps {
  metrics: Metric[]
}

export function SeasonalInsights({ metrics }: SeasonalInsightsProps) {
  const [patterns, setPatterns] = useState<SeasonalPattern[]>([])
  const [recommendations, setRecommendations] = useState<SeasonalRecommendation[]>([])
  const [forecasts, setForecasts] = useState<SeasonalForecast[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [appliedRecommendations, setAppliedRecommendations] = useKV<string[]>('applied-seasonal-recommendations', [])
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null)

  const currentMonth = new Date().getMonth()
  const currentQuarter = Math.floor(currentMonth / 3) + 1
  const quarterNames = ['Q1', 'Q2', 'Q3', 'Q4']
  const nextQuarter = currentQuarter === 4 ? 1 : currentQuarter + 1

  const analyzeSeasonality = async () => {
    setIsAnalyzing(true)
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const analyzedPatterns: SeasonalPattern[] = metrics.map(metric => {
      const historicalData = [
        ...metric.sparklineData,
        metric.value * 0.95,
        metric.value
      ]
      return analyzeSeasonalPattern(metric, historicalData)
    })
    
    setPatterns(analyzedPatterns)
    
    const generatedRecommendations = generateSeasonalRecommendations(analyzedPatterns, metrics)
    setRecommendations(generatedRecommendations)
    
    const generatedForecasts = generateSeasonalForecasts(analyzedPatterns, metrics)
    setForecasts(generatedForecasts)
    
    setIsAnalyzing(false)
    toast.success('Seasonal analysis complete', {
      description: `Found ${analyzedPatterns.length} patterns and ${generatedRecommendations.length} recommendations`
    })
  }

  useEffect(() => {
    if (metrics.length > 0 && patterns.length === 0) {
      analyzeSeasonality()
    }
  }, [])

  const handleApplyRecommendation = (recId: string) => {
    setAppliedRecommendations((current) => {
      const currentList = current || []
      if (currentList.includes(recId)) {
        return currentList.filter(id => id !== recId)
      }
      return [...currentList, recId]
    })
    
    const rec = recommendations.find(r => r.id === recId)
    const currentApplied = appliedRecommendations || []
    if (rec && !currentApplied.includes(recId)) {
      toast.success('Recommendation applied', {
        description: `"${rec.title}" has been marked as applied`
      })
    }
  }

  const priorityRecommendations = recommendations.filter(r => r.priority === 'high')
  const strongPatterns = patterns.filter(p => p.seasonality === 'strong')

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Seasonal Insights & Recommendations</h2>
          <p className="text-muted-foreground mt-1">
            AI-powered analysis of seasonal patterns with automated recommendations
          </p>
        </div>
        <Button
          onClick={analyzeSeasonality}
          disabled={isAnalyzing}
          className="gap-2"
        >
          <Sparkle size={18} weight="fill" />
          {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Card className="p-6 bg-gradient-to-br from-accent/10 via-card to-transparent border-accent/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Calendar size={20} weight="duotone" className="text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Current Period</p>
              <p className="text-2xl font-bold">{quarterNames[currentQuarter - 1]} 2026</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Next quarter: {quarterNames[nextQuarter - 1]}
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-success/10 via-card to-transparent border-success/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
              <Target size={20} weight="duotone" className="text-success" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Strong Patterns</p>
              <p className="text-2xl font-bold">{strongPatterns.length}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            High confidence seasonality detected
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-metric-purple/10 via-card to-transparent border-metric-purple/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-metric-purple/20 flex items-center justify-center">
              <Sparkle size={20} weight="duotone" className="text-metric-purple" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Priority Actions</p>
              <p className="text-2xl font-bold">{priorityRecommendations.length}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            High-impact recommendations ready
          </p>
        </Card>
      </motion.div>

      <Tabs defaultValue="recommendations" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="recommendations" className="gap-2">
            <Sparkle size={16} />
            <span className="hidden sm:inline">Actions</span>
          </TabsTrigger>
          <TabsTrigger value="patterns" className="gap-2">
            <ChartBar size={16} />
            <span className="hidden sm:inline">Patterns</span>
          </TabsTrigger>
          <TabsTrigger value="forecasts" className="gap-2">
            <TrendUp size={16} />
            <span className="hidden sm:inline">Forecasts</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          <AnimatePresence mode="popLayout">
            {recommendations.map((rec, index) => {
              const isApplied = (appliedRecommendations || []).includes(rec.id)
              
              return (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={cn(
                    "p-6 transition-all",
                    isApplied && "opacity-60 border-success/30"
                  )}>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                          rec.type === 'opportunity' && "bg-success/20",
                          rec.type === 'risk' && "bg-warning/20",
                          rec.type === 'optimization' && "bg-accent/20",
                          rec.type === 'planning' && "bg-primary/20"
                        )}>
                          {rec.type === 'opportunity' && <TrendUp size={20} weight="duotone" className="text-success" />}
                          {rec.type === 'risk' && <Warning size={20} weight="duotone" className="text-warning" />}
                          {rec.type === 'optimization' && <Target size={20} weight="duotone" className="text-accent" />}
                          {rec.type === 'planning' && <Calendar size={20} weight="duotone" className="text-primary" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="text-lg font-semibold">{rec.title}</h3>
                            {isApplied && (
                              <Badge variant="outline" className="gap-1 text-success border-success/30">
                                <CheckCircle size={12} weight="fill" />
                                Applied
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                          <div className="flex items-center gap-3 flex-wrap mb-4">
                            <Badge variant="outline" className={cn(
                              rec.priority === 'high' && "border-destructive/30 text-destructive",
                              rec.priority === 'medium' && "border-warning/30 text-warning",
                              rec.priority === 'low' && "border-muted-foreground/30"
                            )}>
                              {rec.priority.toUpperCase()} Priority
                            </Badge>
                            <Badge variant="outline" className="gap-1">
                              <Calendar size={12} />
                              {rec.season}
                            </Badge>
                            <Badge variant="outline" className="gap-1">
                              <Sparkle size={12} />
                              {rec.confidence}% confidence
                            </Badge>
                          </div>
                          <div className="bg-muted/30 rounded-lg p-4 mb-4">
                            <p className="text-sm font-medium mb-1">Expected Impact</p>
                            <p className="text-sm text-muted-foreground">{rec.impact}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Recommended Actions:</p>
                            <ul className="space-y-1.5">
                              {rec.actionItems.map((action, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <ArrowRight size={16} className="flex-shrink-0 mt-0.5 text-accent" />
                                  <span>{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
                      <Button
                        variant={isApplied ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleApplyRecommendation(rec.id)}
                        className="gap-2"
                      >
                        {isApplied ? (
                          <>
                            <CheckCircle size={16} weight="fill" />
                            Mark as Not Applied
                          </>
                        ) : (
                          <>
                            <CheckCircle size={16} />
                            Apply Recommendation
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {recommendations.length === 0 && !isAnalyzing && (
            <Card className="p-12 text-center">
              <Clock size={48} weight="thin" className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Recommendations Yet</h3>
              <p className="text-muted-foreground">
                Click "Refresh Analysis" to generate seasonal recommendations
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patterns.map((pattern, index) => (
              <motion.div
                key={pattern.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className={cn(
                    "p-6 cursor-pointer transition-all hover:border-accent/50",
                    selectedPattern === pattern.id && "border-accent ring-2 ring-accent/20"
                  )}
                  onClick={() => setSelectedPattern(selectedPattern === pattern.id ? null : pattern.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{pattern.metricName}</h3>
                      <Badge variant="outline" className={cn(
                        pattern.seasonality === 'strong' && "border-success/30 text-success",
                        pattern.seasonality === 'moderate' && "border-warning/30 text-warning",
                        pattern.seasonality === 'weak' && "border-muted-foreground/30"
                      )}>
                        {pattern.seasonality.toUpperCase()} Seasonality
                      </Badge>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <Sparkle size={12} />
                      {pattern.confidence}%
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Peak Season</p>
                      <div className="flex items-center gap-2">
                        <TrendUp size={16} className="text-success" />
                        <p className="text-sm font-semibold">{pattern.peakSeason}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Low Season</p>
                      <div className="flex items-center gap-2">
                        <TrendDown size={16} className="text-destructive" />
                        <p className="text-sm font-semibold">{pattern.lowSeason}</p>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {selectedPattern === pattern.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 pt-4 border-t border-border/50"
                      >
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-success/10 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">Peak Average</p>
                            <p className="text-lg font-bold font-mono">
                              {pattern.avgPeakValue.toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-destructive/10 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">Low Average</p>
                            <p className="text-lg font-bold font-mono">
                              {pattern.avgLowValue.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">Volatility Index</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(pattern.volatility, 100)}%` }}
                                className={cn(
                                  "h-full",
                                  pattern.volatility > 30 && "bg-destructive",
                                  pattern.volatility > 15 && pattern.volatility <= 30 && "bg-warning",
                                  pattern.volatility <= 15 && "bg-success"
                                )}
                              />
                            </div>
                            <span className="text-sm font-mono">{pattern.volatility.toFixed(1)}%</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {forecasts.slice(0, 12).map((forecast, index) => {
              const metric = metrics.find(m => m.label === forecast.metric)
              
              return (
                <motion.div
                  key={`${forecast.metric}-${forecast.period}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={cn(
                          "w-12 h-12 rounded-lg flex items-center justify-center",
                          forecast.trend === 'up' && "bg-success/20",
                          forecast.trend === 'down' && "bg-destructive/20",
                          forecast.trend === 'neutral' && "bg-muted"
                        )}>
                          {forecast.trend === 'up' && <TrendUp size={24} weight="duotone" className="text-success" />}
                          {forecast.trend === 'down' && <TrendDown size={24} weight="duotone" className="text-destructive" />}
                          {forecast.trend === 'neutral' && <TrendUp size={24} weight="duotone" className="text-muted-foreground" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{forecast.metric}</p>
                            <Badge variant="outline" className="text-xs">
                              {forecast.period}
                            </Badge>
                          </div>
                          <p className="text-2xl font-bold font-mono">
                            {metric?.unit === '$' && '$'}
                            {forecast.forecast.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            {metric?.unit && metric.unit !== '$' && metric.unit}
                          </p>
                          {forecast.recommendation && (
                            <p className="text-xs text-muted-foreground mt-1">{forecast.recommendation}</p>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="gap-1">
                        <Sparkle size={12} />
                        {forecast.confidence}%
                      </Badge>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
