import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BookmarkSimple, PlusCircle } from '@phosphor-icons/react'

interface AddBookmarkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (label: string, color: string) => void
  currentTime: string
}

const bookmarkColors = [
  { value: 'oklch(0.55 0.22 25)', label: 'Red' },
  { value: 'oklch(0.70 0.15 70)', label: 'Yellow' },
  { value: 'oklch(0.65 0.15 145)', label: 'Green' },
  { value: 'oklch(0.45 0.15 250)', label: 'Blue' },
  { value: 'oklch(0.60 0.18 290)', label: 'Purple' },
  { value: 'oklch(0.70 0.15 195)', label: 'Cyan' },
  { value: 'oklch(0.70 0.10 30)', label: 'Orange' },
  { value: 'oklch(0.65 0.18 340)', label: 'Pink' }
]

export function AddBookmarkDialog({ 
  open, 
  onOpenChange, 
  onAdd,
  currentTime 
}: AddBookmarkDialogProps) {
  const [label, setLabel] = useState('')
  const [color, setColor] = useState(bookmarkColors[0].value)

  const handleAdd = () => {
    if (!label.trim()) return
    
    onAdd(label, color)
    setLabel('')
    setColor(bookmarkColors[0].value)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Bookmark</DialogTitle>
          <DialogDescription>
            Create a quick bookmark at {currentTime}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="bookmark-label">Label *</Label>
            <Input
              id="bookmark-label"
              placeholder="e.g., Key Decision, Demo Start, Issue Found"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="grid grid-cols-8 gap-2">
              {bookmarkColors.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={`relative w-10 h-10 rounded-lg transition-all hover:scale-110 ${
                    color === c.value ? 'ring-2 ring-accent ring-offset-2 ring-offset-background scale-110' : ''
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                >
                  {color === c.value && (
                    <BookmarkSimple 
                      size={20} 
                      weight="fill" 
                      className="absolute inset-0 m-auto text-white"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!label.trim()} className="gap-2">
            <PlusCircle size={18} weight="fill" />
            Add Bookmark
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
