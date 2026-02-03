import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Archive } from '@phosphor-icons/react'

export function TableauPulse() {
  return (
    <Card className="p-8">
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Archive size={32} weight="duotone" className="text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Feature Archived</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            The Tableau Pulse feature has been temporarily archived to prevent errors. 
            Please contact support if you need this feature.
          </p>
        </div>
        <Badge variant="outline" className="mt-2">Archived</Badge>
      </div>
    </Card>
  )
}
