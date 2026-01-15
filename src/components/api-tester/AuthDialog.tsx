import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthConfig } from '@/App'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAuth: (config: AuthConfig) => void
  currentAuth: AuthConfig | null
}

export function AuthDialog({ open, onOpenChange, onAuth, currentAuth }: AuthDialogProps) {
  const [serverUrl, setServerUrl] = useState(currentAuth?.serverUrl || '')
  const [siteName, setSiteName] = useState(currentAuth?.siteName || '')
  const [username, setUsername] = useState(currentAuth?.username || '')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async () => {
    if (!serverUrl || !username || !password) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)

    try {
      const apiVersion = '3.21'
      const signInUrl = `${serverUrl}/api/${apiVersion}/auth/signin`
      
      const requestBody = {
        credentials: {
          name: username,
          password: password,
          site: {
            contentUrl: siteName || ''
          }
        }
      }

      const response = await fetch(signInUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Authentication failed: ${response.status} ${response.statusText}\n${errorText}`)
      }

      const data = await response.json()
      const token = data.credentials?.token
      const siteId = data.credentials?.site?.id

      if (!token) {
        throw new Error('No authentication token received')
      }

      const authConfig: AuthConfig = {
        serverUrl,
        siteName,
        username,
        token,
        siteId,
        tokenExpiry: Date.now() + (240 * 60 * 1000)
      }

      onAuth(authConfig)
      toast.success('Successfully authenticated with Tableau Server')
      setPassword('')
      
    } catch (error) {
      console.error('Authentication error:', error)
      toast.error(error instanceof Error ? error.message : 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tableau Authentication</DialogTitle>
          <DialogDescription>
            Sign in to your Tableau Server or Tableau Online instance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="server-url">Server URL *</Label>
            <Input
              id="server-url"
              placeholder="https://your-server.tableau.com"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="site-name">Site Name</Label>
            <Input
              id="site-name"
              placeholder="Leave empty for default site"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              placeholder="your-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
