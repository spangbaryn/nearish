"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"

const MILESTONE_SUGGESTIONS = [
  { id: 'origin', label: 'Origin Story', emoji: '📖' },
  { id: 'opening', label: 'Grand Opening', emoji: '🎉' },
  { id: 'owner', label: 'New Owner', emoji: '🤝' },
  { id: 'covid', label: 'COVID Impact', emoji: '😷' },
  { id: 'location', label: 'New Location', emoji: '🏠' },
  { id: 'award', label: 'Award/Recognition', emoji: '🏆' },
  { id: 'renovation', label: 'Major Renovation', emoji: '🔨' },
  { id: 'milestone', label: 'Anniversary Milestone', emoji: '🎂' }
]

interface TimelineSuggestionsProps {
  onSuggestionClick?: (suggestion: { id: string; label: string; emoji: string }) => void;
  className?: string;
}

export function TimelineSuggestions({ onSuggestionClick, className }: TimelineSuggestionsProps) {
  return (
    <Card className={cn("p-4", className)}>
      <h3 className="font-medium text-muted-foreground mb-3">
        Here are some milestones you might add to your timeline
      </h3>
      <div className="flex flex-wrap gap-2">
        {MILESTONE_SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => onSuggestionClick?.(suggestion)}
            className="px-3 py-1.5 text-sm bg-muted rounded-full hover:bg-muted/80 transition-colors flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="mr-1">{suggestion.emoji}</span>
            {suggestion.label}
          </button>
        ))}
      </div>
    </Card>
  )
} 