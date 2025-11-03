import type { Thread, Message } from "@/types/domain"

export const mockThreads: Thread[] = [
  {
    id: "thread-team",
    kind: "team",
    title: "Team",
    participants: ["user-001", "user-002", "user-003"],
    lastMessageContent: "Great work today everyone!",
    lastMessageTimestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "thread-inc-001",
    kind: "incident",
    title: "Incident #NFA-1234567",
    incidentId: "inc-001",
    participants: ["user-001", "user-002"],
    lastMessageContent: "Photos uploaded to docs tab",
    lastMessageTimestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "thread-inc-002",
    kind: "incident",
    title: "Incident #NFA-1345678",
    incidentId: "inc-002",
    participants: ["user-001", "user-003"],
    lastMessageContent: "Need backup on this one",
    lastMessageTimestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "thread-dm-001",
    kind: "dm",
    title: "Sarah Williams",
    participants: ["user-001", "user-002"],
    lastMessageContent: "Can you check the homeowner form?",
    lastMessageTimestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
]

export const mockMessages: Record<string, Message[]> = {
  "thread-team": [
    {
      id: "msg-001",
      threadId: "thread-team",
      senderId: "user-002",
      content: "Great work today everyone!",
      ts: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    {
      id: "msg-002",
      threadId: "thread-team",
      senderId: "user-001",
      content: "Thanks! Responded to 3 incidents today.",
      ts: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    },
  ],
  "thread-inc-001": [
    {
      id: "msg-003",
      threadId: "thread-inc-001",
      senderId: "user-001",
      content: "Photos uploaded to docs tab",
      ts: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
      id: "msg-004",
      threadId: "thread-inc-001",
      senderId: "user-002",
      content: "Perfect, reviewing now",
      ts: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    },
  ],
}
