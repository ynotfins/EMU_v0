import { Clock, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface UpdateRow {
  ts: string
  distanceMi?: number
  state: string
  county: string
  city: string
  address: string
  type: string
  message: string
  showIncidentId?: boolean
  incidentNumber?: number
}

interface UpdatesListProps {
  rows: UpdateRow[]
}

export function UpdatesList({ rows }: UpdatesListProps) {
  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-3">
      {rows.map((row, index) => (
        <div key={index} className="border-l-2 border-[#007AFF] pl-4 py-2 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-xs text-[#6B7280]">
              <Clock className="h-3 w-3" />
              <span>{formatTime(row.ts)}</span>
            </div>
            {row.distanceMi !== undefined && (
              <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                <MapPin className="h-3 w-3" />
                <span>{row.distanceMi.toFixed(1)} mi</span>
              </div>
            )}
            {row.showIncidentId && row.incidentNumber && (
              <Badge className="bg-[#007AFF] hover:bg-[#0051D5] text-xs">NFA-{row.incidentNumber}</Badge>
            )}
            <Badge variant="outline" className="text-[#FF3B30] border-[#FF3B30] text-xs">
              {row.type}
            </Badge>
          </div>
          <p className="text-sm font-medium text-foreground">
            {row.address}, {row.city}
          </p>
          <p className="text-sm text-[#6B7280]">
            {row.county}, {row.state}
          </p>
          <p className="text-sm text-foreground">{row.message}</p>
        </div>
      ))}
    </div>
  )
}
