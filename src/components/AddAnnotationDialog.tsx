import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Annotation, getCategoryColor, getCategoryIcon } from '@/lib/session-replay'
import { PlusCircle } from '@phosphor-icons/react'

interface AddAnnotationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (title: string, category: Annotation['category'], description?: string) => void
  currentTime: string
}

const categories: Array<{ value: Annotation['category']; label: string; description: string }> = [
  { value: 'important', label: 'Important', description: 'Critical moment or decision' },
  { value: 'question', label: 'Question', description: 'Needs clarification or discussion' },
  { value: 'issue', label: 'Issue', description: 'Problem or bug identified' },
  { value: 'highlight', label: 'Highlight', description: 'Notable or interesting moment' },
  { value: 'note', label: 'Note', description: 'General observation or comment' }
]

export function AddAnnotationDialog({ 
  open, 
  onOpenChange, 
  onAdd,
  currentTime 
}: AddAnnotationDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<Annotation['category']>('note')

  const handleAdd = () => {
    if (!title.trim()) return
    
    onAdd(title, category, description || undefined)
    setTitle('')
    setDescription('')
    setCategory('note')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Annotation</DialogTitle>
          <DialogDescription>
            Mark this moment at {currentTime} with a note or comment
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const color = getCategoryColor(cat.value)
                const icon = getCategoryIcon(cat.value)
                const isSelected = category === cat.value
                
                return (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-accent bg-accent/10'
                        : 'border-border/50 hover:border-accent/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{icon}</span>
                      <span className="font-semibold text-sm">{cat.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{cat.description}</p>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="annotation-title">Title *</Label>
            <Input
              id="annotation-title"
              placeholder="Brief description of this moment"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="annotation-description">Description (Optional)</Label>
            <Textarea
              id="annotation-description"
              placeholder="Add additional context or details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!title.trim()} className="gap-2">
            <PlusCircle size={18} weight="fill" />
            Add Annotation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
