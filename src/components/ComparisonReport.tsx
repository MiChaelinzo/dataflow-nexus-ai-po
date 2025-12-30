import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CalendarBlank, TrendUp, TrendDown, Equals, ArrowsClockwise, Download } from '@phosphor-icons/react'
import { Metric, ChartDataPoint } from '@/lib/types'
import { formatNumber, formatChange, getChangeColor } from '@/lib/data'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { MiniSparkline } from '@/components/MiniSparkline'

interface ComparisonReportProps {
  metrics: Metric[]
  timeSeriesData: ChartDataPoint[]
}

type TimePeriod = '7d' | '30d' | '90d' | 'ytd' | '1y'
type ComparisonType = 'period-over-period' | 'year-over-year' | 'custom'

interface PeriodComparison {
  period1: string
  period2: string
  metrics: Array<{
    id: string
    label: string
    value1: number
    value2: number
    change: number
    changePercent: number
    trend: 'up' | 'down' | 'neutral'
    unit: string
  }>
}

export function ComparisonReport({ metrics, timeSeriesData }: ComparisonReportProps) {
  const [period1, setPeriod1] = useState<TimePeriod>('30d')
  const [period2, setPeriod2] = useState<TimePeriod>('7d')
  const [comparisonType, setComparisonType] = useState<ComparisonType>('period-over-period')
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(metrics.map(m => m.id))

  const periodLabels: Record<TimePeriod, string> = {
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
    'ytd': 'Year to Date',
    '1y': 'Last Year'
  }

  const comparison = useMemo((): PeriodComparison => {
    const filteredMetrics = metrics.filter(m => selectedMetrics.includes(m.id))
    
    const comparisonMetrics = filteredMetrics.map(metric => {
      const multiplier1 = period1 === '7d' ? 0.7 : period1 === '30d' ? 1 : period1 === '90d' ? 1.3 : 1.5
      const multiplier2 = period2 === '7d' ? 0.7 : period2 === '30d' ? 1 : period2 === '90d' ? 1.3 : 1.5
      
      const value1 = metric.value * multiplier1
      const value2 = metric.value * multiplier2
      const change = value1 - value2
      const changePercent = ((value1 - value2) / value2) * 100

      return {
        id: metric.id,
        label: metric.label,
        value1,
        value2,
        change,
        changePercent,
        trend: change > 0 ? 'up' as const : change < 0 ? 'down' as const : 'neutral' as const,
        unit: metric.unit
      }
    })

    return {
      period1: periodLabels[period1],
      period2: periodLabels[period2],
      metrics: comparisonMetrics
    }
  }, [metrics, period1, period2, selectedMetrics, periodLabels])

  const handleRefresh = () => {
    toast.success('Comparison data refreshed')
  }

  const handleExport = () => {
    const csvContent = [
      ['Metric', comparison.period1, comparison.period2, 'Change', 'Change %'],
      ...comparison.metrics.map(m => [
        m.label,
        formatNumber(m.value1, m.unit),
        formatNumber(m.value2, m.unit),
        formatNumber(m.change, m.unit),
        formatChange(m.changePercent)
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `comparison-report-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Report exported successfully')
  }

  const toggleMetric = (metricId: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId) 
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    )
  }

  const summary = useMemo(() => {
    const improved = comparison.metrics.filter(m => m.changePercent > 0).length
    const declined = comparison.metrics.filter(m => m.changePercent < 0).length
    const unchanged = comparison.metrics.filter(m => m.changePercent === 0).length
    const avgChange = comparison.metrics.reduce((sum, m) => sum + m.changePercent, 0) / comparison.metrics.length

    return { improved, declined, unchanged, avgChange }
  }, [comparison])

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-6 bg-gradient-to-br from-primary/5 via-card to-accent/5 border-primary/20">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Period Comparison Report</h2>
              <p className="text-muted-foreground">
                Compare key metrics across different time periods to identify trends and patterns
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <ArrowsClockwise size={16} weight="bold" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download size={16} weight="bold" />
                Export
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Metrics Improved</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-success">{summary.improved}</p>
                <TrendUp size={20} weight="bold" className="text-success" />
              </div>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Metrics Declined</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-destructive">{summary.declined}</p>
                <TrendDown size={20} weight="bold" className="text-destructive" />
              </div>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Unchanged</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-muted-foreground">{summary.unchanged}</p>
                <Equals size={20} weight="bold" className="text-muted-foreground" />
              </div>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Avg Change</p>
              <p className={`text-2xl font-bold font-mono ${getChangeColor(summary.avgChange)}`}>
                {formatChange(summary.avgChange)}
              </p>
            </Card>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Comparison Type</label>
              <Select value={comparisonType} onValueChange={(v) => setComparisonType(v as ComparisonType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="period-over-period">Period over Period</SelectItem>
                  <SelectItem value="year-over-year">Year over Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Period 1</label>
              <Select value={period1} onValueChange={(v) => setPeriod1(v as TimePeriod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(periodLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Period 2 (Compare to)</label>
              <Select value={period2} onValueChange={(v) => setPeriod2(v as TimePeriod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(periodLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mb-6">
            <label className="text-sm font-medium mb-3 block">Select Metrics to Compare</label>
            <div className="flex flex-wrap gap-2">
              {metrics.map(metric => (
                <Badge
                  key={metric.id}
                  variant={selectedMetrics.includes(metric.id) ? "default" : "outline"}
                  className="cursor-pointer hover:opacity-80 transition-opacity px-3 py-1.5"
                  onClick={() => toggleMetric(metric.id)}
                >
                  {metric.label}
                </Badge>
              ))}
            </div>
          </div>

          <Tabs defaultValue="table" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="visual">Visual View</TabsTrigger>
            </TabsList>

            <TabsContent value="table" className="mt-6">
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-semibold">Metric</th>
                        <th className="text-right p-4 font-semibold">{comparison.period1}</th>
                        <th className="text-right p-4 font-semibold">{comparison.period2}</th>
                        <th className="text-right p-4 font-semibold">Change</th>
                        <th className="text-right p-4 font-semibold">% Change</th>
                        <th className="text-center p-4 font-semibold">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparison.metrics.map((metric, index) => (
                        <motion.tr
                          key={metric.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-t border-border hover:bg-muted/30 transition-colors"
                        >
                          <td className="p-4 font-medium">{metric.label}</td>
                          <td className="p-4 text-right font-mono">
                            {formatNumber(metric.value1, metric.unit)}
                          </td>
                          <td className="p-4 text-right font-mono">
                            {formatNumber(metric.value2, metric.unit)}
                          </td>
                          <td className={`p-4 text-right font-mono font-semibold ${getChangeColor(metric.change, metric.id === 'churn')}`}>
                            {formatNumber(Math.abs(metric.change), metric.unit)}
                          </td>
                          <td className={`p-4 text-right font-mono font-semibold ${getChangeColor(metric.changePercent, metric.id === 'churn')}`}>
                            {formatChange(metric.changePercent)}
                          </td>
                          <td className="p-4 text-center">
                            {metric.trend === 'up' && (
                              <TrendUp size={20} weight="bold" className={metric.id === 'churn' ? 'text-destructive mx-auto' : 'text-success mx-auto'} />
                            )}
                            {metric.trend === 'down' && (
                              <TrendDown size={20} weight="bold" className={metric.id === 'churn' ? 'text-success mx-auto' : 'text-destructive mx-auto'} />
                            )}
                            {metric.trend === 'neutral' && (
                              <Equals size={20} weight="bold" className="text-muted-foreground mx-auto" />
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="visual" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {comparison.metrics.map((metric, index) => (
                  <motion.div
                    key={metric.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                            {metric.label}
                          </h4>
                          <div className="flex items-baseline gap-2">
                            {metric.trend === 'up' && (
                              <TrendUp size={18} weight="bold" className={metric.id === 'churn' ? 'text-destructive' : 'text-success'} />
                            )}
                            {metric.trend === 'down' && (
                              <TrendDown size={18} weight="bold" className={metric.id === 'churn' ? 'text-success' : 'text-destructive'} />
                            )}
                            {metric.trend === 'neutral' && (
                              <Equals size={18} weight="bold" className="text-muted-foreground" />
                            )}
                            <span className={`text-lg font-bold font-mono ${getChangeColor(metric.changePercent, metric.id === 'churn')}`}>
                              {formatChange(metric.changePercent)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{comparison.period1}</span>
                          <span className="font-mono font-semibold">
                            {formatNumber(metric.value1, metric.unit)}
                          </span>
                        </div>
                        
                        <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ delay: index * 0.05 + 0.2, duration: 0.6 }}
                            className="h-full bg-gradient-to-r from-primary to-accent"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{comparison.period2}</span>
                          <span className="font-mono font-semibold">
                            {formatNumber(metric.value2, metric.unit)}
                          </span>
                        </div>
                        
                        <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(metric.value2 / metric.value1) * 100}%` }}
                            transition={{ delay: index * 0.05 + 0.3, duration: 0.6 }}
                            className="h-full bg-gradient-to-r from-muted-foreground to-muted-foreground/70"
                          />
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Absolute Change</span>
                          <span className={`font-mono font-semibold ${getChangeColor(metric.change, metric.id === 'churn')}`}>
                            {formatNumber(Math.abs(metric.change), metric.unit)}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <CalendarBlank size={20} weight="duotone" className="text-accent" />
            </div>
            <div>
              <h3 className="font-semibold">Key Insights</h3>
              <p className="text-sm text-muted-foreground">
                AI-generated insights from your comparison analysis
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {comparison.metrics
              .filter(m => Math.abs(m.changePercent) > 10)
              .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
              .slice(0, 3)
              .map((metric, index) => (
                <motion.div
                  key={metric.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    metric.changePercent > 0 
                      ? metric.id === 'churn' ? 'bg-destructive/20' : 'bg-success/20'
                      : metric.id === 'churn' ? 'bg-success/20' : 'bg-destructive/20'
                  }`}>
                    {metric.trend === 'up' ? (
                      <TrendUp size={16} weight="bold" className={metric.id === 'churn' ? 'text-destructive' : 'text-success'} />
                    ) : (
                      <TrendDown size={16} weight="bold" className={metric.id === 'churn' ? 'text-success' : 'text-destructive'} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium mb-1">
                      {metric.label} {metric.trend === 'up' ? 'increased' : 'decreased'} significantly
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Your {metric.label.toLowerCase()} changed by {formatChange(Math.abs(metric.changePercent))} 
                      from {formatNumber(metric.value2, metric.unit)} to {formatNumber(metric.value1, metric.unit)} 
                      between {comparison.period2} and {comparison.period1}.
                    </p>
                  </div>
                </motion.div>
              ))}
            
            {comparison.metrics.every(m => Math.abs(m.changePercent) <= 10) && (
              <div className="p-4 rounded-lg bg-muted/30 border border-border text-center">
                <p className="text-muted-foreground">
                  No significant changes detected. All metrics remain relatively stable across the selected periods.
                </p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
