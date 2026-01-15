import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badg
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
  value: number
  trend: 'up' | 'down' | 'neutral'

  id: string

  severity: 'criti
  expectedVa
  timestamp: nu
  value: number
  change: number
  trend: 'up' | 'down' | 'neutral'
i

interface Anomaly {
  id: string
  metricId: string
  metricLabel: string
  type: 'spike' | 'drop' | 'unusual_pattern' | 'threshold_breach'
  severity: 'critical' | 'warning' | 'info'
  currentValue: number
  expectedValue: number
  deviation: number
  timestamp: number
  acknowledged: boolean
  explanation: string
  recommendation: string
}

    notifyOnWarning: false,
  metrics: Metric[]
 

export function AnomalyDetector({ metrics }: AnomalyDetectorProps) {
  const [anomalies, setAnomalies] = useKV<Anomaly[]>('detected-anomalies', [])
  const [alertSettings, setAlertSettings] = useKV('anomaly-alert-settings', {
    enabled: true,
    sensitivity: 50,
    notifyOnCritical: true,
    notifyOnWarning: false,
    notifyOnInfo: false,
    
  const [showSettings, setShowSettings] = useState(false)

  const detectAnomalies = useMemo(() => {
          deviation: Math.abs(metric.c
    const sensitivityFactor = alertSettings.sensitivity / 50

    metrics.forEach((metric) => {
      const changeThreshold = 15 * sensitivityFactor
      const criticalThreshold = 30 * sensitivityFactor

      if (Math.abs(metric.change) > criticalThreshold) {
        const isSpike = metric.change > 0
        newAnomalies.push({
          id: `${metric.id}-${Date.now()}`,
          metricId: metric.id,
        })
    }

    setAnomalies((current) =>
    )
  }
  const handleDismiss = (anomaly
    toast.success('Anomaly dis

  const acknowledgedAnomalies = (a
  const getSeverityColor = (severity: string) => {
      case 'critical': return 'text-destructive'
      case
    }

    switch (severity) {
      case 'warning': return '
      default: return 'bg-muted/10 b
  }
  const getTypeIcon = (type: s
      case 'spike': return <TrendUp s
      case 'unusual_pattern': return <Lightning size={20} weight="
    }

    <div className="space-y-6"
        <div>
          <p className="text-sm text-muted-foreground mt-1">
          
       
      

          )}
            variant="outline"

          >
            Settings
        </div>

      
            initial={{ opacity:
            exit={{ opacity: 0, height: 0 }}
        
                <div>
                  <p className=
                <Switch
                  onCheckedChange={(checked) => 
                      enabled: checked,

                      notifyO
                  }
              </div>
              <div className=
              
           
          
       
     
                      }))

                    step={5}
                  />
                    Higher sensitivity detects smaller anomalies
     
                <div className="space-y-3
  }

  const handleDismiss = (anomalyId: string) => {
    setAnomalies((current) => current.filter(a => a.id !== anomalyId))
    toast.success('Anomaly dismissed')
  }

  const unacknowledgedAnomalies = anomalies.filter(a => !a.acknowledged)
  const acknowledgedAnomalies = anomalies.filter(a => a.acknowledged)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-destructive'
      case 'warning': return 'text-warning'
      case 'info': return 'text-accent'
      default: return 'text-muted-foreground'
    }
  }

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive/10 border-destructive/30'
      case 'warning': return 'bg-warning/10 border-warning/30'
      case 'info': return 'bg-accent/10 border-accent/30'
      default: return 'bg-muted/10 border-border'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'spike': return <TrendUp size={20} weight="duotone" />
      case 'drop': return <TrendDown size={20} weight="duotone" />
      case 'unusual_pattern': return <Lightning size={20} weight="duotone" />
      default: return <Warning size={20} weight="duotone" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Smart Anomaly Detection</h2>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered monitoring alerts you to unusual patterns
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unacknowledgedAnomalies.length > 0 && (
            <Badge variant="destructive" className="gap-2 px-3 py-1 text-sm">
              <BellRinging size={16} weight="fill" className="animate-pulse" />
              {unacknowledgedAnomalies.length} Alert{unacknowledgedAnomalies.length !== 1 ? 's' : ''}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Sliders size={16} />
            Settings
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Alert Settings</h3>
                  <p className="text-sm text-muted-foreground">Configure anomaly detection preferences</p>
                </div>
                <Switch
                  checked={alertSettings.enabled}
                  onCheckedChange={(checked) => 
                    setAlertSettings((current) => ({ ...current, enabled: checked }))
                  }
                />
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm">Detection Sensitivity: {alertSettings.sensitivity}%</Label>
                  <Slider
                    value={[alertSettings.sensitivity]}
                    onValueChange={([value]) => 
                      setAlertSettings((current) => ({ ...current, sensitivity: value }))
                    }
                    min={10}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Higher sensitivity detects smaller anomalies
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <Label className="text-sm font-semibold">Notification Preferences</Label>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notify-critical" className="text-sm cursor-pointer">
                      Critical anomalies
                    </Label>
                    <Switch
                      id="notify-critical"
                      checked={alertSettings.notifyOnCritical}
                      onCheckedChange={(checked) =>
                        setAlertSettings((current) => ({ ...current, notifyOnCritical: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="notify-warning" className="text-sm cursor-pointer">
                      Warning anomalies
                    </Label>
                    <Switch
                      id="notify-warning"
                      checked={alertSettings.notifyOnWarning}
                      onCheckedChange={(checked) =>




















































































































































