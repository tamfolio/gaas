const CACHE_NAME = "engineroom-v2";
const OFFLINE_URL = "/offline";

// Install: pre-cache the offline page
self.addEventListener("install", (event) => {
  event.waitUntil(
    fetch(OFFLINE_URL)
      .then((res) =>
        caches.open(CACHE_NAME).then((cache) => cache.put(OFFLINE_URL, res))
      )
      .then(() => self.skipWaiting())
  );
});

// Activate: remove old caches and claim clients immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "EngineRoom", body: event.data.text() };
  }

  const title = payload.title ?? "EngineRoom";
  const options = {
    body:    payload.body ?? "",
    icon:    "/icons/icon-192x192.png",
    badge:   "/icons/icon-192x192.png",
    data:    { url: payload.url ?? "/" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests over http(s)
  if (request.method !== "GET" || !url.protocol.startsWith("http")) return;

  // Never intercept API routes — always go to network
  if (url.pathname.startsWith("/api/")) return;

  // Navigation requests: network-first, fall back to offline page
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_URL).then(
          (cached) => cached ?? new Response("Offline", { status: 503 })
        )
      )
    );
    return;
  }

  // Next.js static assets + images + fonts: cache-first, populate on first load
  if (
    url.pathname.startsWith("/_next/static/") ||
    request.destination === "image" ||
    request.destination === "font"
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return res;
        });
      })
    );
  }
});
