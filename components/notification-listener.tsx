"use client"

import { useEffect } from 'react'
import { subscribeToNotifications } from '@/lib/notifications'
import { useToast } from '@/hooks/use-toast'
import { Bell } from 'lucide-react'

interface NotificationListenerProps {
  userId: string
  userRole: string
}

export function NotificationListener({ userId, userRole }: NotificationListenerProps) {
  const { toast } = useToast()

  useEffect(() => {
    if (!userId || !userRole) return

    console.log('[NotificationListener] Setting up for:', { userId, userRole })

    const unsubscribe = subscribeToNotifications(
      userId,
      userRole,
      (notification) => {
        console.log('[NotificationListener] Received notification:', notification)

        // Show toast notification
        toast({
          title: notification.title,
          description: notification.message,
          action: notification.metadata?.incidentId ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.location.href = `/${userRole}/incident/${notification.metadata.incidentId}`
              }}
            >
              View Alert
            </Button>
          ) : undefined,
        })

        // Play notification sound if available
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/emergency-alerts-logo.png',
            badge: '/app-icon.png',
          })
        }
      }
    )

    return () => unsubscribe()
  }, [userId, userRole, toast])

  return null
}

// Missing import fix
import { Button } from './ui/button'
