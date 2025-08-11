/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

declare const self: ServiceWorkerGlobalScope;

const CACHE = `cache-${version}`;
const ASSETS = [...build, ...files];

// Install event
self.addEventListener('install', (event: ExtendableEvent) => {
  async function addFilesToCache() {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
  }

  event.waitUntil(addFilesToCache());
});

// Activate event
self.addEventListener('activate', (event: ExtendableEvent) => {
  async function deleteOldCaches() {
    for (const key of await caches.keys()) {
      if (key !== CACHE) await caches.delete(key);
    }
  }

  event.waitUntil(deleteOldCaches());
});

// Fetch event
self.addEventListener('fetch', (event: FetchEvent) => {
  // ignore POST requests etc
  if (event.request.method !== 'GET') return;

  async function respond() {
    const url = new URL(event.request.url);
    const cache = await caches.open(CACHE);

    // Build files are served from the cache
    if (ASSETS.includes(url.pathname)) {
      const response = await cache.match(url.pathname);
      if (response) {
        return response;
      }
    }

    // For everything else, try the network first, but
    // fall back to the cache if we're offline
    try {
      const response = await fetch(event.request);

      // Cache successful responses
      if (response.status === 200) {
        cache.put(event.request, response.clone());
      }

      return response;
    } catch (err) {
      const response = await cache.match(event.request);

      if (response) {
        return response;
      }

      // If there's no cache, return a custom offline page
      throw err;
    }
  }

  event.respondWith(respond());
});

// Background sync
self.addEventListener('sync', (event: any) => {
  if (event.tag === 'sync-observations') {
    event.waitUntil(syncObservations());
  }
});

// Push notifications
self.addEventListener('push', (event: PushEvent) => {
  if (event.data) {
    const data = event.data.json();
    
    const options: NotificationOptions = {
      body: data.body,
      icon: '/favicon.png',
      badge: '/favicon.png'
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

async function syncObservations() {
  // Background sync implementation
  console.log('Syncing observations...');
}
