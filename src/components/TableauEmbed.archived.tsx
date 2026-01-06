import { Card } from '@/components/ui/card'
import { Archive } from '@phosphor-icons/react'

export function TableauEmbed() {
  return (
    <Card className="p-12 flex flex-col items-center justify-center text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
        <Archive size={32} weight="duotone" className="text-muted-foreground" />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Feature Archived</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          The Tableau Embed feature has been temporarily archived to prevent errors. 
          Please contact support if you need this feature.
        </p>
      </div>
    </Card>
  )
}