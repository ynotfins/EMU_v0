import type { Profile } from "@/types/domain"

export const mockProfiles: Record<string, Profile> = {
  "user-001": {
    uid: "user-001",
    email: "mike.johnson@maxadjust.com",
    displayName: "Mike Johnson",
    role: "chaser",
    agency: "Max Adjust",
    stats: {
      responded: 47,
      noted: 32,
      daysActive: 89,
    },
    settings: {
      pushEnabled: true,
      trackingEnabled: true,
      highAlertSound: "sound-001",
      muted: false,
    },
    payout: {
      verified: true,
      cashappHandle: "$mikejohnson",
      venmoHandle: "@mike-johnson",
    },
  },
  "user-002": {
    uid: "user-002",
    email: "sarah.williams@emergencymobilunit.com",
    displayName: "Sarah Williams",
    role: "supe",
    agency: "Emergency Mobile Unit",
    stats: {
      responded: 156,
      noted: 98,
      daysActive: 234,
    },
    settings: {
      pushEnabled: true,
      trackingEnabled: true,
      highAlertSound: "sound-003",
      muted: false,
    },
    payout: {
      verified: true,
      cashappHandle: "$sarahw",
    },
  },
  "user-003": {
    uid: "user-003",
    email: "admin@emergencymobilunit.com",
    displayName: "Admin User",
    role: "admin",
    stats: {
      responded: 0,
      noted: 0,
      daysActive: 365,
    },
    settings: {
      pushEnabled: true,
      trackingEnabled: false,
      highAlertSound: "sound-001",
      muted: true,
    },
    payout: {
      verified: false,
    },
  },
}

export const mockCurrentUser = mockProfiles["user-001"]
