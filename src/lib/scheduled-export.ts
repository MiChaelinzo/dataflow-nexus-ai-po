export type ExportFrequency = 'daily' | 'weekly' | 'monthly'
export type ExportFormat = 'csv' | 'excel' | 'json'
export type ExportDataType = 'metrics' | 'timeseries' | 'category' | 'insights' | 'activities' | 'all'

export interface ScheduledExport {
  id: string
  name: string
  description?: string
  dataType: ExportDataType
  format: ExportFormat
  frequency: ExportFrequency
  dayOfWeek?: number
  dayOfMonth?: number
  time: string
  enabled: boolean
  recipients: string[]
  lastRun?: string
  nextRun: string
  createdAt: string
  createdBy: string
}

export interface ExportHistory {
  id: string
  exportId: string
  exportName: string
  timestamp: string
  format: ExportFormat
  dataType: ExportDataType
  recipientCount: number
  status: 'success' | 'failed'
  fileSize?: number
  errorMessage?: string
}

export function calculateNextRun(
  frequency: ExportFrequency,
  time: string,
  dayOfWeek?: number,
  dayOfMonth?: number
): Date {
  const now = new Date()
  const [hours, minutes] = time.split(':').map(Number)
  
  let nextRun = new Date()
  nextRun.setHours(hours, minutes, 0, 0)
  
  if (frequency === 'daily') {
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1)
    }
  } else if (frequency === 'weekly' && dayOfWeek !== undefined) {
    const currentDay = nextRun.getDay()
    let daysUntilTarget = dayOfWeek - currentDay
    
    if (daysUntilTarget < 0 || (daysUntilTarget === 0 && nextRun <= now)) {
      daysUntilTarget += 7
    }
    
    nextRun.setDate(nextRun.getDate() + daysUntilTarget)
  } else if (frequency === 'monthly' && dayOfMonth !== undefined) {
    nextRun.setDate(dayOfMonth)
    
    if (nextRun <= now) {
      nextRun.setMonth(nextRun.getMonth() + 1)
    }
    
    const lastDayOfMonth = new Date(nextRun.getFullYear(), nextRun.getMonth() + 1, 0).getDate()
    if (dayOfMonth > lastDayOfMonth) {
      nextRun.setDate(lastDayOfMonth)
    }
  }
  
  return nextRun
}

export function formatNextRun(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffDays > 7) {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  } else if (diffDays > 0) {
    return `In ${diffDays} day${diffDays > 1 ? 's' : ''}`
  } else if (diffHours > 0) {
    return `In ${diffHours} hour${diffHours > 1 ? 's' : ''}`
  } else {
    return 'Soon'
  }
}

export function getFrequencyLabel(frequency: ExportFrequency): string {
  switch (frequency) {
    case 'daily':
      return 'Daily'
    case 'weekly':
      return 'Weekly'
    case 'monthly':
      return 'Monthly'
  }
}

export function getDataTypeLabel(dataType: ExportDataType): string {
  switch (dataType) {
    case 'metrics':
      return 'Metrics Overview'
    case 'timeseries':
      return 'Time Series Data'
    case 'category':
      return 'Category Data'
    case 'insights':
      return 'AI Insights'
    case 'activities':
      return 'Activity Feed'
    case 'all':
      return 'All Data'
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
