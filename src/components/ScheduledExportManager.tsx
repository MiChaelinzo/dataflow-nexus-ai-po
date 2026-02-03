import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  CalendarBlank, 
  Clock, 
  FileArrowDown,
  Trash,
  Power,
  PencilSimple,
  CheckCircle,
  Warning,
  EnvelopeSimple,
  CaretDown,
  CaretUp
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useKV } from '@github/spark/hooks'
import { 
  ScheduledExport, 
  ExportHistory,
  formatNextRun,
  getFrequencyLabel,
  getDataTypeLabel,
  formatFileSize
} from '@/lib/scheduled-export'
import { ScheduledExportDialog } from '@/components/ScheduledExportDialog'
import { toast } from 'sonner'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { generateSampleScheduledExports, generateSampleExportHistory } from '@/lib/data'

export function ScheduledExportManager() {
  const [exports, setExports] = useKV<ScheduledExport[]>('scheduled-exports', [])
  const [exportsInitialized, setExportsInitialized] = useKV<boolean>('exports-initialized', false)
  const [history, setHistory] = useKV<ExportHistory[]>('export-history', [])
  const [historyInitialized, setHistoryInitialized] = useKV<boolean>('export-history-initialized', false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingExport, setEditingExport] = useState<ScheduledExport | undefined>()
  const [expandedExport, setExpandedExport] = useState<string | null>(null)
  const [user, setUser] = useState<{ login: string; avatarUrl: string } | null>(null)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userInfo = await window.spark.user()
        setUser({ login: userInfo?.login || '', avatarUrl: userInfo?.avatarUrl || '' })
      } catch (error) {
        console.error('Failed to load user:', error)
      }
    }
    
    loadUser()
  }, [])

  useEffect(() => {
    if (!exportsInitialized && (exports?.length ?? 0) === 0) {
      const userName = user?.login || 'You'
      const sampleExports = generateSampleScheduledExports('user-1', userName)
      setExports(() => sampleExports)
      setExportsInitialized(true)
    }
  }, [exportsInitialized, exports, setExports, setExportsInitialized, user])

  useEffect(() => {
    if (!historyInitialized && (history?.length ?? 0) === 0) {
      const sampleHistory = generateSampleExportHistory()
      setHistory(() => sampleHistory)
      setHistoryInitialized(true)
    }
  }, [historyInitialized, history, setHistory, setHistoryInitialized])

  useEffect(() => {
    const checkSchedules = setInterval(() => {
      const now = new Date()
      
      setExports((currentExports) => {
        if (!currentExports) return []
        return currentExports.map(exp => {
          if (exp.enabled && new Date(exp.nextRun) <= now) {
            executeExport(exp)
            
            const nextRun = calculateNextRunDate(exp)
            return {
              ...exp,
              lastRun: now.toISOString(),
              nextRun: nextRun.toISOString()
            }
          }
          return exp
        })
      })
    }, 60000)

    return () => clearInterval(checkSchedules)
  }, [setExports])

  const calculateNextRunDate = (exp: ScheduledExport): Date => {
    const now = new Date()
    const [hours, minutes] = exp.time.split(':').map(Number)
    
    let nextRun = new Date()
    nextRun.setHours(hours, minutes, 0, 0)
    
    if (exp.frequency === 'daily') {
      nextRun.setDate(nextRun.getDate() + 1)
    } else if (exp.frequency === 'weekly' && exp.dayOfWeek !== undefined) {
      nextRun.setDate(nextRun.getDate() + 7)
    } else if (exp.frequency === 'monthly' && exp.dayOfMonth !== undefined) {
      nextRun.setMonth(nextRun.getMonth() + 1)
    }
    
    return nextRun
  }

  const executeExport = (exp: ScheduledExport) => {
    const historyEntry: ExportHistory = {
      id: crypto.randomUUID(),
      exportId: exp.id,
      exportName: exp.name,
      timestamp: new Date().toISOString(),
      format: exp.format,
      dataType: exp.dataType,
      recipientCount: exp.recipients.length,
      status: 'success',
      fileSize: Math.floor(Math.random() * 500000) + 50000
    }

    setHistory((current) => {
      if (!current) return [historyEntry]
      return [historyEntry, ...current].slice(0, 50)
    })
    
    toast.success(`Export "${exp.name}" completed`, {
      description: `Delivered to ${exp.recipients.length} recipient${exp.recipients.length > 1 ? 's' : ''}`
    })
  }

  const handleCreate = (newExport: ScheduledExport) => {
    setExports((current) => {
      if (!current) return [newExport]
      return [...current, newExport]
    })
    toast.success('Scheduled export created', {
      description: `${newExport.name} will run ${getFrequencyLabel(newExport.frequency).toLowerCase()}`
    })
    setDialogOpen(false)
  }

  const handleUpdate = (updated: ScheduledExport) => {
    setExports((current) => {
      if (!current) return [updated]
      return current.map(exp => exp.id === updated.id ? updated : exp)
    })
    toast.success('Scheduled export updated')
    setDialogOpen(false)
    setEditingExport(undefined)
  }

  const handleDelete = (id: string) => {
    const exp = exports?.find(e => e.id === id)
    setExports((current) => {
      if (!current) return []
      return current.filter(e => e.id !== id)
    })
    toast.success(`Deleted "${exp?.name}"`)
  }

  const handleToggle = (id: string) => {
    setExports((current) => {
      if (!current) return []
      return current.map(exp => {
        if (exp.id === id) {
          const enabled = !exp.enabled
          toast.success(`Export ${enabled ? 'enabled' : 'disabled'}`)
          return { ...exp, enabled }
        }
        return exp
      })
    })
  }

  const handleEdit = (exp: ScheduledExport) => {
    setEditingExport(exp)
    setDialogOpen(true)
  }

  const handleRunNow = (exp: ScheduledExport) => {
    executeExport(exp)
    setExports((current) => {
      if (!current) return [exp]
      return current.map(e => 
        e.id === exp.id ? { ...e, lastRun: new Date().toISOString() } : e
      )
    })
  }

  const getExportHistory = (exportId: string) => {
    if (!history) return []
    return history.filter(h => h.exportId === exportId).slice(0, 5)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Scheduled Exports</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Automate data exports with recurring schedules
          </p>
        </div>
        <Button onClick={() => {
          setEditingExport(undefined)
          setDialogOpen(true)
        }} className="gap-2">
          <Plus size={18} weight="bold" />
          New Schedule
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <CalendarBlank size={20} weight="duotone" className="text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{exports?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Total Schedules</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
              <Power size={20} weight="duotone" className="text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{exports?.filter(e => e.enabled).length || 0}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <FileArrowDown size={20} weight="duotone" className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{history?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Exports Delivered</p>
            </div>
          </div>
        </Card>
      </div>

      {!exports || exports.length === 0 ? (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
              <CalendarBlank size={32} weight="duotone" className="text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">No scheduled exports yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first scheduled export to automate data delivery
              </p>
              <Button onClick={() => setDialogOpen(true)} className="gap-2">
                <Plus size={18} weight="bold" />
                Create Schedule
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {exports?.map((exp, index) => {
              const exportHistory = getExportHistory(exp.id)
              const isExpanded = expandedExport === exp.id
              
              return (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`p-6 ${!exp.enabled ? 'opacity-60' : ''}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold truncate">{exp.name}</h3>
                          <Badge variant={exp.enabled ? 'default' : 'secondary'} className="shrink-0">
                            {exp.enabled ? 'Active' : 'Paused'}
                          </Badge>
                          <Badge variant="outline" className="shrink-0">
                            {exp.format.toUpperCase()}
                          </Badge>
                        </div>
                        
                        {exp.description && (
                          <p className="text-sm text-muted-foreground mb-3">{exp.description}</p>
                        )}
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Data Type</p>
                            <p className="text-sm font-medium">{getDataTypeLabel(exp.dataType)}</p>
                          </div>
                          
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Frequency</p>
                            <div className="flex items-center gap-1.5">
                              <Clock size={14} className="text-muted-foreground" />
                              <p className="text-sm font-medium">{getFrequencyLabel(exp.frequency)}</p>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Next Run</p>
                            <div className="flex items-center gap-1.5">
                              <CalendarBlank size={14} className="text-muted-foreground" />
                              <p className="text-sm font-medium">{formatNextRun(exp.nextRun)}</p>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Recipients</p>
                            <div className="flex items-center gap-1.5">
                              <EnvelopeSimple size={14} className="text-muted-foreground" />
                              <p className="text-sm font-medium">{exp.recipients.length}</p>
                            </div>
                          </div>
                        </div>

                        {exportHistory.length > 0 && (
                          <Collapsible open={isExpanded} onOpenChange={(open) => setExpandedExport(open ? exp.id : null)}>
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="sm" className="gap-2 h-8 text-xs">
                                {isExpanded ? <CaretUp size={14} /> : <CaretDown size={14} />}
                                Recent History ({exportHistory.length})
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-3">
                              <div className="space-y-2 bg-muted/30 rounded-lg p-3">
                                {exportHistory.map((item) => (
                                  <div key={item.id} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                      {item.status === 'success' ? (
                                        <CheckCircle size={14} weight="fill" className="text-success" />
                                      ) : (
                                        <Warning size={14} weight="fill" className="text-destructive" />
                                      )}
                                      <span className="text-muted-foreground">
                                        {new Date(item.timestamp).toLocaleString()}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="text-muted-foreground">
                                        {item.recipientCount} recipient{item.recipientCount > 1 ? 's' : ''}
                                      </span>
                                      {item.fileSize && (
                                        <span className="font-mono text-muted-foreground">
                                          {formatFileSize(item.fileSize)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRunNow(exp)}
                          className="gap-2"
                        >
                          <FileArrowDown size={16} />
                          Run Now
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(exp)}
                        >
                          <PencilSimple size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggle(exp.id)}
                        >
                          <Power size={16} className={exp.enabled ? 'text-success' : ''} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(exp.id)}
                        >
                          <Trash size={16} className="text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      <ScheduledExportDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={editingExport ? handleUpdate : handleCreate}
        editingExport={editingExport}
      />
    </div>
  )
}
