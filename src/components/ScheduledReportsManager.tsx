import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Calendar, Clock, Plus, Trash, Play, Pause, Users } from '@phosphor-icons/react'
import { ReportTemplate, ScheduledReport } from '@/lib/report-export'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'
import { motion } from 'framer-motion'

interface ScheduledReportsManagerProps {
  templates: ReportTemplate[]
  onExport: (template: ReportTemplate, format: 'pdf' | 'csv' | 'json') => void
}

export function ScheduledReportsManager({ templates, onExport }: ScheduledReportsManagerProps) {
  const [scheduledReports, setScheduledReports] = useKV<ScheduledReport[]>('scheduled-reports', [])
  const [isCreating, setIsCreating] = useState(false)
  const [newReport, setNewReport] = useState<Partial<ScheduledReport>>({
    frequency: 'weekly',
    dayOfWeek: 1,
    time: '09:00',
    format: 'pdf',
    enabled: true,
    recipients: []
  })
  const [recipientEmail, setRecipientEmail] = useState('')

  const safeScheduledReports = scheduledReports || []

  const handleCreateSchedule = () => {
    if (!newReport.templateId || !newReport.name || !newReport.time) {
      toast.error('Please fill in all required fields')
      return
    }

    const nextRun = calculateNextRun(
      newReport.frequency as 'daily' | 'weekly' | 'monthly',
      newReport.dayOfWeek,
      newReport.dayOfMonth,
      newReport.time
    )

    const schedule: ScheduledReport = {
      id: `schedule-${Date.now()}`,
      templateId: newReport.templateId,
      name: newReport.name,
      frequency: newReport.frequency as 'daily' | 'weekly' | 'monthly',
      dayOfWeek: newReport.dayOfWeek,
      dayOfMonth: newReport.dayOfMonth,
      time: newReport.time,
      recipients: newReport.recipients || [],
      format: newReport.format as 'pdf' | 'csv',
      enabled: newReport.enabled || true,
      nextRun
    }

    setScheduledReports((current) => [...(current || []), schedule])
    setIsCreating(false)
    setNewReport({
      frequency: 'weekly',
      dayOfWeek: 1,
      time: '09:00',
      format: 'pdf',
      enabled: true,
      recipients: []
    })
    toast.success('Scheduled report created')
  }

  const handleToggleSchedule = (id: string) => {
    setScheduledReports((current) =>
      (current || []).map(report =>
        report.id === id ? { ...report, enabled: !report.enabled } : report
      )
    )
  }

  const handleDeleteSchedule = (id: string) => {
    setScheduledReports((current) => (current || []).filter(report => report.id !== id))
    toast.success('Scheduled report deleted')
  }

  const handleRunNow = (schedule: ScheduledReport) => {
    const template = templates.find(t => t.id === schedule.templateId)
    if (template) {
      onExport(template, schedule.format)
      toast.success('Report generated successfully')
    }
  }

  const addRecipient = () => {
    if (recipientEmail && recipientEmail.includes('@')) {
      setNewReport({
        ...newReport,
        recipients: [...(newReport.recipients || []), recipientEmail]
      })
      setRecipientEmail('')
    } else {
      toast.error('Please enter a valid email address')
    }
  }

  const removeRecipient = (email: string) => {
    setNewReport({
      ...newReport,
      recipients: (newReport.recipients || []).filter(r => r !== email)
    })
  }

  const getFrequencyLabel = (report: ScheduledReport) => {
    switch (report.frequency) {
      case 'daily':
        return `Daily at ${report.time}`
      case 'weekly':
        return `Weekly on ${getDayName(report.dayOfWeek || 1)} at ${report.time}`
      case 'monthly':
        return `Monthly on day ${report.dayOfMonth} at ${report.time}`
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Scheduled Reports</h3>
          <p className="text-sm text-muted-foreground">
            Automate report generation and distribution
          </p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={18} />
              Schedule Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule New Report</DialogTitle>
              <DialogDescription>
                Set up automated report generation and delivery
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Report Name</Label>
                <Input
                  placeholder="Weekly Executive Summary"
                  value={newReport.name || ''}
                  onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Report Template</Label>
                <Select
                  value={newReport.templateId}
                  onValueChange={(value) => setNewReport({ ...newReport, templateId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select
                    value={newReport.frequency}
                    onValueChange={(value: any) => setNewReport({ ...newReport, frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={newReport.time}
                    onChange={(e) => setNewReport({ ...newReport, time: e.target.value })}
                  />
                </div>
              </div>

              {newReport.frequency === 'weekly' && (
                <div className="space-y-2">
                  <Label>Day of Week</Label>
                  <Select
                    value={newReport.dayOfWeek?.toString()}
                    onValueChange={(value) => setNewReport({ ...newReport, dayOfWeek: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Monday</SelectItem>
                      <SelectItem value="2">Tuesday</SelectItem>
                      <SelectItem value="3">Wednesday</SelectItem>
                      <SelectItem value="4">Thursday</SelectItem>
                      <SelectItem value="5">Friday</SelectItem>
                      <SelectItem value="6">Saturday</SelectItem>
                      <SelectItem value="0">Sunday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {newReport.frequency === 'monthly' && (
                <div className="space-y-2">
                  <Label>Day of Month</Label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={newReport.dayOfMonth || 1}
                    onChange={(e) => setNewReport({ ...newReport, dayOfMonth: parseInt(e.target.value) })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Export Format</Label>
                <Select
                  value={newReport.format}
                  onValueChange={(value: any) => setNewReport({ ...newReport, format: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Recipients (Email)</Label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addRecipient()}
                  />
                  <Button type="button" onClick={addRecipient} variant="outline">
                    Add
                  </Button>
                </div>
                {newReport.recipients && newReport.recipients.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newReport.recipients.map((email) => (
                      <Badge key={email} variant="secondary" className="gap-2">
                        {email}
                        <button
                          onClick={() => removeRecipient(email)}
                          className="hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSchedule}>
                Create Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {safeScheduledReports.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <Calendar size={48} weight="thin" className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Scheduled Reports</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Create automated report schedules to receive regular insights via email
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {safeScheduledReports.map((report, index) => {
            const template = templates.find(t => t.id === report.templateId)
            
            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`p-6 ${report.enabled ? 'border-accent/30' : 'opacity-60'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{report.name}</h3>
                        <Badge variant={report.enabled ? 'default' : 'secondary'} className="text-xs">
                          {report.enabled ? 'Active' : 'Paused'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {template?.name || 'Unknown Template'}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleSchedule(report.id)}
                      >
                        {report.enabled ? <Pause size={16} /> : <Play size={16} />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSchedule(report.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={16} className="text-muted-foreground" />
                      <span className="text-muted-foreground">{getFrequencyLabel(report)}</span>
                    </div>

                    {report.recipients.length > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users size={16} className="text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {report.recipients.length} recipient{report.recipients.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={16} className="text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Next run: {new Date(report.nextRun).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => handleRunNow(report)}
                    >
                      <Play size={16} />
                      Run Now
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function calculateNextRun(
  frequency: 'daily' | 'weekly' | 'monthly',
  dayOfWeek?: number,
  dayOfMonth?: number,
  time?: string
): number {
  const now = new Date()
  const [hours, minutes] = (time || '09:00').split(':').map(Number)
  
  const next = new Date()
  next.setHours(hours, minutes, 0, 0)
  
  switch (frequency) {
    case 'daily':
      if (next <= now) {
        next.setDate(next.getDate() + 1)
      }
      break
      
    case 'weekly':
      const targetDay = dayOfWeek || 1
      const currentDay = now.getDay()
      let daysUntilTarget = targetDay - currentDay
      if (daysUntilTarget <= 0 || (daysUntilTarget === 0 && next <= now)) {
        daysUntilTarget += 7
      }
      next.setDate(next.getDate() + daysUntilTarget)
      break
      
    case 'monthly':
      next.setDate(dayOfMonth || 1)
      if (next <= now) {
        next.setMonth(next.getMonth() + 1)
      }
      break
  }
  
  return next.getTime()
}

function getDayName(dayOfWeek: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[dayOfWeek] || 'Monday'
}
