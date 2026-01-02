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
    throw new Error('No data to export')
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
    throw new Error('No data to export')
  }

  const headers = Object.keys(data[0])
  const rows: string[][] = []

  if (includeHeaders) {
    rows.push(headers)
  }

  for (const row of data) {
    const values = headers.map(header => formatValue(row[header]))
    rows.push(values)
  }

  const xmlContent = generateExcelXML(rows, sheetName)
  const blob = new Blob([xmlContent], { 
    type: 'application/vnd.ms-excel;charset=utf-8;' 
  })
  downloadBlob(blob, `${filename}.xls`)
}

function generateExcelXML(rows: string[][], sheetName: string): string {
  const xmlHeader = '<?xml version="1.0"?>\n' +
    '<?mso-application progid="Excel.Sheet"?>\n' +
    '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n' +
    ' xmlns:o="urn:schemas-microsoft-com:office:office"\n' +
    ' xmlns:x="urn:schemas-microsoft-com:office:excel"\n' +
    ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"\n' +
    ' xmlns:html="http://www.w3.org/TR/REC-html40">\n' +
    '<Styles>\n' +
    '<Style ss:ID="Header">\n' +
    '<Font ss:Bold="1"/>\n' +
    '<Interior ss:Color="#4A90E2" ss:Pattern="Solid"/>\n' +
    '<Font ss:Color="#FFFFFF"/>\n' +
    '</Style>\n' +
    '</Styles>\n' +
    `<Worksheet ss:Name="${escapeXML(sheetName)}">\n` +
    '<Table>\n'

  const xmlRows = rows.map((row, rowIndex) => {
    const styleId = rowIndex === 0 ? ' ss:StyleID="Header"' : ''
    const cells = row.map(cell => {
      const cellValue = escapeXML(cell)
      const cellType = !isNaN(Number(cell)) && cell !== '' ? 'Number' : 'String'
      return `<Cell${styleId}><Data ss:Type="${cellType}">${cellValue}</Data></Cell>`
    }).join('\n')
    return `<Row>\n${cells}\n</Row>`
  }).join('\n')

  const xmlFooter = '\n</Table>\n</Worksheet>\n</Workbook>'

  return xmlHeader + xmlRows + xmlFooter
}

function escapeXML(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportMetrics(
  metrics: Metric[],
  format: ExportFormat,
  options: ExportOptions = {}
): void {
  const data = metrics.map(metric => ({
    Label: metric.label,
    'Current Value': metric.value,
    'Previous Value': metric.previousValue,
    Unit: metric.unit,
    Trend: metric.trend,
    'Change %': metric.change,
    'Change Label': metric.changeLabel,
  }))

  const filename = options.filename || `metrics-${Date.now()}`
  
  if (format === 'csv') {
    exportToCSV(data, { ...options, filename })
  } else {
    exportToExcel(data, { ...options, filename, sheetName: 'Metrics' })
  }
}

export function exportChartData(
  chartData: ChartDataPoint[],
  format: ExportFormat,
  options: ExportOptions = {}
): void {
  const data = chartData.map(point => ({
    Label: point.label,
    Value: point.value,
    ...(point.category && { Category: point.category }),
    ...(point.date && { Date: point.date }),
  }))

  const filename = options.filename || `chart-data-${Date.now()}`
  
  if (format === 'csv') {
    exportToCSV(data, { ...options, filename })
  } else {
    exportToExcel(data, { ...options, filename, sheetName: 'Chart Data' })
  }
}

export function exportInsights(
  insights: Insight[],
  format: ExportFormat,
  options: ExportOptions = {}
): void {
  const data = insights.map(insight => ({
    Title: insight.title,
    Description: insight.description,
    Type: insight.type,
    'Confidence %': Math.round(insight.confidence * 100),
    Metric: insight.metric || 'N/A',
    Timestamp: new Date(insight.timestamp).toLocaleString(),
    Saved: insight.saved ? 'Yes' : 'No',
  }))

  const filename = options.filename || `insights-${Date.now()}`
  
  if (format === 'csv') {
    exportToCSV(data, { ...options, filename })
  } else {
    exportToExcel(data, { ...options, filename, sheetName: 'Insights' })
  }
}

export function exportMultiSheet(
  sheets: Array<{ name: string; data: any[] }>,
  format: ExportFormat,
  options: ExportOptions = {}
): void {
  if (format === 'csv') {
    sheets.forEach(sheet => {
      exportToCSV(sheet.data, {
        ...options,
        filename: `${options.filename || 'export'}-${sheet.name}`,
      })
    })
  } else {
    sheets.forEach(sheet => {
      exportToExcel(sheet.data, {
        ...options,
        filename: options.filename || 'export',
        sheetName: sheet.name,
      })
    })
  }
}

export function exportTableData(
  headers: string[],
  rows: any[][],
  format: ExportFormat,
  options: ExportOptions = {}
): void {
  const data = rows.map(row => {
    const obj: any = {}
    headers.forEach((header, index) => {
      obj[header] = row[index]
    })
    return obj
  })

  const filename = options.filename || `table-data-${Date.now()}`
  
  if (format === 'csv') {
    exportToCSV(data, { ...options, filename })
  } else {
    exportToExcel(data, { ...options, filename, sheetName: options.sheetName || 'Data' })
  }
}
