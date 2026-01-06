import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { motion } from 'framer-motion'
import { 
  Key, 
  Link, 
  Check, 
  Eye, 
  EyeSlash, 
  Info,
  CheckCircle,
  Warning,
  Trash
} from '@phosphor-icons/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from 'sonner'

interface TableauConfig {
  serverUrl: string
  siteName: string
  username: string
  password: string
  personalAccessTokenName: string
  personalAccessTokenSecret: string
  dashboardUrls: string[]
}

interface DashboardEntry {
  id: string
  url: string
  name: string
}

export function TableauSettings() {
  const [config, setConfig] = useKV<TableauConfig>('tableau-config', {
    serverUrl: '',
    siteName: '',
    username: '',
    password: '',
    personalAccessTokenName: '',
    personalAccessTokenSecret: '',
    dashboardUrls: []
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showToken, setShowToken] = useState(false)
  const [dashboards, setDashboards] = useKV<DashboardEntry[]>('tableau-dashboards', [])
  const [newDashboardUrl, setNewDashboardUrl] = useState('')
  const [newDashboardName, setNewDashboardName] = useState('')
  const [isTestingConnection, setIsTestingConnection] = useState(false)

  const handleSaveConfig = () => {
    setConfig((current) => {
      if (!current) {
        return {
          serverUrl: '',
          siteName: '',
          username: '',
          password: '',
          personalAccessTokenName: '',
          personalAccessTokenSecret: '',
          dashboardUrls: []
        }
      }
      return {
        ...current,
        serverUrl: current.serverUrl.trim(),
        siteName: current.siteName.trim(),
        username: current.username.trim(),
        password: current.password.trim(),
        personalAccessTokenName: current.personalAccessTokenName.trim(),
        personalAccessTokenSecret: current.personalAccessTokenSecret.trim()
      }
    })
    
    toast.success('Configuration saved', {
      description: 'Your Tableau settings have been saved successfully.'
    })
  }

  const handleTestConnection = async () => {
    setIsTestingConnection(true)
    
    setTimeout(() => {
      setIsTestingConnection(false)
      if (config && config.serverUrl && (config.username || config.personalAccessTokenName)) {
        toast.success('Connection test simulated', {
          description: 'Configuration appears valid. Use real API credentials for actual testing.'
        })
      } else {
        toast.error('Missing credentials', {
          description: 'Please provide server URL and authentication credentials.'
        })
      }
    }, 1500)
  }

  const handleAddDashboard = () => {
    if (!newDashboardUrl.trim()) {
      toast.error('Dashboard URL required', {
        description: 'Please enter a valid Tableau dashboard URL.'
      })
      return
    }

    const newDashboard: DashboardEntry = {
      id: `dashboard-${Date.now()}`,
      url: newDashboardUrl.trim(),
      name: newDashboardName.trim() || `Dashboard ${(dashboards || []).length + 1}`
    }

    setDashboards((current) => [...(current || []), newDashboard])
    setNewDashboardUrl('')
    setNewDashboardName('')
    
    toast.success('Dashboard added', {
      description: `${newDashboard.name} has been added to your configuration.`
    })
  }

  const handleRemoveDashboard = (id: string) => {
    setDashboards((current) => (current || []).filter(d => d.id !== id))
    toast.success('Dashboard removed')
  }

  const handleClearAll = () => {
    setConfig({
      serverUrl: '',
      siteName: '',
      username: '',
      password: '',
      personalAccessTokenName: '',
      personalAccessTokenSecret: '',
      dashboardUrls: []
    })
    setDashboards([])
    toast.success('All settings cleared')
  }

  const isConfigured = config && config.serverUrl && (config.username || config.personalAccessTokenName)

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Tableau Integration Settings</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Configure your Tableau Server or Tableau Cloud credentials for demo purposes
            </p>
          </div>
          <Badge variant={isConfigured ? "default" : "outline"} className="gap-2">
            {isConfigured ? (
              <>
                <CheckCircle size={14} weight="fill" />
                Configured
              </>
            ) : (
              <>
                <Warning size={14} weight="fill" />
                Not Configured
              </>
            )}
          </Badge>
        </div>
      </motion.div>

      <Alert>
        <Info size={18} weight="duotone" />
        <AlertTitle>Demo Configuration</AlertTitle>
        <AlertDescription>
          This interface allows you to manually configure Tableau integration for demonstration purposes. 
          Your credentials are stored locally in your browser and never transmitted to external servers.
          For production use, implement proper OAuth 2.0 authentication with Connected Apps.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key size={20} weight="duotone" />
            Server Configuration
          </CardTitle>
          <CardDescription>
            Connect to your Tableau Server or Tableau Cloud instance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="server-url">Server URL</Label>
            <Input
              id="server-url"
              placeholder="https://your-server.tableau.com or https://10ay.online.tableau.com"
              value={config?.serverUrl || ''}
              onChange={(e) => setConfig((current) => ({
                ...(current || { serverUrl: '', siteName: '', username: '', password: '', personalAccessTokenName: '', personalAccessTokenSecret: '', dashboardUrls: [] }),
                serverUrl: e.target.value
              }))}
            />
            <p className="text-xs text-muted-foreground">
              For Tableau Cloud: https://[pod].online.tableau.com
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="site-name">Site Name (Optional)</Label>
            <Input
              id="site-name"
              placeholder="Leave empty for default site"
              value={config?.siteName || ''}
              onChange={(e) => setConfig((current) => ({
                ...(current || { serverUrl: '', siteName: '', username: '', password: '', personalAccessTokenName: '', personalAccessTokenSecret: '', dashboardUrls: [] }),
                siteName: e.target.value
              }))}
            />
            <p className="text-xs text-muted-foreground">
              The content URL of your site (not the display name)
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Authentication Method 1: Username & Password</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="your-username"
                  value={config?.username || ''}
                  onChange={(e) => setConfig((current) => ({
                    ...(current || { serverUrl: '', siteName: '', username: '', password: '', personalAccessTokenName: '', personalAccessTokenSecret: '', dashboardUrls: [] }),
                    username: e.target.value
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={config?.password || ''}
                    onChange={(e) => setConfig((current) => ({
                      ...(current || { serverUrl: '', siteName: '', username: '', password: '', personalAccessTokenName: '', personalAccessTokenSecret: '', dashboardUrls: [] }),
                      password: e.target.value
                    }))}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlash size={16} weight="duotone" />
                    ) : (
                      <Eye size={16} weight="duotone" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">OR</span>
            <Separator className="flex-1" />
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Authentication Method 2: Personal Access Token (Recommended)</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="token-name">Token Name</Label>
                <Input
                  id="token-name"
                  placeholder="Token name"
                  value={config?.personalAccessTokenName || ''}
                  onChange={(e) => setConfig((current) => ({
                    ...(current || { serverUrl: '', siteName: '', username: '', password: '', personalAccessTokenName: '', personalAccessTokenSecret: '', dashboardUrls: [] }),
                    personalAccessTokenName: e.target.value
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="token-secret">Token Secret</Label>
                <div className="relative">
                  <Input
                    id="token-secret"
                    type={showToken ? "text" : "password"}
                    placeholder="••••••••••••••••"
                    value={config?.personalAccessTokenSecret || ''}
                    onChange={(e) => setConfig((current) => ({
                      ...(current || { serverUrl: '', siteName: '', username: '', password: '', personalAccessTokenName: '', personalAccessTokenSecret: '', dashboardUrls: [] }),
                      personalAccessTokenSecret: e.target.value
                    }))}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowToken(!showToken)}
                  >
                    {showToken ? (
                      <EyeSlash size={16} weight="duotone" />
                    ) : (
                      <Eye size={16} weight="duotone" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Generate a Personal Access Token from your Tableau Server user settings. 
              This is more secure than username/password authentication.
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSaveConfig} className="gap-2">
              <Check size={16} weight="bold" />
              Save Configuration
            </Button>
            <Button 
              onClick={handleTestConnection} 
              variant="outline" 
              className="gap-2"
              disabled={isTestingConnection}
            >
              {isTestingConnection ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <CheckCircle size={16} weight="duotone" />
                  Test Connection
                </>
              )}
            </Button>
            <Button 
              onClick={handleClearAll} 
              variant="destructive" 
              className="gap-2"
            >
              <Trash size={16} weight="duotone" />
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link size={20} weight="duotone" />
            Dashboard URLs
          </CardTitle>
          <CardDescription>
            Add Tableau dashboard URLs for embedding and integration demos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dashboard-name">Dashboard Name</Label>
                <Input
                  id="dashboard-name"
                  placeholder="Sales Dashboard"
                  value={newDashboardName}
                  onChange={(e) => setNewDashboardName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dashboard-url">Dashboard URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="dashboard-url"
                    placeholder="https://public.tableau.com/views/..."
                    value={newDashboardUrl}
                    onChange={(e) => setNewDashboardUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddDashboard()
                      }
                    }}
                  />
                  <Button onClick={handleAddDashboard} className="gap-2 whitespace-nowrap">
                    <Check size={16} weight="bold" />
                    Add
                  </Button>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Add dashboard URLs from Tableau Public, Tableau Server, or Tableau Cloud. 
              These can be used for embedding or API demonstrations.
            </p>
          </div>

          {(dashboards || []).length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Configured Dashboards ({(dashboards || []).length})</h4>
                <div className="space-y-2">
                  {(dashboards || []).map((dashboard, index) => (
                    <motion.div
                      key={dashboard.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{dashboard.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{dashboard.url}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDashboard(dashboard.id)}
                        className="ml-2 text-destructive hover:text-destructive"
                      >
                        <Trash size={16} weight="duotone" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          )}

          {(dashboards || []).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No dashboards configured yet</p>
              <p className="text-xs mt-1">Add your first dashboard URL above</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-accent/50 bg-accent/5">
        <CardHeader>
          <CardTitle className="text-base">Integration Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold mb-2">Tableau Cloud URL Format:</h4>
            <code className="text-xs bg-muted p-2 rounded block overflow-x-auto">
              https://10ay.online.tableau.com/#/site/sitename/views/WorkbookName/DashboardName
            </code>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold mb-2">Tableau Public URL Format:</h4>
            <code className="text-xs bg-muted p-2 rounded block overflow-x-auto">
              https://public.tableau.com/views/WorkbookName/DashboardName
            </code>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold mb-2">Tableau Server URL Format:</h4>
            <code className="text-xs bg-muted p-2 rounded block overflow-x-auto">
              https://your-server.com/#/site/sitename/views/WorkbookName/DashboardName
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
