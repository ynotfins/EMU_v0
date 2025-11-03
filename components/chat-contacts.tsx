"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MessageCircle, Users, Phone } from "lucide-react";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { logger } from "@/lib/logger";

interface UserContact {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "supe" | "chaser";
  lastSeen?: number;
}

interface ChatContactsProps {
  currentUserId: string;
  onSelectContact: (contactId: string, contactName: string) => void;
  onSelectGroup?: (groupId: string, groupName: string) => void;
}

export function ChatContacts({
  currentUserId,
  onSelectContact,
  onSelectGroup,
}: ChatContactsProps) {
  const [contacts, setContacts] = useState<UserContact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch all users from Firestore
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        logger.debug("Fetching all users", { code: 'ChatContacts' });
        const usersRef = collection(db, "users");
        const usersSnap = await getDocs(usersRef);

        const allUsers: UserContact[] = [];
        usersSnap.forEach((doc) => {
          const data = doc.data();
          if (doc.id !== currentUserId) {
            // Don't show current user
            allUsers.push({
              id: doc.id,
              name: (() => {
                // Special handling for Lightning Joe
                if (data.email === "j.snap11@yahoo.com") {
                  return "⚡⚡⚡ Lightning Joe ⚡⚡⚡";
                }
                return data.nickname || data.name || data.email || "Unknown";
              })(),
              email: data.email,
              role: data.role || "chaser",
              lastSeen: data.location?.lastUpdated ? new Date(data.location.lastUpdated).getTime() : Date.now(),
            });
          }
        });

        // Sort by role (supes first, then chasers) and then by name
        allUsers.sort((a, b) => {
          const roleOrder = { super_admin: 0, admin: 1, supe: 2, chaser: 3 };
          const roleCompare = roleOrder[a.role] - roleOrder[b.role];
          if (roleCompare !== 0) return roleCompare;
          return a.name.localeCompare(b.name);
        });

        logger.info(`Loaded ${allUsers.length} contacts`, {
          code: 'ChatContacts',
          contactCount: allUsers.length,
        });
        setContacts(allUsers);
        setLoading(false);
      } catch (error) {
        logger.error("Error fetching contacts", error, { code: 'ChatContacts' });
        setLoading(false);
      }
    };

    fetchContacts();
  }, [currentUserId]);

  // Filter contacts based on search (using useMemo for derived state)
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) {
      return contacts;
    }

    const query = searchQuery.toLowerCase();
    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query) ||
        contact.role.toLowerCase().includes(query)
    );
  }, [searchQuery, contacts]);

  // Memoize filtered contacts by role for tab counts
  const supeContacts = useMemo(() => {
    return filteredContacts.filter(
      (c) =>
        c.role === "supe" ||
        c.role === "super_admin" ||
        c.role === "admin"
    );
  }, [filteredContacts]);

  const chaserContacts = useMemo(() => {
    return filteredContacts.filter((c) => c.role === "chaser");
  }, [filteredContacts]);

  // Memoize handler functions
  const handleContactClick = useCallback(
    (contactId: string, contactName: string) => {
      onSelectContact(contactId, contactName);
    },
    [onSelectContact]
  );

  // Memoize utility functions
  const getRoleBadgeColor = useCallback((role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-red-600 text-white";
      case "admin":
        return "bg-purple-500 text-white";
      case "supe":
        return "bg-blue-500 text-white";
      case "chaser":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  }, []);

  const getRoleIcon = useCallback((role: string) => {
    if (role === "supe" || role === "super_admin" || role === "admin") {
      return <Users className="h-4 w-4" />;
    }
    return <MessageCircle className="h-4 w-4" />;
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007AFF] mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-4 border-b">
        <Input
          type="search"
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Tabs */}
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

        {/* All Contacts */}
        <TabsContent value="all" className="flex-1 overflow-y-auto m-0">
          {filteredContacts.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No contacts found</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => handleContactClick(contact.id, contact.name)}
                  className="w-full p-4 hover:bg-gray-50 transition-colors flex items-center gap-3"
                >
                  {/* Avatar */}
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm">{contact.name}</p>
                      {getRoleIcon(contact.role)}
                      {/* Online indicator - show if last seen within 5 minutes */}
                      {contact.lastSeen && Date.now() - contact.lastSeen < 5 * 60 * 1000 && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-xs text-green-600">Active</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`text-xs ${getRoleBadgeColor(contact.role)}`}
                      >
                        {contact.role === "super_admin"
                          ? "SUPER ADMIN"
                          : contact.role.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  {/* Action Icon */}
                  <MessageCircle className="h-5 w-5 text-gray-400" />
                </button>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Supes Only */}
        <TabsContent value="supes" className="flex-1 overflow-y-auto m-0">
          <div className="divide-y">
            {supeContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => handleContactClick(contact.id, contact.name)}
                  className="w-full p-4 hover:bg-gray-50 transition-colors flex items-center gap-3"
                >
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm">{contact.name}</p>
                      <Users className="h-4 w-4" />
                    </div>
                    <Badge
                      className={`text-xs ${getRoleBadgeColor(contact.role)}`}
                    >
                      {contact.role === "super_admin"
                        ? "SUPER ADMIN"
                        : contact.role.toUpperCase()}
                    </Badge>
                  </div>
                  <MessageCircle className="h-5 w-5 text-gray-400" />
                </button>
              ))}
          </div>
        </TabsContent>

        {/* Chasers Only */}
        <TabsContent value="chasers" className="flex-1 overflow-y-auto m-0">
          <div className="divide-y">
            {chaserContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => handleContactClick(contact.id, contact.name)}
                  className="w-full p-4 hover:bg-gray-50 transition-colors flex items-center gap-3"
                >
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm">{contact.name}</p>
                      <MessageCircle className="h-4 w-4" />
                    </div>
                    <Badge className="text-xs bg-green-500 text-white">
                      CHASER
                    </Badge>
                  </div>
                  <MessageCircle className="h-5 w-5 text-gray-400" />
                </button>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
