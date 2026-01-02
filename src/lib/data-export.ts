import { Metric, ChartDataPoint, Insight } from './types'

export type ExportFormat = 'csv' | 'excel'

export interface ExportOptions {
  filename?: string
  sheetName?: string
  includeHeaders?: boolean
  dateFormat?: string
}

function formatValue(value: any): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'number') return value.toString()
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (value instanceof Date) return value.toISOString()
  return String(value).replace(/"/g, '""')
}

function escapeCSV(value: any): string {
  const formatted = formatValue(value)
  if (formatted.includes(',') || formatted.includes('"') || formatted.includes('\n')) {
    return `"${formatted}"`
  }
  return formatted
}

export function exportToCSV(
  data: any[],
  options: ExportOptions = {}
): void {
  const { filename = 'export', includeHeaders = true } = options

  if (!data || data.length === 0) {
    console.warn('No data to export')
    return
  }

  const headers = Object.keys(data[0])
  const csvRows: string[] = []

  if (includeHeaders) {
    csvRows.push(headers.map(escapeCSV).join(','))
  }

  for (const row of data) {
    const values = headers.map(header => escapeCSV(row[header]))
    csvRows.push(values.join(','))
  }

  const csvContent = csvRows.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, `${filename}.csv`)
}

export function exportToExcel(
  data: any[],
  options: ExportOptions = {}
): void {
  const { filename = 'export', sheetName = 'Sheet1', includeHeaders = true } = options

  if (!data || data.length === 0) {
    console.warn('No data to export')
    return
  }

  const headers = Object.keys(data[0])

  const xmlHeader = '<?xml version="1.0"?>\n' +
    '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n' +
    ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"\n' +
    ' xmlns:x="urn:schemas-microsoft-com:office:excel">\n' +
    '<Styles>\n' +
    '<Style ss:ID="Header">\n' +
    '<Font ss:Bold="1" ss:Color="#FFFFFF"/>\n' +
    '<Interior ss:Color="#4A90E2" ss:Pattern="Solid"/>\n' +
    '</Style>\n' +
    '</Styles>\n' +
    `<Worksheet ss:Name="${escapeXML(sheetName)}">\n` +
    '<Table>\n'

  const xmlRows: string[] = []

  if (includeHeaders) {
    const headerRow = headers.map(h => 
      `<Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXML(h)}</Data></Cell>`
    ).join('\n')
    xmlRows.push(`<Row>\n${headerRow}\n</Row>`)
  }

  for (const row of data) {
    const cells = headers.map(header => {
      const value = row[header]
      const type = typeof value === 'number' ? 'Number' : 'String'
      const formattedValue = formatValue(value)
      return `<Cell><Data ss:Type="${type}">${escapeXML(formattedValue)}</Data></Cell>`
    }).join('\n')
    xmlRows.push(`<Row>\n${cells}\n</Row>`)
  }

  const xmlFooter = '</Table>\n</Worksheet>\n</Workbook>'
  const xmlContent = xmlHeader + xmlRows.join('\n') + xmlFooter

  const blob = new Blob([xmlContent], { 
    type: 'application/vnd.ms-excel;charset=utf-8;' 
  })
  downloadBlob(blob, `${filename}.xls`)
}

function escapeXML(value: string): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function downloadBlob(blob: Blob, filename: string): void {
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function exportMetrics(
  metrics: Metric[],
  format: ExportFormat,
  options: ExportOptions = {}
): void {
  const data = metrics.map(metric => ({
    Name: metric.label,
    'Current Value': metric.value,
    Unit: metric.unit,
    'Change %': metric.change,
    Trend: metric.trend,
  }))

  const filename = options.filename || `metrics-${Date.now()}`

  if (format === 'csv') {
    exportToCSV(data, { ...options, filename })
  } else {
    exportToExcel(data, { ...options, filename })
  }
}

export function exportChartData(
  chartData: ChartDataPoint[],
  format: ExportFormat,
  options: ExportOptions = {}
): void {
  const data = chartData.map(point => ({
    Date: point.date,
    Value: point.value,
    ...(point.category && { Category: point.category }),
  }))

  const filename = options.filename || `chart-data-${Date.now()}`

  if (format === 'csv') {
    exportToCSV(data, { ...options, filename })
  } else {
    exportToExcel(data, { ...options, filename })
  }
}

export function exportInsights(
  insights: Insight[],
  format: ExportFormat,
  options: ExportOptions = {}
): void {
  const data = insights.map(insight => ({
    Title: insight.title,
    Type: insight.type,
    Description: insight.description,
    Saved: insight.saved ? 'Yes' : 'No',
    Created: new Date(insight.timestamp).toLocaleString(),
  }))

  const filename = options.filename || `insights-${Date.now()}`

  if (format === 'csv') {
    exportToCSV(data, { ...options, filename })
  } else {
    exportToExcel(data, { ...options, filename })
  }
}
