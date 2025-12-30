import { Metric, ChartDataPoint, PredictionData, Insight } from './types'

export type DateRangePreset = 'today' | 'yesterday' | 'last-7-days' | 'last-30-days' | 'last-90-days' | 'this-month' | 'last-month' | 'this-quarter' | 'last-quarter' | 'this-year' | 'last-year' | 'custom'

export interface DateRange {
  startDate: Date
  endDate: Date
  preset: DateRangePreset
}

export interface ReportSection {
  id: string
  type: 'metrics' | 'timeseries' | 'predictions' | 'insights' | 'category' | 'text'
  title: string
  enabled: boolean
  config?: {
    metrics?: string[]
    chartType?: 'line' | 'bar' | 'area'
    content?: string
  }
}

export interface ReportTemplate {
  id: string
  name: string
  description: string
  sections: ReportSection[]
  theme: 'light' | 'dark' | 'professional'
  dateRange?: DateRange
  dynamicTimeEnabled: boolean
  createdAt: number
  lastModified: number
}

export interface ExportOptions {
  format: 'pdf' | 'png' | 'csv' | 'json'
  includeLogo: boolean
  includeTimestamp: boolean
  pageSize: 'letter' | 'a4' | 'tabloid'
  orientation: 'portrait' | 'landscape'
}

export interface ScheduledReport {
  id: string
  templateId: string
  name: string
  frequency: 'daily' | 'weekly' | 'monthly'
  dayOfWeek?: number
  dayOfMonth?: number
  time: string
  recipients: string[]
  format: 'pdf' | 'csv'
  enabled: boolean
  lastRun?: number
  nextRun: number
}

export function getDateRangeFromPreset(preset: DateRangePreset): DateRange {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endDate = new Date(today)
  endDate.setHours(23, 59, 59, 999)
  
  let startDate = new Date(today)
  
  switch (preset) {
    case 'today':
      break
    case 'yesterday':
      startDate.setDate(startDate.getDate() - 1)
      endDate.setTime(startDate.getTime())
      endDate.setHours(23, 59, 59, 999)
      break
    case 'last-7-days':
      startDate.setDate(startDate.getDate() - 6)
      break
    case 'last-30-days':
      startDate.setDate(startDate.getDate() - 29)
      break
    case 'last-90-days':
      startDate.setDate(startDate.getDate() - 89)
      break
    case 'this-month':
      startDate.setDate(1)
      break
    case 'last-month':
      startDate.setMonth(startDate.getMonth() - 1)
      startDate.setDate(1)
      endDate.setDate(0)
      break
    case 'this-quarter':
      const currentQuarter = Math.floor(now.getMonth() / 3)
      startDate.setMonth(currentQuarter * 3)
      startDate.setDate(1)
      break
    case 'last-quarter':
      const lastQuarter = Math.floor(now.getMonth() / 3) - 1
      if (lastQuarter < 0) {
        startDate.setFullYear(startDate.getFullYear() - 1)
        startDate.setMonth(9)
      } else {
        startDate.setMonth(lastQuarter * 3)
      }
      startDate.setDate(1)
      endDate.setMonth(startDate.getMonth() + 3)
      endDate.setDate(0)
      break
    case 'this-year':
      startDate.setMonth(0)
      startDate.setDate(1)
      break
    case 'last-year':
      startDate.setFullYear(startDate.getFullYear() - 1)
      startDate.setMonth(0)
      startDate.setDate(1)
      endDate.setFullYear(endDate.getFullYear() - 1)
      endDate.setMonth(11)
      endDate.setDate(31)
      break
    case 'custom':
      break
  }
  
  return { startDate, endDate, preset }
}

