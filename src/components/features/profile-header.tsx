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

  const getRoleBadgeColor = (role: Profile["role"]) => {
    switch (role) {
      case "admin":
        return "bg-[#FF3B30] hover:bg-[#FF3B30]"
      case "supe":
        return "bg-[#007AFF] hover:bg-[#007AFF]"
      case "chaser":
        return "bg-[#34C759] hover:bg-[#34C759]"
    }
  }

  return (
    <div className="bg-white p-6 border-b border-[#E5E7EB]">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="bg-[#007AFF] text-white text-2xl font-semibold">
            {getInitials(profile.displayName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <h1 className="text-2xl font-bold text-foreground">{profile.displayName}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={getRoleBadgeColor(profile.role)}>{profile.role.toUpperCase()}</Badge>
            {profile.agency && <Badge variant="outline">{profile.agency}</Badge>}
          </div>
          <p className="text-sm text-[#6B7280]">{profile.email}</p>
        </div>
      </div>
    </div>
  )
}
