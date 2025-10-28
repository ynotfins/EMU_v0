"use client"

import { useState } from "react"
import { Search, Bell, BellOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { mockHighAlertSounds } from "@/lib/mock/sounds"

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
    <div className="bg-white border-b border-[#E5E7EB] p-4 space-y-3">
      {/* Distance Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-[#6B7280]">Distance:</span>
        {DISTANCE_OPTIONS.map((distance) => (
          <Badge
            key={distance}
            variant={distanceMi === distance ? "default" : "outline"}
            className={cn(
              "cursor-pointer",
              distanceMi === distance ? "bg-[#007AFF] hover:bg-[#0051D5]" : "hover:bg-[#F2F2F7]",
            )}
            onClick={() => onDistanceChange(distance)}
          >
            {distance} mi
          </Badge>
        ))}
        {isCustomDistance && (
          <Badge variant="default" className="bg-[#007AFF]">
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
              className="w-20 h-7 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCustomDistance()
                }
              }}
            />
            <Button size="sm" onClick={handleCustomDistance} className="h-7">
              Set
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowCustomDistance(false)
                setCustomDistance("")
              }}
              className="h-7 text-xs"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-[#F2F2F7]"
            onClick={() => setShowCustomDistance(true)}
          >
            Custom
          </Badge>
        )}
        {distanceMi && (
          <Button variant="ghost" size="sm" onClick={() => onDistanceChange(undefined)} className="h-7 text-xs">
            Clear
          </Button>
        )}
      </div>

      {/* Type Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-[#6B7280]">Type:</span>
        <Badge
          variant={types.length === 0 ? "default" : "outline"}
          className={cn(
            "cursor-pointer",
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
              "cursor-pointer",
              types.includes(type) ? "bg-[#007AFF] hover:bg-[#0051D5]" : "hover:bg-[#F2F2F7]",
            )}
            onClick={() => toggleType(type)}
          >
            {type}
          </Badge>
        ))}
      </div>

      {/* Updates Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-[#6B7280]">Updates:</span>
        {UPDATES_OPTIONS.map((updates) => (
          <Badge
            key={updates}
            variant={minUpdates === updates ? "default" : "outline"}
            className={cn(
              "cursor-pointer",
              minUpdates === updates ? "bg-[#007AFF] hover:bg-[#0051D5]" : "hover:bg-[#F2F2F7]",
            )}
            onClick={() => onMinUpdatesChange(updates)}
          >
            {updates}
          </Badge>
        ))}
        {isCustomUpdates && (
          <Badge variant="default" className="bg-[#007AFF]">
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
              className="w-20 h-7 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCustomUpdates()
                }
              }}
            />
            <Button size="sm" onClick={handleCustomUpdates} className="h-7">
              Set
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowCustomUpdates(false)
                setCustomUpdates("")
              }}
              className="h-7 text-xs"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-[#F2F2F7]"
            onClick={() => setShowCustomUpdates(true)}
          >
            Custom
          </Badge>
        )}
        {minUpdates && (
          <Button variant="ghost" size="sm" onClick={() => onMinUpdatesChange(undefined)} className="h-7 text-xs">
            Clear
          </Button>
        )}
      </div>

      {/* Keyword Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
        <Input
          placeholder="Search by keyword..."
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* High Alert Toggle */}
      <div className="flex items-center justify-between p-3 bg-[#F2F2F7] rounded-lg">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-[#FF3B30]" />
          <span className="text-sm font-medium">High Alert</span>
          <Switch checked={highAlertEnabled} onCheckedChange={onHighAlertChange} />
        </div>
        {highAlertEnabled && (
          <div className="flex items-center gap-2">
            <Select value={highAlertSound} onValueChange={onHighAlertSoundChange}>
              <SelectTrigger className="w-40 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mockHighAlertSounds.map((sound) => (
                  <SelectItem key={sound.id} value={sound.id}>
                    {sound.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" onClick={() => onMutedChange(!muted)} className="h-8 w-8 p-0">
              {muted ? <BellOff className="h-4 w-4 text-[#6B7280]" /> : <Bell className="h-4 w-4 text-[#007AFF]" />}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
