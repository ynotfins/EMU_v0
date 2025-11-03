// EMU Alerts - Service Worker
// Handles offline caching and push notifications

const CACHE_NAME = "emu-alerts-v1";
const RUNTIME_CACHE = "emu-alerts-runtime";

// Critical assets to cache immediately
const PRECACHE_URLS = [
  "/",
  "/app-icon.png",
  "/manifest.json",
];

// Install event - cache critical assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...");
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Caching critical assets");
      return cache.addAll(PRECACHE_URLS);
    })
  );
  
  // Force new service worker to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...");
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
          })
          .map((cacheName) => {
            console.log("[SW] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);
  
  // Do not cache non-GET
  if (req.method !== 'GET') {
    event.respondWith(fetch(req))
    return
  }
  
  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // Skip Firebase, Google Maps, and API requests (always need fresh data)
  if (
    url.hostname.includes("firebasestorage") ||
    url.hostname.includes("firebaseio") ||
    url.hostname.includes("googleapis") ||
    url.pathname.startsWith("/api/")
  ) {
    return;
  }
  
  // Network-first strategy for HTML pages
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((response) => {
          // Cache successful responses
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(req, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Fallback to cache when offline
          return caches.match(req).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline page if available
            return caches.match("/");
          });
        })
    );
    return;
  }
  
  // Cache-first strategy for static assets
  event.respondWith((async () => {
    try {
      const cache = await caches.open(RUNTIME_CACHE)
      const hit = await cache.match(req)
      if (hit) return hit
      const resp = await fetch(req)
      // Only cache successful same-origin GET
      if (resp && resp.ok && resp.type === 'basic') {
        try { await cache.put(req, resp.clone()) } catch {}
      }
      return resp
    } catch (e) {
      return fetch(req)
    }
  })())
});

// Push notification event (for FCM)
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received", event);
  
  if (!event.data) {
    console.warn("[SW] Push event has no data");
    return;
  }
  
  try {
    const data = event.data.json();
    const options = {
      body: data.body || "New alert from EMU",
      icon: "/app-icon.png",
      badge: "/app-icon.png",
      vibrate: [200, 100, 200],
      tag: data.tag || "emu-alert",
      requireInteraction: true,
      data: data.data || {},
      actions: [
        { action: "open", title: "View Alert" },
        { action: "close", title: "Dismiss" },
      ],
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || "EMU Alert", options)
    );
  } catch (error) {
    console.error("[SW] Error handling push notification:", error);
  }
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked", event);
  
  event.notification.close();
  
  if (event.action === "close") {
    return;
  }
  
  // Open app or specific URL
  const urlToOpen = event.notification.data?.url || "/chaser/incidents";
  
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window if available
        for (const client of clientList) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
