/**
 * Notification system for real-time alerts to supervisors
 */

import { addDoc, collection, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db, auth } from './firebase'

export interface Notification {
  id?: string
  type: 'response' | 'alert' | 'chat' | 'update'
  title: string
  message: string
  from: {
    uid: string
    name: string
    role: string
  }
  to?: string[] // Specific user IDs, or undefined for broadcast
  targetRole?: 'supe' | 'admin' | 'super_admin' // Target role for broadcast
  metadata?: {
    incidentId?: string
    incidentAddress?: string
    chatId?: string
  }
  read?: boolean
  readBy?: string[]
  createdAt?: any
}

/**
 * Send a notification to supervisors
 */
export async function notifySupervisors(notification: Omit<Notification, 'createdAt'>) {
  try {
    await addDoc(collection(db, 'notifications'), {
      ...notification,
      targetRole: 'supe', // Target all supe, admin, and super_admin users
      read: false,
      readBy: [],
      createdAt: serverTimestamp()
    })
    
    console.log('[Notifications] Sent notification to supervisors:', notification.title)
  } catch (error) {
    console.error('[Notifications] Error sending notification:', error)
    throw error
  }
}

/**
 * Subscribe to notifications for a user
 */
export function subscribeToNotifications(
  userId: string,
  userRole: string,
  onNotification: (notification: Notification) => void
) {
  const notificationsRef = collection(db, 'notifications')
  
  // Query for notifications targeted to this user or their role
  const q = query(
    notificationsRef,
    orderBy('createdAt', 'desc')
  )
  
  return onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const data = { id: change.doc.id, ...change.doc.data() } as Notification
        
        // Check if notification is for this user
        const isForUser = 
          // Specific user targeting
          (data.to && data.to.includes(userId)) ||
          // Role-based targeting (supe, admin, super_admin can all see supe notifications)
          (data.targetRole && ['supe', 'admin', 'super_admin'].includes(userRole) && data.targetRole === 'supe') ||
          // Broadcast (no specific target)
          (!data.to && !data.targetRole)
        
        // Don't notify the sender
        const isFromSelf = data.from.uid === userId
        
        if (isForUser && !isFromSelf) {
          onNotification(data)
        }
      }
    })
  })
}
