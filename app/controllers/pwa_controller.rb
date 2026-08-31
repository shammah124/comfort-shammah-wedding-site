class PwaController < ApplicationController
  skip_forgery_protection only: :service_worker

  def manifest
    render template: "pwa/manifest", formats: :json, layout: false
  end

  def service_worker
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Service-Worker-Allowed"] = "/"
    cache_name = "comfort-shammah-wedding-site-v3"
    render plain: <<~JS, content_type: "application/javascript"
      const CACHE_NAME = "#{cache_name}";
      const ASSETS = ["/", "/icon.png", "/icon.svg", "/audio/beautiful-things.mp3"];

      async function remember(request, response) {
        if (response && response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }
        return response;
      }

      async function networkFirst(request) {
        try {
          const response = await fetch(request, { cache: "no-store" });
          return remember(request, response);
        } catch (_error) {
          return (await caches.match(request)) || (request.mode === "navigate" ? caches.match("/") : Response.error());
        }
      }

      async function staleWhileRevalidate(request) {
        const cached = await caches.match(request);
        const network = fetch(request).then((response) => remember(request, response)).catch(() => null);
        return cached || network || Response.error();
      }

      self.addEventListener("install", (event) => {
        event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
      });

      self.addEventListener("activate", (event) => {
        event.waitUntil(
          caches.keys().then((keys) =>
            Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
          ).then(() => self.clients.claim())
        );
      });

      self.addEventListener("fetch", (event) => {
        if (event.request.method !== "GET") return;

        const url = new URL(event.request.url);
        if (url.origin !== self.location.origin) return;

        const needsFreshResponse = event.request.mode === "navigate" ||
          ["script", "style", "worker"].includes(event.request.destination) ||
          url.pathname.startsWith("/api/");

        event.respondWith(needsFreshResponse ? networkFirst(event.request) : staleWhileRevalidate(event.request));
      });
    JS
  end
end
