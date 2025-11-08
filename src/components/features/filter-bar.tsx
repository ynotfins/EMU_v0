"use client"

import { useState } from "react"
import { Search, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface FilterBarProps {
  distanceMi?: number
  onDistanceChange: (distance?: number) => void
  types: string[]
  onTypesChange: (types: string[]) => void
  keyword: string
  onKeywordChange: (keyword: string) => void
  highAlertEnabled: boolean
  onHighAlertChange: (enabled: boolean) => void
  highAlertSound: string
  onHighAlertSoundChange: (soundId: string) => void
  muted: boolean
  onMutedChange: (muted: boolean) => void
  minUpdates?: number
  onMinUpdatesChange: (minUpdates?: number) => void
}

const DISTANCE_OPTIONS = [5, 10, 25, 50]
const TYPE_OPTIONS = ["All Hands", "Fire Damage", "Smoke Condition", "Working Fire"]
const UPDATES_OPTIONS = [1, 3]

export function FilterBar({
  distanceMi,
  onDistanceChange,
  types,
  onTypesChange,
  keyword,
  onKeywordChange,
  highAlertEnabled,
  onHighAlertChange,
  highAlertSound,
  onHighAlertSoundChange,
  muted,
  onMutedChange,
  minUpdates,
  onMinUpdatesChange,
}: FilterBarProps) {
  const [customDistance, setCustomDistance] = useState("")
  const [showCustomDistance, setShowCustomDistance] = useState(false)
  const [customUpdates, setCustomUpdates] = useState("")
  const [showCustomUpdates, setShowCustomUpdates] = useState(false)
  const [searchExpanded, setSearchExpanded] = useState(false)

  const toggleType = (type: string) => {
    if (types.includes(type)) {
      onTypesChange(types.filter((t) => t !== type))
    } else {
      onTypesChange([...types, type])
    }
  }

  const handleCustomDistance = () => {
    const value = Number.parseInt(customDistance)
    if (!isNaN(value) && value > 0) {
      onDistanceChange(value)
      setShowCustomDistance(false)
      setCustomDistance("")
    }
  }

  const handleCustomUpdates = () => {
    const value = Number.parseInt(customUpdates)
    if (!isNaN(value) && value > 0) {
      onMinUpdatesChange(value)
      setShowCustomUpdates(false)
      setCustomUpdates("")
    }
  }

  const isCustomDistance = distanceMi && !DISTANCE_OPTIONS.includes(distanceMi)
  const isCustomUpdates = minUpdates && !UPDATES_OPTIONS.includes(minUpdates)

  return (
    <div className="bg-background border-b border-border p-3 space-y-2">
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs font-medium text-muted-foreground">Distance:</span>
        {DISTANCE_OPTIONS.map((distance) => (
          <Badge
            key={distance}
            variant={distanceMi === distance ? "default" : "outline"}
            className={cn(
              "cursor-pointer text-xs px-2 py-0.5",
              distanceMi === distance ? "bg-primary hover:bg-primary/90" : "hover:bg-muted",
            )}
            onClick={() => onDistanceChange(distance)}
          >
            {distance} mi
          </Badge>
        ))}
        {isCustomDistance && (
          <Badge variant="default" className="bg-primary text-xs px-2 py-0.5">
            {distanceMi} mi
          </Badge>
        )}
        {showCustomDistance ? (
          <div className="flex items-center gap-1">
            <Input
              type="number"
              placeholder="Miles"
              value={customDistance}
              onChange={(e) => setCustomDistance(e.target.value)}
              className="w-16 h-6 text-xs"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCustomDistance()
                }
              }}
            />
            <Button size="sm" onClick={handleCustomDistance} className="h-6 text-xs px-2">
              Set
            </Button>
          </div>
        ) : (
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-muted text-xs px-2 py-0.5 border-primary text-primary"
            onClick={() => setShowCustomDistance(true)}
          >
            Custom
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {!searchExpanded && (
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-muted text-xs px-2 py-0.5 border-primary text-primary"
            onClick={() => setSearchExpanded(true)}
          >
            Search
          </Badge>
        )}

        <Badge
          variant="outline"
          className={cn(
            "cursor-pointer text-xs px-2 py-0.5 flex items-center gap-0.5",
            distanceMi ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-muted"
          )}
          onClick={() => onDistanceChange(distanceMi ? undefined : 50)}
        >
          <ChevronDown className="h-3 w-3" />
          Dist
        </Badge>

        <Badge
          variant={types.length === 0 ? "default" : "outline"}
          className={cn(
            "cursor-pointer text-xs px-1.5 py-0.5",
            types.length === 0 ? "bg-primary hover:bg-primary/90" : "hover:bg-muted",
          )}
          onClick={() => onTypesChange([])}
        >
          All
        </Badge>
        {TYPE_OPTIONS.map((type) => (
          <Badge
            key={type}
            variant={types.includes(type) ? "default" : "outline"}
            className={cn(
              "cursor-pointer text-xs px-1.5 py-0.5 whitespace-nowrap",
              types.includes(type) ? "bg-primary hover:bg-primary/90" : "hover:bg-muted",
            )}
            onClick={() => toggleType(type)}
          >
            {type}
          </Badge>
        ))}
      </div>

      {searchExpanded && (
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Search by keyword..."
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            onBlur={() => {
              if (!keyword) setSearchExpanded(false)
            }}
            className="pl-8 h-7 text-xs"
            autoFocus
          />
        </div>
      )}

      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs font-medium text-muted-foreground">Updates:</span>
        {UPDATES_OPTIONS.map((updates) => (
          <Badge
            key={updates}
            variant={minUpdates === updates ? "default" : "outline"}
            className={cn(
              "cursor-pointer text-xs px-2 py-0.5",
              minUpdates === updates ? "bg-primary hover:bg-primary/90" : "hover:bg-muted",
            )}
            onClick={() => onMinUpdatesChange(updates)}
          >
            {updates}
          </Badge>
        ))}
        {isCustomUpdates && (
          <Badge variant="default" className="bg-primary text-xs px-2 py-0.5">
            {minUpdates}
          </Badge>
        )}
        {showCustomUpdates ? (
          <div className="flex items-center gap-1">
            <Input
              type="number"
              placeholder="Updates"
              value={customUpdates}
              onChange={(e) => setCustomUpdates(e.target.value)}
              className="w-16 h-6 text-xs"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCustomUpdates()
                }
              }}
            />
            <Button size="sm" onClick={handleCustomUpdates} className="h-6 text-xs px-2">
              Set
            </Button>
          </div>
        ) : (
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-muted text-xs px-2 py-0.5"
            onClick={() => setShowCustomUpdates(true)}
          >
            Custom
          </Badge>
        )}
      </div>
    </div>
  )
}
