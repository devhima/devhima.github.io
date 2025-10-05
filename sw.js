// Service Worker for Data Monitor App
// Provides offline functionality and PWA features

const CACHE_NAME = 'data-monitor-v1.0.0';
const STATIC_CACHE = 'data-monitor-static-v1.0.0';
const DYNAMIC_CACHE = 'data-monitor-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/index.html',
  '/session.html',
  '/analytics.html',
  '/users.html',
  '/main.js',
  '/manifest.json',
  '/resources/hero-data-flow.png',
  '/resources/dashboard-bg.png',
  '/resources/user-avatars.png',
  // External resources
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&family=Tajawal:wght@300;400;500;700&display=swap',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/echarts/5.4.3/echarts.min.js'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .catch((error) => {
        console.error('Service Worker: Error caching static files', error);
      })
  );
  
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
  );
  
  // Ensure the service worker takes control immediately
  self.clients.claim();
});

// Fetch event - serve cached files or fetch from network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle different types of requests
  if (url.origin === location.origin) {
    // Same origin requests - use cache first strategy
    event.respondWith(cacheFirst(request));
  } else {
    // External resources - use network first strategy
    event.respondWith(networkFirst(request));
  }
});

// Cache first strategy - for static files
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    
    // Return offline fallback for HTML pages
    if (request.destination === 'document') {
      return caches.match('/index.html');
    }
    
    // Return a basic response for other requests
    return new Response('Offline content not available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Network first strategy - for external resources
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback
    return new Response('Content not available offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Background sync for data updates
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'data-sync') {
    event.waitUntil(syncData());
  }
});

// Sync data when connection is restored
async function syncData() {
  try {
    console.log('Service Worker: Syncing data...');
    
    // Get pending sync data from localStorage
    const syncData = localStorage.getItem('pendingSync');
    if (syncData) {
      // Process sync data here
      console.log('Service Worker: Processing sync data', syncData);
      
      // Clear pending sync data
      localStorage.removeItem('pendingSync');
    }
    
    // Notify all clients about sync completion
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        data: 'Data sync completed successfully'
      });
    });
    
  } catch (error) {
    console.error('Service Worker: Sync failed', error);
  }
}

// Handle messages from clients
self.addEventListener('message', (event) => {
  console.log('Service Worker: Received message', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('Service Worker: Periodic sync triggered', event.tag);
  
  if (event.tag === 'data-cleanup') {
    event.waitUntil(cleanupOldData());
  }
});

// Cleanup old data periodically
async function cleanupOldData() {
  try {
    console.log('Service Worker: Cleaning up old data...');
    
    // Clean up old cache entries
    const cache = await caches.open(DYNAMIC_CACHE);
    const requests = await cache.keys();
    
    // Remove cache entries older than 7 days
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    const deletePromises = requests.map(async (request) => {
      const response = await cache.match(request);
      const dateHeader = response.headers.get('date');
      
      if (dateHeader) {
        const responseDate = new Date(dateHeader).getTime();
        if (responseDate < oneWeekAgo) {
          return cache.delete(request);
        }
      }
    });
    
    await Promise.all(deletePromises);
    console.log('Service Worker: Cleanup completed');
    
  } catch (error) {
    console.error('Service Worker: Cleanup failed', error);
  }
}

// Push notifications (if implemented)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received', event);
  
  const options = {
    body: 'You have a new notification from Data Monitor',
    icon: '/resources/icon-192x192.png',
    badge: '/resources/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/resources/action-view.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/resources/action-close.png'
      }
    ]
  };
  
  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.data = { ...options.data, ...data };
  }
  
  event.waitUntil(
    self.registration.showNotification('Data Monitor', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/analytics.html')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle notification close events
self.addEventListener('notificationclose', (event) => {
  console.log('Service Worker: Notification closed', event);
});

console.log('Service Worker: Script loaded successfully');