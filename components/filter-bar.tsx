"use client"

import { useState } from "react"
import { Search, Bell, BellOff, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
    console.log("[v0] Custom distance set:", value)
    if (!isNaN(value) && value > 0) {
      onDistanceChange(value)
      setShowCustomDistance(false)
      setCustomDistance("")
    }
  }

  const handleCustomUpdates = () => {
    const value = Number.parseInt(customUpdates)
    console.log("[v0] Custom updates set:", value)
    if (!isNaN(value) && value > 0) {
      onMinUpdatesChange(value)
      setShowCustomUpdates(false)
      setCustomUpdates("")
    }
  }

  const isCustomDistance = distanceMi && !DISTANCE_OPTIONS.includes(distanceMi)
  const isCustomUpdates = minUpdates && !UPDATES_OPTIONS.includes(minUpdates)

  return (
    <div className="bg-white border-b border-[#E5E7EB] p-3 space-y-2">
      {/* Row 1: Distance badges (compact) */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs font-medium text-[#6B7280]">Distance:</span>
        {DISTANCE_OPTIONS.map((distance) => (
          <Badge
            key={distance}
            variant={distanceMi === distance ? "default" : "outline"}
            className={cn(
              "cursor-pointer text-xs px-2 py-0.5",
              distanceMi === distance ? "bg-[#007AFF] hover:bg-[#0051D5]" : "hover:bg-[#F2F2F7]",
            )}
            onClick={() => onDistanceChange(distance)}
          >
            {distance} mi
          </Badge>
        ))}
        {isCustomDistance && (
          <Badge variant="default" className="bg-[#007AFF] text-xs px-2 py-0.5">
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
            className="cursor-pointer hover:bg-[#F2F2F7] text-xs px-2 py-0.5 border-[#34C759] text-[#34C759]"
            onClick={() => setShowCustomDistance(true)}
          >
            Custom
          </Badge>
        )}
      </div>

      {/* Row 2: Search + Distance + Type badges (compact on mobile) */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Search Button FIRST (green oval) */}
        {!searchExpanded && (
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-[#F2F2F7] text-xs px-2 py-0.5 border-[#34C759] text-[#34C759]"
            onClick={() => setSearchExpanded(true)}
          >
            Search
          </Badge>
        )}

        {/* Distance Button SECOND */}
        <Badge
          variant="outline"
          className={cn(
            "cursor-pointer text-xs px-2 py-0.5 flex items-center gap-0.5",
            distanceMi ? "bg-[#007AFF] text-white hover:bg-[#0051D5]" : "hover:bg-[#F2F2F7]"
          )}
          onClick={() => onDistanceChange(distanceMi ? undefined : 50)}
        >
          <ChevronDown className="h-3 w-3" />
          Dist
        </Badge>

        {/* THEN Type badges (more compact) */}
        <Badge
          variant={types.length === 0 ? "default" : "outline"}
          className={cn(
            "cursor-pointer text-xs px-1.5 py-0.5",
            types.length === 0 ? "bg-[#007AFF] hover:bg-[#0051D5]" : "hover:bg-[#F2F2F7]",
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
              types.includes(type) ? "bg-[#007AFF] hover:bg-[#0051D5]" : "hover:bg-[#F2F2F7]",
            )}
            onClick={() => toggleType(type)}
          >
            {type}
          </Badge>
        ))}
      </div>

      {/* Expanded Search Row (appears when Search clicked) */}
      {searchExpanded && (
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-[#6B7280]" />
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

      {/* Row 3: Updates badges (no label to save space) */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs font-medium text-[#6B7280]">Updates:</span>
        {UPDATES_OPTIONS.map((updates) => (
          <Badge
            key={updates}
            variant={minUpdates === updates ? "default" : "outline"}
            className={cn(
              "cursor-pointer text-xs px-2 py-0.5",
              minUpdates === updates ? "bg-[#007AFF] hover:bg-[#0051D5]" : "hover:bg-[#F2F2F7]",
            )}
            onClick={() => onMinUpdatesChange(updates)}
          >
            {updates}
          </Badge>
        ))}
        {isCustomUpdates && (
          <Badge variant="default" className="bg-[#007AFF] text-xs px-2 py-0.5">
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
            className="cursor-pointer hover:bg-[#F2F2F7] text-xs px-2 py-0.5"
            onClick={() => setShowCustomUpdates(true)}
          >
            Custom
          </Badge>
        )}
      </div>
    </div>
  )
}
