import { useState } from 'react'
import { Toaster } from 'sonner'
import { AuthDialog } from '@/components/api-tester/AuthDialog'
import { RequestBuilder } from '@/components/api-tester/RequestBuilder'
import { ResponseViewer } from '@/components/api-tester/ResponseViewer'
import { RequestHistory } from '@/components/api-tester/RequestHistory'
import { EndpointTemplates } from '@/components/api-tester/EndpointTemplates'
import { useKV } from '@github/spark/hooks'
import { Key, Lightning } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export interface AuthConfig {
  serverUrl: string
  siteName: string
  username: string
  token: string
  tokenExpiry?: number
  siteId?: string
}

export interface ApiRequest {
  id: string
  method: string
  url: string
  headers: Record<string, string>
  body?: string
  timestamp: number
}

export interface ApiResponse {
  status: number
  statusText: string
  headers: Record<string, string>
  body: any
  duration: number
  size: number
}

function App() {
  const [authConfig, setAuthConfig] = useKV<AuthConfig | null>('tableau-auth-config', null)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [currentRequest, setCurrentRequest] = useState<ApiRequest | null>(null)
  const [currentResponse, setCurrentResponse] = useState<ApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [requestHistory, setRequestHistory] = useKV<ApiRequest[]>('tableau-request-history', [])
  const [activeTab, setActiveTab] = useState('builder')

  const handleAuth = (config: AuthConfig) => {
    setAuthConfig(config)
    setShowAuthDialog(false)
  }

  const handleSendRequest = async (request: ApiRequest) => {
    setIsLoading(true)
    setCurrentRequest(request)
    setCurrentResponse(null)
    setActiveTab('response')
    
    const startTime = performance.now()
    
    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body && request.method !== 'GET' ? request.body : undefined,
      })
      
      const duration = performance.now() - startTime
      const contentType = response.headers.get('content-type') || ''
      const responseText = await response.text()
      
      let parsedBody
      try {
        if (contentType.includes('application/json') || contentType.includes('text/xml')) {
          parsedBody = contentType.includes('json') ? JSON.parse(responseText) : responseText
        } else {
          parsedBody = responseText
        }
      } catch {
        parsedBody = responseText
      }

      const responseHeaders: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })

      const apiResponse: ApiResponse = {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        body: parsedBody,
        duration: Math.round(duration),
        size: new Blob([responseText]).size,
      }

      setCurrentResponse(apiResponse)
      
      setRequestHistory((prev) => [request, ...(prev || []).slice(0, 49)])
      
    } catch (error) {
      const duration = performance.now() - startTime
      setCurrentResponse({
        status: 0,
        statusText: 'Network Error',
        headers: {},
        body: { error: error instanceof Error ? error.message : 'Unknown error occurred' },
        duration: Math.round(duration),
        size: 0,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadFromHistory = (request: ApiRequest) => {
    setCurrentRequest(request)
    setActiveTab('builder')
  }

  const handleLoadTemplate = (template: Partial<ApiRequest>) => {
    setCurrentRequest({
      id: crypto.randomUUID(),
      method: template.method || 'GET',
      url: template.url || '',
      headers: template.headers || {},
      body: template.body,
      timestamp: Date.now(),
    })
    setActiveTab('builder')
  }

  const handleClearHistory = () => {
    setRequestHistory([])
  }

  const handleLogout = () => {
    setAuthConfig(null)
    setCurrentRequest(null)
    setCurrentResponse(null)
  }

  const isAuthenticated = authConfig && authConfig.token

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Lightning size={24} weight="duotone" className="text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Tableau REST API Tester</h1>
                <p className="text-xs text-muted-foreground">Validate and test Tableau API calls</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Badge variant="outline" className="gap-2 px-3 py-1 bg-success/10 border-success/30 text-success">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    Authenticated
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleLogout}
                    className="gap-2"
                  >
                    <Key size={16} weight="duotone" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setShowAuthDialog(true)}
                  className="gap-2"
                >
                  <Key size={16} weight="duotone" />
                  Authenticate
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <EndpointTemplates 
              onSelectTemplate={handleLoadTemplate}
              authConfig={authConfig || null}
            />
            <RequestHistory
              history={requestHistory || []}
              onLoadRequest={handleLoadFromHistory}
              onClearHistory={handleClearHistory}
            />
          </div>

          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="builder">Request Builder</TabsTrigger>
                <TabsTrigger value="response">Response</TabsTrigger>
              </TabsList>

              <TabsContent value="builder">
                <RequestBuilder
                  request={currentRequest}
                  authConfig={authConfig || null}
                  isLoading={isLoading}
                  onSendRequest={handleSendRequest}
                  onRequestChange={setCurrentRequest}
                />
              </TabsContent>

              <TabsContent value="response">
                <ResponseViewer
                  response={currentResponse}
                  isLoading={isLoading}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onAuth={handleAuth}
        currentAuth={authConfig || null}
      />

      <Toaster />
    </div>
  )
}

export default App
