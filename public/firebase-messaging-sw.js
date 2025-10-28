// Firebase Cloud Messaging Service Worker
// This file handles background push notifications

// Placeholder for FCM service worker
// Will be wired with Firebase messaging later

self.addEventListener("push", (event) => {
  console.log("[FCM SW] Push notification received", event)
  
  // TODO: Wire FCM notification handling
  // Parse event.data and show notification
})

self.addEventListener("notificationclick", (event) => {
  console.log("[FCM SW] Notification clicked", event)
  
  // TODO: Handle notification click
  // Open app or specific route
  event.notification.close()
})
