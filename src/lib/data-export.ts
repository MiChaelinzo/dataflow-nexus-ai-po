import { Metric, ChartDataPoint, Insight } from './types'

// --- Types ---

export type ExportFormat = 'csv' | 'excel'

export interface ExportOptions {
  filename?: string
  dateFormat?: string
  includeHeaders?: boolean
}

// --- Helper Functions ---

/**
 * Format a value for export (handles nulls, dates, objects)
 */
function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return ''
  }
  if (value instanceof Date) {
    return value.toISOString().split('T')[0] // Basic YYYY-MM-DD
  }
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}

/**
 * Escape special characters for CSV (quotes, commas, newlines)
 */
function escapeCSV(value: string): string {
  const stringValue = String(value)
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

/**
 * Escape special characters for XML/Excel
 */
function escapeXML(value: any): string {
  if (value === null || value === undefined) return ''
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Trigger a browser download for a Blob
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// --- Core Export Logic ---

/**
 * Export data to CSV
 */
function exportToCSV(data: any[], filename: string): void {
  if (!data.length) {
    console.warn('No data to export')
    return
  }

  const headers = Object.keys(data[0])
  const csvRows: string[] = []

  // Add Header
  csvRows.push(headers.join(','))

  // Add Rows
  for (const row of data) {
    const values = headers.map(header => {
      const val = formatValue(row[header])
      return escapeCSV(val)
    })
    csvRows.push(values.join(','))
  }

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, `${filename}.csv`)
}

/**
 * Core function to export data to Excel (XML Spreadsheet 2003 format)
 */
function exportToExcel(data: any[], filename: string): void {
  if (!data.length) {
    console.warn('No data to export')
    return
  }

  const headers = Object.keys(data[0])
  
  // Construct XML Header
  let xml = '<?xml version="1.0"?>\n' +
    '<?mso-application progid="Excel.Sheet"?>\n' +
    '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ' +
    'xmlns:o="urn:schemas-microsoft-com:office:office" ' +
    'xmlns:x="urn:schemas-microsoft-com:office:excel" ' +
    'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ' +
    'xmlns:html="http://www.w3.org/TR/REC-html40">\n' +
    '<Styles>\n' +
    '<Style ss:ID="BoldHeader">\n' +
    '<Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000" ss:Bold="1"/>\n' +
    '</Style>\n' +
    '</Styles>\n' +
    '<Worksheet ss:Name="Sheet1">\n' +
    '<Table>\n'

  // Add Header Row
  xml += '<Row>\n'
  headers.forEach(header => {
    xml += `<Cell ss:StyleID="BoldHeader"><Data ss:Type="String">${escapeXML(header)}</Data></Cell>\n`
  })
  xml += '</Row>\n'

  // Add Data Rows
  for (const row of data) {
    xml += '<Row>\n'
    headers.forEach(header => {
      const value = row[header]
      const formattedValue = formatValue(value)
      // Determine type for Excel
      const type = typeof value === 'number' ? 'Number' : 'String'
      xml += `<Cell><Data ss:Type="${type}">${escapeXML(formattedValue)}</Data></Cell>\n`
    })
    xml += '</Row>\n'
  }

  // Close XML
  xml += '</Table>\n</Worksheet>\n</Workbook>'

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' })
  downloadBlob(blob, `${filename}.xls`)
}

// --- Public Export Wrappers ---

export function exportMetrics(
  metrics: Metric[], 
  format: ExportFormat, 
  options: ExportOptions = {}
): void {
  const data = metrics.map(metric => ({
    'Name': metric.label,
    'Value': metric.value,
    'Change %': metric.change,
    'Trend': metric.trend
  }))

  const filename = options.filename || `metrics-${Date.now()}`
  
  if (format === 'csv') {
    exportToCSV(data, filename)
  } else {
    exportToExcel(data, filename)
  }
}

export function exportChartData(
  chartData: ChartDataPoint[],
  format: ExportFormat,
  options: ExportOptions = {}
): void {
  const data = chartData.map(point => ({
    'Date': point.date,
    'Value': point.value,
    // Add other properties dynamically if they exist
    ...Object.fromEntries(
      Object.entries(point).filter(([k]) => k !== 'date' && k !== 'value')
    )
  }))

  const filename = options.filename || `chart-data-${Date.now()}`
  
  if (format === 'csv') {
    exportToCSV(data, filename)
  } else {
    exportToExcel(data, filename)
  }
}

export function exportInsights(
  insights: Insight[],
  format: ExportFormat,
  options: ExportOptions = {}
): void {
  const data = insights.map(insight => ({
    'Type': insight.type,
    'Title': insight.title,
    'Description': insight.description,
    'Priority': insight.priority
  }))

  const filename = options.filename || `insights-${Date.now()}`
  
  if (format === 'csv') {
    exportToCSV(data, filename)
  } else {
    exportToExcel(data, filename)
  }
}