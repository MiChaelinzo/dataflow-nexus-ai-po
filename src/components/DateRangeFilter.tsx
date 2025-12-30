import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { CalendarBlank, Clock } from '@phosphor-icons/react'
import { DateRange, DateRangePreset, getDateRangeFromPreset } from '@/lib/report-export'
import { format } from 'date-fns'

interface DateRangeFilterProps {
  dateRange?: DateRange
  dynamicTimeEnabled: boolean
  onDateRangeChange: (dateRange: DateRange) => void
  onDynamicTimeChange: (enabled: boolean) => void
}

export function DateRangeFilter({
  dateRange,
  dynamicTimeEnabled,
  onDateRangeChange,
  onDynamicTimeChange
}: DateRangeFilterProps) {
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(dateRange?.startDate)
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(dateRange?.endDate)
  const [showCustomPicker, setShowCustomPicker] = useState(false)

  const handlePresetChange = (preset: DateRangePreset) => {
    if (preset === 'custom') {
      setShowCustomPicker(true)
    } else {
      const newDateRange = getDateRangeFromPreset(preset)
      onDateRangeChange(newDateRange)
      setShowCustomPicker(false)
    }
  }

  const handleCustomDateApply = () => {
    if (customStartDate && customEndDate) {
      onDateRangeChange({
        startDate: customStartDate,
        endDate: customEndDate,
        preset: 'custom'
      })
      setShowCustomPicker(false)
    }
  }

  const currentPreset = dateRange?.preset || 'last-30-days'
  
  const presetLabels: Record<DateRangePreset, string> = {
    'today': 'Today',
    'yesterday': 'Yesterday',
    'last-7-days': 'Last 7 Days',
    'last-30-days': 'Last 30 Days',
    'last-90-days': 'Last 90 Days',
    'this-month': 'This Month',
    'last-month': 'Last Month',
    'this-quarter': 'This Quarter',
    'last-quarter': 'Last Quarter',
    'this-year': 'This Year',
    'last-year': 'Last Year',
    'custom': 'Custom Range'
  }

  const formatDateRange = () => {
    if (!dateRange) return 'No date range selected'
    return `${format(dateRange.startDate, 'MMM d, yyyy')} - ${format(dateRange.endDate, 'MMM d, yyyy')}`
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-1">Date Range Settings</h3>
          <p className="text-sm text-muted-foreground">
            Configure the time period for this report template
          </p>
        </div>
        <Badge variant="outline" className="gap-2">
          <CalendarBlank size={14} weight="duotone" />
          {presetLabels[currentPreset]}
        </Badge>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
          <div className="flex items-center gap-3">
            <Clock size={20} weight="duotone" className="text-accent" />
            <div>
              <Label className="text-sm font-medium">Dynamic Time Periods</Label>
              <p className="text-xs text-muted-foreground">
                Automatically adjust date range when generating reports
              </p>
            </div>
          </div>
          <Switch
            checked={dynamicTimeEnabled}
            onCheckedChange={onDynamicTimeChange}
          />
        </div>

        {dynamicTimeEnabled && (
          <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg text-sm">
            <p className="text-accent-foreground">
              <strong>Dynamic mode enabled:</strong> Reports will always use the latest data for the selected time period. 
              For example, "Last 7 Days" will always include the most recent 7 days.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label>Time Period</Label>
          <Select value={currentPreset} onValueChange={handlePresetChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="last-7-days">Last 7 Days</SelectItem>
              <SelectItem value="last-30-days">Last 30 Days</SelectItem>
              <SelectItem value="last-90-days">Last 90 Days</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="this-quarter">This Quarter</SelectItem>
              <SelectItem value="last-quarter">Last Quarter</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {currentPreset === 'custom' && (
          <div className="space-y-4 p-4 border rounded-lg bg-card">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <CalendarBlank size={16} />
                      {customStartDate ? format(customStartDate, 'MMM d, yyyy') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={customStartDate}
                      onSelect={setCustomStartDate}
                      disabled={(date) => date > new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <CalendarBlank size={16} />
                      {customEndDate ? format(customEndDate, 'MMM d, yyyy') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={customEndDate}
                      onSelect={setCustomEndDate}
                      disabled={(date) => {
                        if (date > new Date()) return true
                        if (customStartDate && date < customStartDate) return true
                        return false
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Button 
              onClick={handleCustomDateApply}
              disabled={!customStartDate || !customEndDate}
              className="w-full"
            >
              Apply Custom Range
            </Button>
          </div>
        )}

        {dateRange && (
          <div className="p-4 border rounded-lg bg-muted/50">
            <p className="text-sm font-medium mb-1">Current Date Range</p>
            <p className="text-sm text-muted-foreground font-mono">{formatDateRange()}</p>
          </div>
        )}
      </div>
    </Card>
  )
}
