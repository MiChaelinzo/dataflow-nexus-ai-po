import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  TrendDow
  TrendDown,
  X,
  Gear,
impo
  Check,
  Gear,
interface Anomaly {
  metricLabel: string
import { useKV } from '@github/spark/hooks'
  actual: number

  explanation: str
  acknowledg

  enabled: bool
  notifyOnCritic
  notifyOnInfo: boolean



  const [ano
    enabled: true,
  metricLabel: string
  type: 'spike' | 'drop' | 'unusual'
  severity: 'critical' | 'warning' | 'info'
  actual: number
  expected: number
  deviation: number
  timestamp: number
  explanation: string
  recommendation: string
  acknowledged: boolean
}

interface AlertSettings {
  enabled: boolean
  sensitivity: number
  notifyOnCritical: boolean
  notifyOnWarning: boolean
  notifyOnInfo: boolean
}

interface AnomalyDetectorProps {
  metrics: Metric[]
}

export function AnomalyDetector({ metrics }: AnomalyDetectorProps) {
  const [anomalies, setAnomalies] = useKV<Anomaly[]>('detected-anomalies', [])
  const [alertSettings, setAlertSettings] = useKV<AlertSettings>('anomaly-alert-settings', {
    enabled: true,
    sensitivity: 50,
    notifyOnCritical: true,
    notifyOnWarning: true,
    notifyOnInfo: false,
    
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
            severity: 'warning',

    const detectAnomalies = () => {
      const sensitivity = (alertSettings?.sensitivity || 50) / 100
      const changeThreshold = 10 + (1 - sensitivity) * 30
      const criticalThreshold = changeThreshold * 1.5
      
      const newAnomalies: Anomaly[] = []
      
      metrics.forEach((metric) => {
        if (Math.abs(metric.change) > criticalThreshold) {
          newAnomalies.push({
            id: `${metric.id}-${Date.now()}`,
            metricId: metric.id,
            metricLabel: metric.label,
            type: metric.change > 0 ? 'spike' : 'drop',
            severity: 'critical',
            actual: metric.value,
            expected: metric.value / (1 + metric.change / 100),
            deviation: Math.abs(metric.change),
            timestamp: Date.now(),
            explanation: `${metric.label} has ${metric.change > 0 ? 'increased' : 'decreased'} by ${Math.abs(metric.change).toFixed(1)}%, which is significantly higher than expected.`,
            recommendation: `Investigate the root cause immediately. This deviation exceeds critical thresholds.`,
            acknowledged: false,
          })
    setAnomalies((current) =>
          newAnomalies.push({
    toast.success('Anomaly acknowledged')
            metricId: metric.id,
  const handleDismiss = (anomalyId: st
            type: metric.change > 0 ? 'spike' : 'drop',
            severity: 'warning',
            actual: metric.value,
            expected: metric.value / (1 + metric.change / 100),
            deviation: Math.abs(metric.change),
            timestamp: Date.now(),
            explanation: `${metric.label} shows unusual ${metric.change > 0 ? 'growth' : 'decline'} of ${Math.abs(metric.change).toFixed(1)}%.`,
            recommendation: `Monitor this metric closely for continued unusual patterns.`,
            acknowledged: false,

        }
      })

      default: return 'bg-muted'
        setAnomalies((current) => {
          const existingIds = new Set((current || []).map(a => a.metricId))
          const uniqueNew = newAnomalies.filter(a => !existingIds.has(a.metricId))
          return [...uniqueNew, ...(current || [])]
        })

        newAnomalies.forEach((anomaly) => {
          if (
            (anomaly.severity === 'critical' && alertSettings?.notifyOnCritical) ||
            (anomaly.severity === 'warning' && alertSettings?.notifyOnWarning) ||
            (anomaly.severity === 'info' && alertSettings?.notifyOnInfo)
            A
            toast.error(`Anomaly Detected: ${anomaly.metricLabel}`, {
              description: anomaly.explanation,
            })
          }
        })
       
    }

    detectAnomalies()
          >
    return () => clearInterval(interval)
  }, [metrics, alertSettings, setAnomalies])


    setAnomalies((current) =>
      (current || []).map(a => a.id === anomalyId ? { ...a, acknowledged: true } : a)
    )
    toast.success('Anomaly acknowledged')
   

  const handleDismiss = (anomalyId: string) => {
    setAnomalies((current) => (current || []).filter(a => a.id !== anomalyId))
  }

  const unacknowledgedAnomalies = (anomalies || []).filter(a => !a.acknowledged)
  const acknowledgedAnomalies = (anomalies || []).filter(a => a.acknowledged)

  const getSeverityColor = (severity: string) => {
                    }
      case 'critical': return 'text-destructive'

      case 'info': return 'text-accent'
                    <Label className="text-sm
    }
   

  const getSeverityBg = (severity: string) => {
    switch (severity) {
                          notifyOnCritical: current?.notifyOnCritical |
      case 'warning': return 'bg-warning/10 border-warning/30'
      case 'info': return 'bg-accent/10 border-accent/30'
      default: return 'bg-muted'
     
   

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'spike': return <TrendUp size={20} weight="duotone" />
      case 'drop': return <TrendDown size={20} weight="duotone" />
      default: return <Warning size={20} weight="duotone" />
    }
  }

          
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Anomaly Detection</h2>
          <p className="text-sm text-muted-foreground">
            AI-powered monitoring for unusual metric patterns
          </p>
              
        <div className="flex items-center gap-2">
                      onCheckedChange={(checked) =
            <Badge variant="destructive" className="gap-2">
              <BellRinging size={16} weight="fill" />
              {unacknowledgedAnomalies.length}
                    
          )}
                 

            variant="outline"
                      Info anomalies
            className="gap-2"
          >
            <Gear size={16} weight="duotone" />
            Settings
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showSettings && (
                </div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}

            <Card className="p-4">
          </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Detection Settings</h3>
                  <Switch
                    checked={alertSettings?.enabled || false}
                    onCheckedChange={(checked) =>
                      setAlertSettings((current) => ({ ...current, enabled: checked }))
                    }
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm">
                      Sensitivity: {alertSettings?.sensitivity || 50}%
                    </Label>
                    <Slider
                      value={[alertSettings?.sensitivity || 50]}
                      onValueChange={(value) =>
                        setAlertSettings((current) => ({ ...current, sensitivity: value[0] }))
                      }
                      min={0}
                      max={100}
                      step={10}
                      className="mt-2"
                    />
                        

          ))}
                    <Label htmlFor="notify-critical" className="text-sm cursor-pointer">
                      Critical anomalies
                    </Label>
          <h3 className="te
                      id="notify-critical"
                      checked={alertSettings?.notifyOnCritical || false}
                      onCheckedChange={(checked) =>
                        setAlertSettings((current) => ({ ...current, notifyOnCritical: checked }))
                    <di
                    />
                        







                      checked={alertSettings?.notifyOnWarning || false}












                      checked={alertSettings?.notifyOnInfo || false}
























































































