export const defaultReportTemplates: ReportTemplate[] = [
  {
    id: 'executive-summary',
    name: 'Executive Summary',
    description: 'High-level overview with key metrics and trends',
    sections: [
      {
        id: 'metrics',
        type: 'metrics',
        title: 'Key Performance Indicators',
        enabled: true,
        config: { metrics: ['revenue', 'customers', 'conversion'] }
      },
      {
        id: 'timeseries',
        type: 'timeseries',
        title: 'Revenue Trend',
        enabled: true,
        config: { chartType: 'area' }
      },
      {
        id: 'insights',
        type: 'insights',
        title: 'AI-Generated Insights',
        enabled: true
      }
    ],
    theme: 'professional',
    dateRange: getDateRangeFromPreset('last-30-days'),
    dynamicTimeEnabled: true,
    createdAt: Date.now(),
    lastModified: Date.now()
  },
  {
    id: 'detailed-analytics',
    name: 'Detailed Analytics Report',
    description: 'Comprehensive analysis with all metrics and visualizations',
    sections: [
      {
        id: 'all-metrics',
        type: 'metrics',
        title: 'All Metrics',
        enabled: true,
        config: { metrics: ['revenue', 'customers', 'conversion', 'churn', 'avg-order', 'satisfaction'] }
      },
      {
        id: 'timeseries',
        type: 'timeseries',
        title: 'Historical Trends',
        enabled: true,
        config: { chartType: 'line' }
      },
      {
        id: 'category',
        type: 'category',
        title: 'Revenue by Segment',
        enabled: true,
        config: { chartType: 'bar' }
      },
      {
        id: 'predictions',
        type: 'predictions',
        title: 'Forecast & Predictions',
        enabled: true
      }
    ],
    theme: 'light',
    dateRange: getDateRangeFromPreset('last-90-days'),
    dynamicTimeEnabled: true,
    createdAt: Date.now(),
    lastModified: Date.now()
  },
  {
    id: 'weekly-snapshot',
    name: 'Weekly Performance Snapshot',
    description: 'Weekly overview with key metrics and trends',
    sections: [
      {
        id: 'metrics',
        type: 'metrics',
        title: 'Weekly Performance',
        enabled: true,
        config: { metrics: ['revenue', 'customers', 'conversion'] }
      },
      {
        id: 'timeseries',
        type: 'timeseries',
        title: 'Week Over Week Trend',
        enabled: true,
        config: { chartType: 'line' }
      }
    ],
    theme: 'light',
    dateRange: getDateRangeFromPreset('last-7-days'),
    dynamicTimeEnabled: true,
    createdAt: Date.now(),
    lastModified: Date.now()
  },
  {
    id: 'monthly-summary',
    name: 'Monthly Business Summary',
    description: 'Complete monthly performance report',
    sections: [
      {
        id: 'metrics',
        type: 'metrics',
        title: 'Monthly KPIs',
        enabled: true,
        config: { metrics: ['revenue', 'customers', 'conversion', 'churn'] }
      },
      {
        id: 'timeseries',
        type: 'timeseries',
        title: 'Monthly Trends',
        enabled: true,
        config: { chartType: 'area' }
      },
      {
        id: 'category',
        type: 'category',
        title: 'Revenue Breakdown',
        enabled: true,
        config: { chartType: 'bar' }
      },
      {
        id: 'insights',
        type: 'insights',
        title: 'Key Insights',
        enabled: true
      }
    ],
    theme: 'professional',
    dateRange: getDateRangeFromPreset('this-month'),
    dynamicTimeEnabled: true,
    createdAt: Date.now(),
    lastModified: Date.now()
  },
  {
    id: 'quarterly-review',
    name: 'Quarterly Business Review',
    description: 'Comprehensive quarterly performance analysis',
    sections: [
      {
        id: 'all-metrics',
        type: 'metrics',
        title: 'Quarterly Performance',
        enabled: true,
        config: { metrics: ['revenue', 'customers', 'conversion', 'churn', 'avg-order', 'satisfaction'] }
      },
      {
        id: 'timeseries',
        type: 'timeseries',
        title: 'Quarterly Trends',
        enabled: true,
        config: { chartType: 'area' }
      },
      {
        id: 'predictions',
        type: 'predictions',
        title: 'Next Quarter Forecast',
        enabled: true
      },
      {
        id: 'insights',
        type: 'insights',
        title: 'Strategic Insights',
        enabled: true
      }
    ],
    theme: 'professional',
    dateRange: getDateRangeFromPreset('this-quarter'),
    dynamicTimeEnabled: true,
    createdAt: Date.now(),
    lastModified: Date.now()
  }
]

export function exportToCSV(data: any[], filename: string): void {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')

  downloadFile(csvContent, filename, 'text/csv')
}

export function exportToJSON(data: any, filename: string): void {
  const jsonContent = JSON.stringify(data, null, 2)
  downloadFile(jsonContent, filename, 'application/json')
}

