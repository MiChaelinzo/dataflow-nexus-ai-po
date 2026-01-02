import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from '@phosphor-icons/react'
import { ExportDialog } from '@/components/ExportDialog'
import { ExportFormat } from '@/lib/data-export'

interface ExportButtonProps {
  onExport: (format: ExportFormat, filename: string, includeHeaders: boolean) => void
  defaultFilename?: string
  title?: string
  description?: string
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  label?: string
}

export function ExportButton({
  onExport,
  defaultFilename = 'export',
  title,
  description,
  variant = 'outline',
  size = 'default',
  className,
  label = 'Export',
}: ExportButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setDialogOpen(true)}
        className={className}
      >
        <Download size={16} weight="bold" className="mr-2" />
        {label}
      </Button>

      <ExportDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onExport={onExport}
        defaultFilename={defaultFilename}
        title={title}
        description={description}
      />
    </>
  )
}
