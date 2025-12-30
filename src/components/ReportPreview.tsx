import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ReportTemplate, generateReportData } from '@/lib/report-export'
import { Metric, ChartDataPoint, PredictionData, Insight } from '@/lib/types'
import { MetricCard } from './MetricCard'
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendUp, TrendDown } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface ReportPreviewProps {
  template: ReportTemplate
  metrics: Metric[]
  timeSeriesData: ChartDataPoint[]
  categoryData: ChartDataPoint[]
  predictionData: PredictionData
  insights: Insight[]
}

export function ReportPreview({
  template,
  metrics,
  timeSeriesData,
  categoryData,
  predictionData,
  insights
}: ReportPreviewProps) {
  const reportData = generateReportData(
    template,
    metrics,
    timeSeriesData,
    categoryData,
    predictionData,
    insights
  )

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity':
        return 'border-success bg-success/10'
      case 'warning':
        return 'border-warning bg-warning/10'
      case 'trend':
        return 'border-accent bg-accent/10'
      case 'anomaly':
        return 'border-destructive bg-destructive/10'
      default:
        return 'border-primary bg-primary/10'
    }
  }

  return (
    <div className="space-y-6 p-6 bg-background" id="report-preview">
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-bold mb-2">{template.name}</h1>
        <p className="text-muted-foreground">{template.description}</p>
        <p className="text-sm text-muted-foreground mt-2">
          Generated on {new Date(reportData.generatedAt).toLocaleString()}
        </p>
      </div>

      {reportData.sections.map((section: any, index: number) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-semibold">{section.title}</h2>

          {section.type === 'metrics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.data.map((metricData: any) => {
                const fullMetric = metrics.find(m => m.label === metricData.label)
                if (!fullMetric) return null
                return <MetricCard key={fullMetric.id} metric={fullMetric} />
              })}
            </div>
          )}

          {section.type === 'timeseries' && (
            <Card className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={section.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.02 240)" />
                  <XAxis dataKey="label" stroke="oklch(0.65 0.02 240)" />
                  <YAxis stroke="oklch(0.65 0.02 240)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'oklch(0.25 0.01 240)',
                      border: '1px solid oklch(0.30 0.02 240)',
                      borderRadius: '8px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="oklch(0.70 0.15 195)"
                    fill="oklch(0.70 0.15 195 / 0.2)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          )}

          {section.type === 'category' && (
            <Card className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={section.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.02 240)" />
                  <XAxis dataKey="label" stroke="oklch(0.65 0.02 240)" />
                  <YAxis stroke="oklch(0.65 0.02 240)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'oklch(0.25 0.01 240)',
                      border: '1px solid oklch(0.30 0.02 240)',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" fill="oklch(0.70 0.15 195)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {section.type === 'predictions' && (
            <Card className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={[...section.data.historical, ...section.data.forecast]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.02 240)" />
                  <XAxis dataKey="label" stroke="oklch(0.65 0.02 240)" />
                  <YAxis stroke="oklch(0.65 0.02 240)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'oklch(0.25 0.01 240)',
                      border: '1px solid oklch(0.30 0.02 240)',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="oklch(0.70 0.15 195)"
                    strokeWidth={2}
                    name="Forecast"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}

          {section.type === 'insights' && (
            <div className="space-y-3">
              {section.data.map((insight: any, idx: number) => (
                <Card key={idx} className={`p-6 border-l-4 ${getInsightColor(insight.type)}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{insight.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {insight.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Confidence:</span>
                        <div className="flex-1 max-w-[200px] h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent"
                            style={{ width: `${insight.confidence * 100}%` }}
                          />
                        </div>
                        <span className="font-mono">{(insight.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {index < reportData.sections.length - 1 && <Separator className="my-6" />}
        </motion.div>
      ))}

      <div className="border-t border-border pt-6 mt-12 text-center text-sm text-muted-foreground">
        <p>Analytics Intelligence Platform - Tableau Hackathon 2026</p>
        <p className="mt-1">Powered by AI & Advanced Analytics</p>
      </div>
    </div>
  )
}
