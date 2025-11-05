"use client";

import { useState, useEffect, useMemo } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { MapPin, Users } from "lucide-react";
import { logger } from "@/lib/utils/logger";
import { GoogleMapLive } from "./google-map-live";

interface TeamMember {
  id: string;
  name: string;
  nickname: string;
  email?: string;
  role: string;
  location?: {
    lat: number;
    lng: number;
    lastUpdated: string;
  };
}

export function LiveTeamMap() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    logger.debug("Loading team locations", { code: 'LiveTeamMap' });

    const q = query(collection(db, "users"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const members = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || "Unknown",
          nickname: data.nickname || data.name || "Unknown",
          email: data.email || "",
          role: data.role || "chaser",
          location: data.location,
        };
      }) as TeamMember[];

      logger.info(`Loaded ${members.length} team members`, {
        code: 'LiveTeamMap',
        memberCount: members.length,
      });
      setTeamMembers(members);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const onlineMembers = useMemo(() => {
    return teamMembers.filter(
      (m) => m.location && m.location.lat && m.location.lng
    );
  }, [teamMembers]);

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Live Team Map</CardTitle>
              <CardDescription>Real-time locations of all users</CardDescription>
            </div>
          </div>

          <Badge className="bg-green-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span>{onlineMembers.length} Online</span>
            </div>
          </Badge>
        </div>
      </CardHeader>

"use client";

import { useState, useEffect, useMemo } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { MapPin, Users } from "lucide-react";
import { logger } from "@/lib/utils/logger";
import { GoogleMapLive } from "./google-map-live";

interface TeamMember {
  id: string;
  name: string;
  nickname: string;
  email?: string;
  role: string;
  location?: {
    lat: number;
    lng: number;
    lastUpdated: string;
  };
}

export function LiveTeamMap() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    logger.debug("Loading team locations", { code: 'LiveTeamMap' });

    const q = query(collection(db, "users"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const members = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || "Unknown",
          nickname: data.nickname || data.name || "Unknown",
          email: data.email || "",
          role: data.role || "chaser",
          location: data.location,
        };
      }) as TeamMember[];

      logger.info(`Loaded ${members.length} team members`, {
        code: 'LiveTeamMap',
        memberCount: members.length,
      });
      setTeamMembers(members);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const onlineMembers = useMemo(() => {
    return teamMembers.filter(
      (m) => m.location && m.location.lat && m.location.lng
    );
  }, [teamMembers]);

  // Convert team members with locations to incidents format for the map
  const mapIncidents = useMemo(() => {
    return onlineMembers.map((member) => ({
      id: member.id,
      type: member.role === 'supe' ? 'Team Member (Supe)' : 'Team Member',
      address: `${member.nickname}'s Location`,
      lat: member.location!.lat,
      lng: member.location!.lng,
      updatedAt: member.location!.lastUpdated || new Date().toISOString(),
      city: '',
      state: '',
    }));
  }, [onlineMembers]);

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Live Team Map</CardTitle>
              <CardDescription>Real-time locations of all users</CardDescription>
            </div>
          </div>

          <Badge className="bg-green-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span>{onlineMembers.length} Online</span>
            </div>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Map Container */}
        <div className="w-full h-80 rounded-xl overflow-hidden border-2 border-blue-100">
          {onlineMembers.length > 0 ? (
            <GoogleMapLive incidents={mapIncidents} className="w-full h-full" zoom={12} />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
              <div className="text-center space-y-3">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto" />
                <p className="text-lg font-semibold text-gray-900">
                  No team members online
                </p>
                <p className="text-sm text-gray-600">
                  Team members will appear here when they share their location
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Team List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Team Members</span>
            </div>
            <span className="text-gray-500">{teamMembers.length} total</span>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {loading ? (
              <div className="text-center py-4 text-gray-500">Loading...</div>
            ) : teamMembers.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No team members found
              </div>
            ) : (
              teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {member.nickname.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">
                        {(() => {
                          // Special handling for Lightning Joe
                          if (member.email === "j.snap11@yahoo.com") {
                            return "??? Lightning Joe ???";
                          }
                          return member.nickname;
                        })()}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {member.role}
                      </p>
                    </div>
                  </div>

                  {member.location ? (
                    <Badge className="bg-green-500">
                      <MapPin className="h-3 w-3 mr-1" />
                      Online
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-500">
                      Offline
                    </Badge>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

