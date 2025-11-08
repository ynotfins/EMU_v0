"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase"
import { MessageCircle, Users } from "lucide-react"
import { Badge } from "../ui/badge"
import { Input } from "../ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { logger } from "@/lib/utils/logger"

interface UserContact {
  id: string
  name: string
  email: string
  role: "super_admin" | "admin" | "supe" | "chaser"
  lastSeen?: number
}

interface ChatContactsProps {
  currentUserId: string
  onSelectContact: (contactId: string, contactName: string, contactRole: string) => void
  onSelectGroup?: (groupId: string, groupName: string) => void
}

export function ChatContacts({
  currentUserId,
  onSelectContact,
  onSelectGroup,
}: ChatContactsProps) {
  const [contacts, setContacts] = useState<UserContact[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        logger.debug("Fetching all users", { code: 'ChatContacts' })
        const usersRef = collection(db, "users")
        const usersSnap = await getDocs(usersRef)

        const allUsers: UserContact[] = []
        usersSnap.forEach((doc) => {
          const data = doc.data()
          if (doc.id !== currentUserId) {
            allUsers.push({
              id: doc.id,
              name: data.email === "j.snap11@yahoo.com" 
                ? "??? Lightning Joe ???"
                : data.nickname || data.name || data.email || "Unknown",
              email: data.email,
              role: data.role || "chaser",
              lastSeen: data.lastSeen || Date.now(),
            })
          }
        })

        allUsers.sort((a, b) => {
          const roleOrder = { super_admin: 0, admin: 1, supe: 2, chaser: 3 }
          const roleCompare = roleOrder[a.role] - roleOrder[b.role]
          if (roleCompare !== 0) return roleCompare
          return a.name.localeCompare(b.name)
        })

        logger.info(`Loaded ${allUsers.length} contacts`, {
          code: 'ChatContacts',
          contactCount: allUsers.length,
        })
        setContacts(allUsers)
        setLoading(false)
      } catch (error) {
        logger.error("Error fetching contacts", error, { code: 'ChatContacts' })
        setLoading(false)
      }
    }

    fetchContacts()
  }, [currentUserId])

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) {
      return contacts
    }

    const query = searchQuery.toLowerCase()
    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query) ||
        contact.role.toLowerCase().includes(query)
    )
  }, [searchQuery, contacts])

  const supeContacts = useMemo(() => {
    return filteredContacts.filter(
      (c) =>
        c.role === "supe" ||
        c.role === "super_admin" ||
        c.role === "admin"
    )
  }, [filteredContacts])

  const chaserContacts = useMemo(() => {
    return filteredContacts.filter((c) => c.role === "chaser")
  }, [filteredContacts])

  const handleContactClick = useCallback(
    (contactId: string, contactName: string, contactRole: string) => {
      onSelectContact(contactId, contactName, contactRole)
    },
    [onSelectContact]
  )

  const getRoleBadgeVariant = useCallback((role: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (role) {
      case "super_admin":
        return "destructive"
      case "admin":
        return "secondary"
      case "supe":
        return "default"
      case "chaser":
        return "default"
      default:
        return "outline"
    }
  }, [])

  const getRoleIcon = useCallback((role: string) => {
    if (role === "supe" || role === "super_admin" || role === "admin") {
      return <Users className="h-4 w-4" />
    }
    return <MessageCircle className="h-4 w-4" />
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading contacts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Input
          type="search"
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>

      <Tabs defaultValue="all" className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-3 rounded-none border-b">
          <TabsTrigger value="all">All ({filteredContacts.length})</TabsTrigger>
          <TabsTrigger value="supes">
            Supes ({supeContacts.length})
          </TabsTrigger>
          <TabsTrigger value="chasers">
            Chasers ({chaserContacts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="flex-1 overflow-y-auto m-0">
          {filteredContacts.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-16 w-16 text-muted mx-auto mb-4" />
              <p className="text-muted-foreground">No contacts found</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => handleContactClick(contact.id, contact.name, contact.role)}
                  className="w-full p-4 hover:bg-muted transition-colors flex items-center gap-3"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
                      {contact.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm">{contact.name}</p>
                      {getRoleIcon(contact.role)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getRoleBadgeVariant(contact.role)} className="text-xs">
                        {contact.role === "super_admin"
                          ? "SUPER ADMIN"
                          : contact.role.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <MessageCircle className="h-5 w-5 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="supes" className="flex-1 overflow-y-auto m-0">
          <div className="divide-y">
            {supeContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => handleContactClick(contact.id, contact.name, contact.role)}
                className="w-full p-4 hover:bg-muted transition-colors flex items-center gap-3"
              >
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {contact.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm">{contact.name}</p>
                    <Users className="h-4 w-4" />
                  </div>
                  <Badge variant={getRoleBadgeVariant(contact.role)} className="text-xs">
                    {contact.role === "super_admin"
                      ? "SUPER ADMIN"
                      : contact.role.toUpperCase()}
                  </Badge>
                </div>
                <MessageCircle className="h-5 w-5 text-muted-foreground" />
              </button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="chasers" className="flex-1 overflow-y-auto m-0">
          <div className="divide-y">
            {chaserContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => handleContactClick(contact.id, contact.name, contact.role)}
                className="w-full p-4 hover:bg-muted transition-colors flex items-center gap-3"
              >
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {contact.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm">{contact.name}</p>
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <Badge variant="default" className="text-xs">
                    CHASER
                  </Badge>
                </div>
                <MessageCircle className="h-5 w-5 text-muted-foreground" />
              </button>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
