import { Card } from "@/components/ui/card"
import { CheckCircle, FileText, Calendar } from "lucide-react"

interface StatsCardsProps {
  responded: number
  noted: number
  daysActive: number
}

export function StatsCards({ responded, noted, daysActive }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Card className="p-4 text-center">
        <CheckCircle className="h-6 w-6 text-primary mx-auto mb-2" />
        <p className="text-2xl font-bold text-foreground">{responded}</p>
        <p className="text-xs text-muted-foreground">Responded</p>
      </Card>
      <Card className="p-4 text-center">
        <FileText className="h-6 w-6 text-primary mx-auto mb-2" />
        <p className="text-2xl font-bold text-foreground">{noted}</p>
        <p className="text-xs text-muted-foreground">With Notes</p>
      </Card>
      <Card className="p-4 text-center">
        <Calendar className="h-6 w-6 text-destructive mx-auto mb-2" />
        <p className="text-2xl font-bold text-foreground">{daysActive}</p>
        <p className="text-xs text-muted-foreground">Days Active</p>
      </Card>
    </div>
  )
}
