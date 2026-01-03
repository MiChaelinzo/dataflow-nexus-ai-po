import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from '@/components/ui/badge'
import { X } from '@phosphor-icons/react'
import { 
  ScheduledExport, 
  ExportFrequency, 
  ExportFormat, 
  ExportDataType,
  calculateNextRun 
} from '@/lib/scheduled-export'

interface ScheduledExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (exportConfig: ScheduledExport) => void
  editingExport?: ScheduledExport
}

export function ScheduledExportDialog({ 
  open, 
  onOpenChange, 
  onSave,
  editingExport 
}: ScheduledExportDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [dataType, setDataType] = useState<ExportDataType>('metrics')
  const [format, setFormat] = useState<ExportFormat>('csv')
  const [frequency, setFrequency] = useState<ExportFrequency>('daily')
  const [time, setTime] = useState('09:00')
  const [dayOfWeek, setDayOfWeek] = useState(1)
  const [dayOfMonth, setDayOfMonth] = useState(1)
  const [recipientInput, setRecipientInput] = useState('')
  const [recipients, setRecipients] = useState<string[]>([])

  useEffect(() => {
    if (editingExport) {
      setName(editingExport.name)
      setDescription(editingExport.description || '')
      setDataType(editingExport.dataType)
      setFormat(editingExport.format)
      setFrequency(editingExport.frequency)
      setTime(editingExport.time)
      setDayOfWeek(editingExport.dayOfWeek || 1)
      setDayOfMonth(editingExport.dayOfMonth || 1)
      setRecipients(editingExport.recipients)
    } else {
      setName('')
      setDescription('')
      setDataType('metrics')
      setFormat('csv')
      setFrequency('daily')
      setTime('09:00')
      setDayOfWeek(1)
      setDayOfMonth(1)
      setRecipients([])
    }
  }, [editingExport, open])

  const handleAddRecipient = () => {
    const email = recipientInput.trim()
    if (email && !recipients.includes(email)) {
      setRecipients([...recipients, email])
      setRecipientInput('')
    }
  }

  const handleRemoveRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email))
  }

  const handleSave = () => {
    const nextRun = calculateNextRun(frequency, time, dayOfWeek, dayOfMonth)
    
    const exportConfig: ScheduledExport = {
      id: editingExport?.id || crypto.randomUUID(),
      name,
      description: description || undefined,
      dataType,
      format,
      frequency,
      dayOfWeek: frequency === 'weekly' ? dayOfWeek : undefined,
      dayOfMonth: frequency === 'monthly' ? dayOfMonth : undefined,
      time,
      enabled: editingExport?.enabled ?? true,
      recipients,
      lastRun: editingExport?.lastRun,
      nextRun: nextRun.toISOString(),
      createdAt: editingExport?.createdAt || new Date().toISOString(),
      createdBy: editingExport?.createdBy || 'current-user'
    }

    onSave(exportConfig)
  }

  const isValid = name && recipients.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingExport ? 'Edit Scheduled Export' : 'Create Scheduled Export'}
          </DialogTitle>
          <DialogDescription>
            Configure automatic data exports with recurring schedules
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Export Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Weekly Metrics Report"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description for this export"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataType">Data Type</Label>
              <Select value={dataType} onValueChange={(v) => setDataType(v as ExportDataType)}>
                <SelectTrigger id="dataType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metrics">Metrics Overview</SelectItem>
                  <SelectItem value="timeseries">Time Series Data</SelectItem>
                  <SelectItem value="category">Category Data</SelectItem>
                  <SelectItem value="insights">AI Insights</SelectItem>
                  <SelectItem value="activities">Activity Feed</SelectItem>
                  <SelectItem value="all">All Data</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              <Select value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
                <SelectTrigger id="format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel (XLSX)</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as ExportFrequency)}>
                <SelectTrigger id="frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>

              {frequency === 'weekly' && (
                <div className="space-y-2">
                  <Label htmlFor="dayOfWeek">Day of Week</Label>
                  <Select value={dayOfWeek.toString()} onValueChange={(v) => setDayOfWeek(parseInt(v))}>
                    <SelectTrigger id="dayOfWeek">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sunday</SelectItem>
                      <SelectItem value="1">Monday</SelectItem>
                      <SelectItem value="2">Tuesday</SelectItem>
                      <SelectItem value="3">Wednesday</SelectItem>
                      <SelectItem value="4">Thursday</SelectItem>
                      <SelectItem value="5">Friday</SelectItem>
                      <SelectItem value="6">Saturday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {frequency === 'monthly' && (
                <div className="space-y-2">
                  <Label htmlFor="dayOfMonth">Day of Month</Label>
                  <Select value={dayOfMonth.toString()} onValueChange={(v) => setDayOfMonth(parseInt(v))}>
                    <SelectTrigger id="dayOfMonth">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                        <SelectItem key={day} value={day.toString()}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipients">Recipients *</Label>
            <div className="flex gap-2">
              <Input
                id="recipients"
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRecipient())}
                placeholder="Enter email address"
              />
              <Button type="button" onClick={handleAddRecipient}>
                Add
              </Button>
            </div>
            {recipients.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {recipients.map(email => (
                  <Badge key={email} variant="secondary" className="gap-2">
                    {email}
                    <button
                      onClick={() => handleRemoveRecipient(email)}
                      className="hover:text-destructive"
                    >
                      <X size={14} weight="bold" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid}>
            {editingExport ? 'Update' : 'Create'} Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
