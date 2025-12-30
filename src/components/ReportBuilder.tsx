import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FilePdf, 
  FileCsv, 
  FileImage, 
  Download, 
  Plus,
  Trash,
  Eye,
  Calendar,
  Sparkle,
  CalendarBlank
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import {
  ReportTemplate,
  ExportOptions,
  defaultReportTemplates,
  exportToCSV,
  exportToJSON,
  generateReportData,
  formatReportForPrint,
  DateRange
} from '@/lib/report-export'
import { Metric, ChartDataPoint, PredictionData, Insight } from '@/lib/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { ReportPreview } from './ReportPreview'
import { ScheduledReportsManager } from './ScheduledReportsManager'
import { DateRangeFilter } from './DateRangeFilter'
import { useKV } from '@github/spark/hooks'
import { format } from 'date-fns'

interface ReportBuilderProps {
  metrics: Metric[]
  timeSeriesData: ChartDataPoint[]
  categoryData: ChartDataPoint[]
  predictionData: PredictionData
  insights: Insight[]
}

export function ReportBuilder({
  metrics,
  timeSeriesData,
  categoryData,
  predictionData,
  insights
}: ReportBuilderProps) {
  const [templates, setTemplates] = useKV<ReportTemplate[]>('report-templates', defaultReportTemplates)
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null)
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeLogo: true,
    includeTimestamp: true,
    pageSize: 'letter',
    orientation: 'portrait'
  })
  const [isExporting, setIsExporting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const safeTemplates = templates || defaultReportTemplates

  const handleExport = async (template: ReportTemplate, format: 'pdf' | 'csv' | 'json') => {
    setIsExporting(true)
    
    try {
      const reportData = generateReportData(
        template,
        metrics,
        timeSeriesData,
        categoryData,
        predictionData,
        insights
      )

      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `${template.name.replace(/\s+/g, '-').toLowerCase()}-${timestamp}`

      switch (format) {
        case 'csv':
          const csvData: any[] = []
          reportData.sections.forEach((section: any) => {
            if (section.type === 'metrics') {
              section.data.forEach((metric: any) => {
                csvData.push({
                  Section: section.title,
                  Metric: metric.label,
                  Value: metric.value,
                  Unit: metric.unit,
                  Change: metric.change,
                  Trend: metric.trend
                })
              })
            } else if (Array.isArray(section.data)) {
              section.data.forEach((item: any) => {
                csvData.push({
                  Section: section.title,
                  Label: item.label || item.title || '',
                  Value: item.value || '',
                  ...item
                })
              })
            }
          })
          exportToCSV(csvData, `${filename}.csv`)
          toast.success('CSV exported successfully')
          break

        case 'json':
          exportToJSON(reportData, `${filename}.json`)
          toast.success('JSON exported successfully')
          break

        case 'pdf':
          const htmlContent = formatReportForPrint(reportData)
          const printWindow = window.open('', '_blank')
          if (printWindow) {
            printWindow.document.write(htmlContent)
            printWindow.document.close()
            setTimeout(() => {
              printWindow.print()
              toast.success('PDF print dialog opened')
            }, 500)
          }
          break
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export report')
    } finally {
      setIsExporting(false)
    }
  }

  const handleQuickExport = (format: 'pdf' | 'csv' | 'json') => {
    const executiveSummary = safeTemplates.find(t => t.id === 'executive-summary')
    if (executiveSummary) {
      handleExport(executiveSummary, format)
    }
  }

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates((currentTemplates) => (currentTemplates || []).filter(t => t.id !== templateId))
    toast.success('Template deleted')
  }

  const handleToggleSection = (templateId: string, sectionId: string) => {
    setTemplates((currentTemplates) => (currentTemplates || []).map(template => {
      if (template.id === templateId) {
        return {
          ...template,
          sections: template.sections.map(section =>
            section.id === sectionId
              ? { ...section, enabled: !section.enabled }
              : section
          )
        }
      }
      return template
    }))
  }

  const handleDateRangeChange = (templateId: string, dateRange: DateRange) => {
    setTemplates((currentTemplates) => (currentTemplates || []).map(template => {
      if (template.id === templateId) {
        return {
          ...template,
          dateRange,
          lastModified: Date.now()
        }
      }
      return template
    }))
    toast.success('Date range updated')
  }

  const handleDynamicTimeChange = (templateId: string, enabled: boolean) => {
    setTemplates((currentTemplates) => (currentTemplates || []).map(template => {
      if (template.id === templateId) {
        return {
          ...template,
          dynamicTimeEnabled: enabled,
          lastModified: Date.now()
        }
      }
      return template
    }))
    toast.success(`Dynamic time ${enabled ? 'enabled' : 'disabled'}`)
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold">Analytics Reports</h2>
          <p className="text-muted-foreground mt-1">
            Export comprehensive reports with charts, insights, and customizable date ranges
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleQuickExport('csv')}
            disabled={isExporting}
            className="gap-2"
          >
            <FileCsv size={18} />
            Quick CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => handleQuickExport('json')}
            disabled={isExporting}
            className="gap-2"
          >
            <Download size={18} />
            Quick JSON
          </Button>
          <Button
            onClick={() => handleQuickExport('pdf')}
            disabled={isExporting}
            className="gap-2"
          >
            <FilePdf size={18} />
            Quick PDF
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6 bg-gradient-to-br from-accent/10 via-card to-primary/5 border-accent/20">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                <CalendarBlank size={24} weight="fill" className="text-accent" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">
                Dynamic Date Ranges & Time Periods
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                All report templates now support customizable date ranges with dynamic time periods. 
                Enable dynamic mode to automatically use the latest data when generating reports.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Last 7 Days</Badge>
                <Badge variant="outline">Last 30 Days</Badge>
                <Badge variant="outline">This Month</Badge>
                <Badge variant="outline">This Quarter</Badge>
                <Badge variant="outline">Custom Range</Badge>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="templates" className="gap-2">
            <Sparkle size={18} weight="duotone" />
            Report Templates
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="gap-2">
            <Calendar size={18} weight="duotone" />
            Scheduled Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {safeTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 hover:border-accent/50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                      {template.dateRange && (
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="gap-1 text-xs">
                            <CalendarBlank size={12} weight="duotone" />
                            {format(template.dateRange.startDate, 'MMM d')} - {format(template.dateRange.endDate, 'MMM d, yyyy')}
                          </Badge>
                          {template.dynamicTimeEnabled && (
                            <Badge variant="secondary" className="text-xs">
                              Dynamic
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    {template.id !== 'executive-summary' && template.id !== 'detailed-analytics' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash size={16} />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Sections ({template.sections.filter(s => s.enabled).length}/{template.sections.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {template.sections.slice(0, 3).map(section => (
                        <Badge
                          key={section.id}
                          variant={section.enabled ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {section.title}
                        </Badge>
                      ))}
                      {template.sections.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.sections.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2"
                          onClick={() => setSelectedTemplate(template)}
                        >
                          <Eye size={16} />
                          Configure
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh]">
                        <DialogHeader>
                          <DialogTitle>Configure {template.name}</DialogTitle>
                          <DialogDescription>
                            Customize sections and date range settings for this report
                          </DialogDescription>
                        </DialogHeader>
                        
                        <ScrollArea className="h-[600px] pr-4">
                          <div className="space-y-6">
                            <DateRangeFilter
                              dateRange={template.dateRange}
                              dynamicTimeEnabled={template.dynamicTimeEnabled}
                              onDateRangeChange={(dateRange) => handleDateRangeChange(template.id, dateRange)}
                              onDynamicTimeChange={(enabled) => handleDynamicTimeChange(template.id, enabled)}
                            />

                            <Card className="p-6">
                              <h3 className="text-lg font-semibold mb-4">Report Sections</h3>
                              <div className="space-y-4">
                                {template.sections.map(section => (
                                  <div
                                    key={section.id}
                                    className="flex items-start gap-3 p-4 border rounded-lg hover:border-accent/50 transition-colors"
                                  >
                                    <Switch
                                      checked={section.enabled}
                                      onCheckedChange={() => handleToggleSection(template.id, section.id)}
                                    />
                                    <div className="flex-1">
                                      <p className="font-medium">{section.title}</p>
                                      <p className="text-sm text-muted-foreground">
                                        Type: {section.type}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </Card>
                          </div>
                        </ScrollArea>

                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedTemplate(template)
                              setShowPreview(true)
                            }}
                            className="gap-2"
                          >
                            <Eye size={16} />
                            Preview
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" className="flex-1 gap-2">
                          <Download size={16} />
                          Export
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Export Report</DialogTitle>
                          <DialogDescription>
                            Choose your export format and options
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Export Format</Label>
                            <Select
                              value={exportOptions.format}
                              onValueChange={(value: any) =>
                                setExportOptions({ ...exportOptions, format: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pdf">PDF Document</SelectItem>
                                <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                                <SelectItem value="json">JSON Data</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {exportOptions.format === 'pdf' && (
                            <>
                              <div className="space-y-2">
                                <Label>Page Size</Label>
                                <Select
                                  value={exportOptions.pageSize}
                                  onValueChange={(value: any) =>
                                    setExportOptions({ ...exportOptions, pageSize: value })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="letter">Letter (8.5" × 11")</SelectItem>
                                    <SelectItem value="a4">A4 (210mm × 297mm)</SelectItem>
                                    <SelectItem value="tabloid">Tabloid (11" × 17")</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label>Orientation</Label>
                                <Select
                                  value={exportOptions.orientation}
                                  onValueChange={(value: any) =>
                                    setExportOptions({ ...exportOptions, orientation: value })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="portrait">Portrait</SelectItem>
                                    <SelectItem value="landscape">Landscape</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </>
                          )}

                          <div className="flex items-center justify-between">
                            <Label>Include Timestamp</Label>
                            <Switch
                              checked={exportOptions.includeTimestamp}
                              onCheckedChange={(checked) =>
                                setExportOptions({ ...exportOptions, includeTimestamp: checked })
                              }
                            />
                          </div>
                        </div>

                        <DialogFooter>
                          <Button
                            onClick={() => handleExport(template, exportOptions.format as 'pdf' | 'csv' | 'json')}
                            disabled={isExporting}
                            className="gap-2"
                          >
                            {isExporting ? (
                              <>Exporting...</>
                            ) : (
                              <>
                                <Download size={16} />
                                Export Report
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled">
          <ScheduledReportsManager
            templates={safeTemplates}
            onExport={handleExport}
          />
        </TabsContent>
      </Tabs>

      {showPreview && selectedTemplate && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-5xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Report Preview: {selectedTemplate.name}</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[70vh]">
              <ReportPreview
                template={selectedTemplate}
                metrics={metrics}
                timeSeriesData={timeSeriesData}
                categoryData={categoryData}
                predictionData={predictionData}
                insights={insights}
              />
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
