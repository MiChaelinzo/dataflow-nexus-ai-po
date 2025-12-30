import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendUp, TrendDown, ArrowsLeftRight, ChartBar, Minus } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { generateYoYData, calculateSeasonalTrends, formatNumber, formatChange } from '@/lib/data'
import { YoYDataPoint, SeasonalTrend } from '@/lib/types'

export function YoYComparison() {
  const [selectedMetric, setSelectedMetric] = useState<string>('revenue')
  
  const metrics = [
    { id: 'revenue', label: 'Revenue', unit: '$' },
    { id: 'customers', label: 'Active Customers', unit: '' },
    { id: 'conversion', label: 'Conversion Rate', unit: '%' }
  ]
  
  const yoyData = useMemo(() => generateYoYData(selectedMetric), [selectedMetric])
  const seasonalTrends = useMemo(() => calculateSeasonalTrends(yoyData), [yoyData])
  
  const currentMetric = metrics.find(m => m.id === selectedMetric) || metrics[0]
  
  const overallChange = useMemo(() => {
    const totalCurrent = yoyData.reduce((sum, d) => sum + d.currentYear, 0)
    const totalPrevious = yoyData.reduce((sum, d) => sum + d.previousYear, 0)
    const change = ((totalCurrent - totalPrevious) / totalPrevious) * 100
    return Math.round(change * 10) / 10
  }, [yoyData])
  
  const maxValue = useMemo(() => {
    return Math.max(...yoyData.flatMap(d => [d.currentYear, d.previousYear]))
  }, [yoyData])
  
  const bestMonth = useMemo(() => {
    return yoyData.reduce((best, current) => 
      current.yoyChangePercent > best.yoyChangePercent ? current : best
    )
  }, [yoyData])
  
  const worstMonth = useMemo(() => {
    return yoyData.reduce((worst, current) => 
      current.yoyChangePercent < worst.yoyChangePercent ? current : worst
    )
  }, [yoyData])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <ArrowsLeftRight size={28} weight="duotone" className="text-accent" />
            Year-over-Year Analysis
          </h2>
          <p className="text-muted-foreground mt-1">
            Compare performance with seasonal trend insights
          </p>
        </div>
        
        <Select value={selectedMetric} onValueChange={setSelectedMetric}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {metrics.map(metric => (
              <SelectItem key={metric.id} value={metric.id}>
                {metric.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6">
            <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
              Overall YoY Growth
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold font-mono">
                {overallChange > 0 ? '+' : ''}{overallChange}%
              </p>
              {overallChange > 0 ? (
                <TrendUp size={24} weight="bold" className="text-success" />
              ) : overallChange < 0 ? (
                <TrendDown size={24} weight="bold" className="text-destructive" />
              ) : (
                <Minus size={24} weight="bold" className="text-muted-foreground" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Current year vs previous year
            </p>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 border-success/30 bg-success/5">
            <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
              Best Month
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold">{bestMonth.month}</p>
              <Badge className="bg-success text-white">
                {formatChange(bestMonth.yoyChangePercent)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {formatNumber(bestMonth.currentYear, currentMetric.unit)} vs {formatNumber(bestMonth.previousYear, currentMetric.unit)}
            </p>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 border-warning/30 bg-warning/5">
            <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
              Needs Attention
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold">{worstMonth.month}</p>
              <Badge className="bg-warning text-warning-foreground">
                {formatChange(worstMonth.yoyChangePercent)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {formatNumber(worstMonth.currentYear, currentMetric.unit)} vs {formatNumber(worstMonth.previousYear, currentMetric.unit)}
            </p>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="monthly" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="monthly">Monthly Comparison</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="monthly" className="mt-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Monthly Performance</h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 rounded-full bg-accent" />
                  <span className="text-muted-foreground">Current Year (2024)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 rounded-full bg-muted-foreground/30" />
                  <span className="text-muted-foreground">Previous Year (2023)</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              {yoyData.map((data, index) => (
                <MonthlyComparisonBar
                  key={data.month}
                  data={data}
                  maxValue={maxValue}
                  unit={currentMetric.unit}
                  delay={index * 0.03}
                />
              ))}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="seasonal" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {seasonalTrends.map((season, index) => (
              <SeasonalTrendCard
                key={season.season}
                season={season}
                unit={currentMetric.unit}
                delay={index * 0.1}
              />
            ))}
          </div>
          
          <Card className="p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ChartBar size={20} weight="duotone" />
              Quarterly Performance Comparison
            </h3>
            <div className="space-y-4">
              {seasonalTrends.map((season, index) => {
                const total = seasonalTrends.reduce((sum, s) => sum + s.currentYearAvg, 0)
                const percentage = (season.currentYearAvg / total) * 100
                
                return (
                  <motion.div
                    key={season.season}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{season.season}</span>
                        <span className="text-muted-foreground">{season.months.join(', ')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-muted-foreground">
                          {formatNumber(season.currentYearAvg, currentMetric.unit)}
                        </span>
                        <Badge 
                          variant={season.trend === 'up' ? 'default' : 'secondary'}
                          className={season.trend === 'up' ? 'bg-success text-white' : 'bg-warning text-warning-foreground'}
                        >
                          {formatChange(season.changePercent)}
                        </Badge>
                      </div>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: 0.3 + index * 0.1, duration: 0.6, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-accent to-primary"
                      />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface MonthlyComparisonBarProps {
  data: YoYDataPoint
  maxValue: number
  unit: string
  delay: number
}

function MonthlyComparisonBar({ data, maxValue, unit, delay }: MonthlyComparisonBarProps) {
  const currentPercent = (data.currentYear / maxValue) * 100
  const previousPercent = (data.previousYear / maxValue) * 100
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="group py-3 px-4 rounded-lg hover:bg-accent/5 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 text-sm font-semibold">{data.month}</div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-6 bg-secondary/30 rounded-md overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${currentPercent}%` }}
                transition={{ delay: delay + 0.1, duration: 0.6, ease: 'easeOut' }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent to-accent/80"
              />
            </div>
            <div className="w-24 text-right text-sm font-mono">
              {formatNumber(data.currentYear, unit)}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex-1 h-4 bg-secondary/20 rounded-md overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${previousPercent}%` }}
                transition={{ delay: delay + 0.2, duration: 0.6, ease: 'easeOut' }}
                className="absolute inset-y-0 left-0 bg-muted-foreground/30"
              />
            </div>
            <div className="w-24 text-right text-xs text-muted-foreground font-mono">
              {formatNumber(data.previousYear, unit)}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-24 justify-end">
          {data.yoyChangePercent > 0 ? (
            <TrendUp size={16} weight="bold" className="text-success" />
          ) : data.yoyChangePercent < 0 ? (
            <TrendDown size={16} weight="bold" className="text-destructive" />
          ) : (
            <Minus size={16} weight="bold" className="text-muted-foreground" />
          )}
          <span className={`text-sm font-semibold ${
            data.yoyChangePercent > 0 ? 'text-success' : 
            data.yoyChangePercent < 0 ? 'text-destructive' : 
            'text-muted-foreground'
          }`}>
            {formatChange(data.yoyChangePercent)}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

interface SeasonalTrendCardProps {
  season: SeasonalTrend
  unit: string
  delay: number
}

function SeasonalTrendCard({ season, unit, delay }: SeasonalTrendCardProps) {
  const getSeasonGradient = (seasonId: string) => {
    switch (seasonId) {
      case 'Q1': return 'from-blue-500/10 to-cyan-500/10 border-blue-500/20'
      case 'Q2': return 'from-green-500/10 to-emerald-500/10 border-green-500/20'
      case 'Q3': return 'from-orange-500/10 to-amber-500/10 border-orange-500/20'
      case 'Q4': return 'from-purple-500/10 to-pink-500/10 border-purple-500/20'
      default: return 'from-accent/10 to-primary/10 border-accent/20'
    }
  }
  
  const getSeasonIcon = (seasonId: string) => {
    const iconClass = "w-8 h-8"
    switch (seasonId) {
      case 'Q1': return <div className={`${iconClass} text-blue-400`}>❄️</div>
      case 'Q2': return <div className={`${iconClass} text-green-400`}>🌸</div>
      case 'Q3': return <div className={`${iconClass} text-orange-400`}>☀️</div>
      case 'Q4': return <div className={`${iconClass} text-purple-400`}>🍂</div>
      default: return null
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
    >
      <Card className={`p-6 bg-gradient-to-br ${getSeasonGradient(season.season)}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {getSeasonIcon(season.season)}
            <div>
              <h4 className="font-semibold text-lg">{season.seasonName}</h4>
              <p className="text-xs text-muted-foreground">{season.months.join(' • ')}</p>
            </div>
          </div>
          {season.trend === 'up' ? (
            <TrendUp size={24} weight="bold" className="text-success" />
          ) : season.trend === 'down' ? (
            <TrendDown size={24} weight="bold" className="text-destructive" />
          ) : (
            <Minus size={24} weight="bold" className="text-muted-foreground" />
          )}
        </div>
        
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Current Year Avg</span>
            <span className="text-2xl font-bold font-mono">
              {formatNumber(season.currentYearAvg, unit)}
            </span>
          </div>
          
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Previous Year Avg</span>
            <span className="text-lg font-mono text-muted-foreground">
              {formatNumber(season.previousYearAvg, unit)}
            </span>
          </div>
          
          <div className="pt-3 border-t border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">YoY Change</span>
              <Badge 
                variant={season.trend === 'up' ? 'default' : 'secondary'}
                className={`${
                  season.trend === 'up' 
                    ? 'bg-success text-white' 
                    : season.trend === 'down'
                    ? 'bg-destructive text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {formatChange(season.changePercent)}
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
