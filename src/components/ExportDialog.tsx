import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { 
  FileCsv, 
  FileXls, 
  Download,
  Check
} from '@phosphor-icons/react'
import { ExportFormat } from '@/lib/data-export'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExport: (format: ExportFormat, filename: string, includeHeaders: boolean) => void
  title?: string
  description?: string
  defaultFilename?: string
}

export function ExportDialog({
  open,
  onOpenChange,
  onExport,
  title = 'Export Data',
  description = 'Choose your export format and customize the output',
  defaultFilename = 'analytics-export',
}: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('csv')
  const [filename, setFilename] = useState(defaultFilename)
  const [includeHeaders, setIncludeHeaders] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      onExport(format, filename, includeHeaders)
      
      toast.success('Export successful', {
        description: `Your data has been exported as ${format.toUpperCase()}`,
        icon: <Check size={16} weight="bold" />,
      })
      
      onOpenChange(false)
    } catch (error) {
      toast.error('Export failed', {
        description: 'Unable to export data. Please try again.',
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download size={20} weight="duotone" className="text-accent" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Format</Label>
            <RadioGroup
              value={format}
              onValueChange={(value) => setFormat(value as ExportFormat)}
              className="grid grid-cols-2 gap-3"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Label
                  htmlFor="csv"
                  className={`flex flex-col items-center gap-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                    format === 'csv'
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <RadioGroupItem value="csv" id="csv" className="sr-only" />
                  <FileCsv
                    size={32}
                    weight="duotone"
                    className={format === 'csv' ? 'text-accent' : 'text-muted-foreground'}
                  />
                  <div className="text-center">
                    <div className="font-semibold text-sm">CSV</div>
                    <div className="text-xs text-muted-foreground">
                      Comma-separated values
                    </div>
                  </div>
                </Label>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Label
                  htmlFor="excel"
                  className={`flex flex-col items-center gap-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                    format === 'excel'
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <RadioGroupItem value="excel" id="excel" className="sr-only" />
                  <FileXls
                    size={32}
                    weight="duotone"
                    className={format === 'excel' ? 'text-accent' : 'text-muted-foreground'}
                  />
                  <div className="text-center">
                    <div className="font-semibold text-sm">Excel</div>
                    <div className="text-xs text-muted-foreground">
                      Microsoft Excel format
                    </div>
                  </div>
                </Label>
              </motion.div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filename" className="text-sm font-medium">
              File Name
            </Label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Enter filename"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              File will be saved as: {filename}.{format === 'csv' ? 'csv' : 'xls'}
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="headers" className="text-sm font-medium cursor-pointer">
                Include Headers
              </Label>
              <p className="text-xs text-muted-foreground">
                Add column names as the first row
              </p>
            </div>
            <Switch
              id="headers"
              checked={includeHeaders}
              onCheckedChange={setIncludeHeaders}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || !filename.trim()}
            className="gap-2"
          >
            {isExporting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Download size={16} weight="bold" />
                </motion.div>
                Exporting...
              </>
            ) : (
              <>
                <Download size={16} weight="bold" />
                Export {format.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