export async function exportToPNG(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId)
  if (!element) return

  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = element.getBoundingClientRect()
    canvas.width = rect.width * 2
    canvas.height = rect.height * 2
    ctx.scale(2, 2)

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const data = new XMLSerializer().serializeToString(element)
    const img = new Image()
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
        <foreignObject width="100%" height="100%">
          ${data}
        </foreignObject>
      </svg>
    `
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)

    img.onload = () => {
      ctx.drawImage(img, 0, 0)
      canvas.toBlob(blob => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = filename
          link.click()
          URL.revokeObjectURL(url)
        }
      })
      URL.revokeObjectURL(url)
    }
    img.src = url
  } catch (error) {
    console.error('Error exporting to PNG:', error)
  }
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function generateReportData(
  template: ReportTemplate,
  metrics: Metric[],
  timeSeriesData: ChartDataPoint[],
  categoryData: ChartDataPoint[],
  predictionData: PredictionData,
  insights: Insight[]
): any {
  const dateRange = template.dynamicTimeEnabled && template.dateRange
    ? getDateRangeFromPreset(template.dateRange.preset)
    : template.dateRange

  const report: any = {
    title: template.name,
    generatedAt: new Date().toISOString(),
    dateRange: dateRange ? {
      start: dateRange.startDate.toISOString(),
      end: dateRange.endDate.toISOString(),
      preset: dateRange.preset
    } : undefined,
    sections: []
  }

  const filteredTimeSeriesData = dateRange
    ? filterDataByDateRange(timeSeriesData, dateRange)
    : timeSeriesData

  template.sections.forEach(section => {
    if (!section.enabled) return

    switch (section.type) {
      case 'metrics':
        const selectedMetrics = section.config?.metrics
          ? metrics.filter(m => section.config?.metrics?.includes(m.id))
          : metrics
        report.sections.push({
          title: section.title,
          type: 'metrics',
          data: selectedMetrics.map(m => ({
            label: m.label,
            value: m.value,
            unit: m.unit,
            change: m.change,
            trend: m.trend
          }))
        })
        break

      case 'timeseries':
        report.sections.push({
          title: section.title,
          type: 'timeseries',
          data: filteredTimeSeriesData
        })
        break

      case 'category':
        report.sections.push({
          title: section.title,
          type: 'category',
          data: categoryData
        })
        break

      case 'predictions':
        report.sections.push({
          title: section.title,
          type: 'predictions',
          data: {
            historical: predictionData.historical.slice(-7),
            forecast: predictionData.forecast
          }
        })
        break

      case 'insights':
        report.sections.push({
          title: section.title,
          type: 'insights',
          data: insights.map(i => ({
            title: i.title,
            description: i.description,
            confidence: i.confidence,
            type: i.type
          }))
        })
        break
    }
  })

  return report
}

function filterDataByDateRange(data: ChartDataPoint[], dateRange: DateRange): ChartDataPoint[] {
  return data.filter(point => {
    const pointDate = new Date(point.label)
    if (isNaN(pointDate.getTime())) return true
    return pointDate >= dateRange.startDate && pointDate <= dateRange.endDate
  })
}

export function formatReportForPrint(report: any): string {
  const dateRangeText = report.dateRange
    ? `${new Date(report.dateRange.start).toLocaleDateString()} - ${new Date(report.dateRange.end).toLocaleDateString()}`
    : ''

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${report.title}</title>
      <style>
        @page { margin: 1in; }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #1a1a1a;
          line-height: 1.6;
        }
        h1 { 
          font-size: 28px; 
          margin-bottom: 8px;
          color: #0a0a0a;
        }
        h2 { 
          font-size: 20px; 
          margin-top: 32px;
          margin-bottom: 16px;
          color: #333;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 8px;
        }
        .header {
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 16px;
          margin-bottom: 32px;
        }
        .timestamp {
          color: #6b7280;
          font-size: 14px;
        }
        .date-range {
          color: #3b82f6;
          font-size: 14px;
          font-weight: 600;
          margin-top: 4px;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin: 24px 0;
        }
        .metric-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          background: #f9fafb;
        }
        .metric-label {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        .metric-value {
          font-size: 32px;
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
          margin-bottom: 4px;
        }
        .metric-change {
          font-size: 14px;
          font-weight: 600;
        }
        .metric-change.up { color: #10b981; }
        .metric-change.down { color: #ef4444; }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        th {
          background: #f3f4f6;
          font-weight: 600;
          color: #374151;
        }
        .insight-card {
          border-left: 4px solid #3b82f6;
          padding: 16px;
          margin: 12px 0;
          background: #f0f9ff;
        }
        .insight-card.warning { 
          border-left-color: #f59e0b;
          background: #fffbeb;
        }
        .insight-card.opportunity { 
          border-left-color: #10b981;
          background: #ecfdf5;
        }
        .insight-title {
          font-weight: 600;
          margin-bottom: 4px;
        }
        .footer {
          margin-top: 48px;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${report.title}</h1>
        <p class="timestamp">Generated on ${new Date(report.generatedAt).toLocaleString()}</p>
        ${dateRangeText ? `<p class="date-range">Report Period: ${dateRangeText}</p>` : ''}
      </div>
  `

  report.sections.forEach((section: any) => {
    html += `<h2>${section.title}</h2>`

    switch (section.type) {
      case 'metrics':
        html += '<div class="metrics-grid">'
        section.data.forEach((metric: any) => {
          html += `
            <div class="metric-card">
              <div class="metric-label">${metric.label}</div>
              <div class="metric-value">${metric.unit === '$' ? '$' : ''}${metric.value.toLocaleString()}${metric.unit !== '$' ? metric.unit : ''}</div>
              <div class="metric-change ${metric.trend}">${metric.change > 0 ? '+' : ''}${metric.change.toFixed(1)}%</div>
            </div>
          `
        })
        html += '</div>'
        break

      case 'timeseries':
      case 'category':
        html += '<table><thead><tr><th>Period/Category</th><th>Value</th></tr></thead><tbody>'
        section.data.forEach((item: any) => {
          html += `<tr><td>${item.label}</td><td>${item.value.toLocaleString()}</td></tr>`
        })
        html += '</tbody></table>'
        break

      case 'insights':
        section.data.forEach((insight: any) => {
          html += `
            <div class="insight-card ${insight.type}">
              <div class="insight-title">${insight.title}</div>
              <div>${insight.description}</div>
              <div style="margin-top: 8px; font-size: 12px; color: #6b7280;">
                Confidence: ${(insight.confidence * 100).toFixed(0)}%
              </div>
            </div>
          `
        })
        break
    }
  })

  html += `
      <div class="footer">
        <p>Analytics Intelligence Platform - Generated by Tableau Hackathon 2026</p>
      </div>
    </body>
    </html>
  `

  return html
}
