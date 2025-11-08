import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Profile } from "@/types/extended-domain"

interface ProfileHeaderProps {
  profile: Profile
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getRoleBadgeVariant = (role: Profile["role"]): "default" | "secondary" | "destructive" | "outline" => {
    switch (role) {
      case "admin":
        return "destructive"
      case "supe":
        return "default"
      case "chaser":
        return "default"
      default:
        return "outline"
    }
  }

  return (
    <div className="bg-background p-6 border-b border-border">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
            {getInitials(profile.displayName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <h1 className="text-2xl font-bold text-foreground">{profile.displayName}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={getRoleBadgeVariant(profile.role)}>{profile.role.toUpperCase()}</Badge>
            {profile.agency && <Badge variant="outline">{profile.agency}</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
        </div>
      </div>
    </div>
  )
}
