import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Download,
  ChartBar,
  ChartLineUp,
  Sparkle,
  Calendar,
  Table,
  FileText
} from '@phosphor-icons/react'
import { ExportButton } from './ExportButton'
import { 
  exportMetrics, 
  exportChartData, 
  exportInsights,
  ExportFormat 
} from '@/lib/data-export'
import { Metric, ChartDataPoint, Insight } from '@/lib/types'
import { motion } from 'framer-motion'

interface DataExportPanelProps {
  metrics: Metric[]
  timeSeriesData: ChartDataPoint[]
  categoryData: ChartDataPoint[]
  insights: Insight[]
  predictionData?: any
}

export function DataExportPanel({
  metrics,
  timeSeriesData,
  categoryData,
  insights,
}: DataExportPanelProps) {
  
  const handleExportMetrics = (format: ExportFormat, filename: string, includeHeaders: boolean) => {
    exportMetrics(metrics, format, { filename, includeHeaders })
  }

  const handleExportTimeSeries = (format: ExportFormat, filename: string, includeHeaders: boolean) => {
    exportChartData(timeSeriesData, format, { filename, includeHeaders })
  }

  const handleExportCategory = (format: ExportFormat, filename: string, includeHeaders: boolean) => {
    exportChartData(categoryData, format, { filename, includeHeaders })
  }

  const handleExportInsights = (format: ExportFormat, filename: string, includeHeaders: boolean) => {
    exportInsights(insights, format, { filename, includeHeaders })
  }

  const handleExportAll = (format: ExportFormat, filename: string, includeHeaders: boolean) => {
    exportMetrics(metrics, format, { 
      filename: `${filename}-metrics`, 
      includeHeaders 
    })
    exportChartData(timeSeriesData, format, { 
      filename: `${filename}-timeseries`, 
      includeHeaders 
    })
    exportChartData(categoryData, format, { 
      filename: `${filename}-categories`, 
      includeHeaders 
    })
    if (insights.length > 0) {
      exportInsights(insights, format, { 
        filename: `${filename}-insights`, 
        includeHeaders 
      })
    }
  }

  const exportOptions = [
    {
      id: 'metrics',
      icon: ChartBar,
      title: 'Metrics Overview',
      description: 'All current metrics with trends and changes',
      dataCount: metrics.length,
      onExport: handleExportMetrics,
      defaultFilename: 'metrics-overview',
      color: 'text-accent',
    },
    {
      id: 'timeseries',
      icon: ChartLineUp,
      title: 'Time Series Data',
      description: 'Historical revenue trend data (30 days)',
      dataCount: timeSeriesData.length,
      onExport: handleExportTimeSeries,
      defaultFilename: 'revenue-timeseries',
      color: 'text-primary',
    },
    {
      id: 'categories',
      icon: Table,
      title: 'Category Breakdown',
      description: 'Revenue distribution by business segment',
      dataCount: categoryData.length,
      onExport: handleExportCategory,
      defaultFilename: 'revenue-categories',
      color: 'text-success',
    },
    {
      id: 'insights',
      icon: Sparkle,
      title: 'AI Insights',
      description: 'Generated insights with confidence scores',
      dataCount: insights.length,
      onExport: handleExportInsights,
      defaultFilename: 'ai-insights',
      color: 'text-warning',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Download size={28} weight="duotone" className="text-accent" />
            Data Export Center
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Export your analytics data in CSV or Excel format
          </p>
        </div>
        
        <ExportButton
          onExport={handleExportAll}
          defaultFilename="analytics-complete"
          title="Export All Data"
          description="Export all available data as separate files"
          variant="default"
          size="lg"
          label="Export All"
          className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exportOptions.map((option, index) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 hover:border-accent/50 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0`}>
                    <option.icon size={24} weight="duotone" className={option.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1 flex items-center gap-2">
                      {option.title}
                      <Badge variant="secondary" className="text-xs">
                        {option.dataCount} {option.dataCount === 1 ? 'row' : 'rows'}
                      </Badge>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
                
                <ExportButton
                  onExport={option.onExport}
                  defaultFilename={option.defaultFilename}
                  title={`Export ${option.title}`}
                  description={option.description}
                  variant="outline"
                  size="sm"
                  label="Export"
                />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="p-6 bg-gradient-to-br from-card to-accent/5 border-accent/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
            <FileText size={24} weight="duotone" className="text-accent" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Export Formats</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">CSV:</strong> Universal format compatible with Excel, Google Sheets, and most data analysis tools. Best for data processing and automation.
              </p>
              <p>
                <strong className="text-foreground">Excel:</strong> Microsoft Excel format (.xls) with formatted headers and proper styling. Ideal for sharing with stakeholders.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-card to-primary/5 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Calendar size={24} weight="duotone" className="text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Scheduled Exports</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Set up automated exports to receive data reports on a regular schedule. Perfect for recurring analysis and stakeholder updates.
            </p>
            <Button variant="outline" size="sm" disabled>
              Configure Schedule (Coming Soon)
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
