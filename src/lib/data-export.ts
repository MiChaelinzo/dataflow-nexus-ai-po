import { Metric, ChartDataPoint, Insight } from './types'

export interface ExportOptions {

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

  const csvRows: string[] = []
  if (includeHeaders) {
  }

    csvRows.push(values.join(','))


}
export function exportToExcel(
  o

  if (!data || data.length 
  }
  const headers = Object.keys(data



    const values = headers.map(header => formatValue(row[header]))
  }
 

  downloadBlob(blob, `${filena

  const xmlHeader = '<?xml ve
    '<Wor
    ' xmlns:x="urn:schemas-microsoft-com:office:excel"\n' +

    '<Style ss:ID="Header">\n' +
    '<Interior ss:Color="#4A90E2" ss:Pat
   


    const styleId = rowIndex 

      return `<Cell${st
    return `<Row>\n${c


}
function escapeXML(value: string): string {
    .replace(/&/g, '&
   


  const url = URL.createObjectURL(blob)
  link.href = url
  li
  link.click()
 

  metrics: Metric[],
  options: ExportOptions = {}
  const data = metrics.map(metric => ({
    'Current Value': metric.value,
    Unit: metric.unit,
    'Change %': metric.change,
  }))
  const filename = options.filename || `metrics-${Date.n
  if (format === '
  } else {
  }

  chartData: ChartDataPoint[],
  options: ExportO
  const data = char
    Value: point.value,
    ...(point.d

  
    exportToCSV(data, { ...options, filename })
    exportToExcel(data, { ...option
}
export function exportInsights(
  format: ExportFormat,
): void {
    Title: insight.title,
    Type: insig

    Saved: insight.saved ? 'Yes' : 'No',

  
 

}
export functio
  format: ExportFormat,
): void {
    sheets.forEach(sheet =
        ...options,
      })
 

        filename: options.filename || 'export',
      })
  }

  headers: string[],
  format: ExportFormat,
): void {
    const obj:
      obj[header] = row[index]
    return obj


    exportToCSV(data, { ...opt
    exportToExcel(da
}















































































































