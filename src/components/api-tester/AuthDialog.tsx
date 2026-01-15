import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/butto
import { toast } from 'sonner'

  open: boolean
  onAuth: (config: AuthConfig)
}

  const [siteName, setSiteN
  const [passwo

    if (!serverUrl || !username || !pa
      return


      const apiVersion = '3.21'
      
  const [siteName, setSiteName] = useState(currentAuth?.siteName || '')
  const [username, setUsername] = useState(currentAuth?.username || '')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async () => {
    if (!serverUrl || !username || !password) {
      toast.error('Please fill in all required fields')
      })
    }

    setIsLoading(true)

    try {
        
      const signInUrl = `${serverUrl}/api/${apiVersion}/auth/signin`
      
      const requestBody = {
      
        throw new Error('

        serverUrl
        username,
        sit
      }
      }

    } catch (error) {
      toast.error(error
      setIsLoading
  }
  return (
      <Dia
          <DialogTitle>Tableau Authentica
        

        <div className="s
            <Label htmlFor="server-url">Server 
              id="server-url"
        
             
          </div>
          <div className="space-y-2">
            <Inpu
              placeholder="Leave empty for default site"
         
        

       

              value={username}
      
          </div>
          <div className="space-y-2">
      
              type=
              value={password}
       

        </div>
        <DialogFoo
            varia
            disab
            Ca
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



          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >

          </Button>

            onClick={handleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...

            ) : (

            )}
          </Button>


    </Dialog>

}
