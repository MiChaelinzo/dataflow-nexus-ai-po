import { Component, ReactNode, ErrorInfo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Warning, ArrowClockwise } from '@phosphor-icons/react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class SafeErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SafeErrorBoundary caught error:', error, errorInfo)
    
    this.setState({
      errorInfo
    })

    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const is429Error = this.state.error?.message?.includes('429') || 
                         this.state.error?.message?.toLowerCase().includes('rate limit')

      return (
        <Card className="p-6 m-4">
          <Alert variant={is429Error ? "default" : "destructive"} className="mb-4">
            <Warning size={20} />
            <AlertTitle>
              {is429Error ? 'Rate Limit Reached' : 'Component Error'}
            </AlertTitle>
            <AlertDescription>
              {is429Error ? (
                <>
                  This component has temporarily reached its API rate limit. 
                  Please wait a moment and try refreshing.
                </>
              ) : (
                <>
                  An unexpected error occurred in this component. 
                  You can try refreshing or continue using other parts of the application.
                </>
              )}
            </AlertDescription>
          </Alert>

          {!is429Error && this.state.error && (
            <div className="bg-muted/50 rounded-lg p-4 mb-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                Error Details:
              </p>
              <pre className="text-xs text-destructive overflow-auto max-h-32">
                {this.state.error.message}
              </pre>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={this.handleReset} className="gap-2">
              <ArrowClockwise size={16} />
              Try Again
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </div>
        </Card>
      )
    }

    return this.props.children
  }
}
