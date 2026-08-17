class PwaController < ApplicationController
  def manifest
    render template: "pwa/manifest", formats: :json, layout: false
  end

  def service_worker
    cache_name = "comfort-shammah-wedding-site-v1"
    render plain: <<~JS, content_type: "application/javascript"
      const CACHE_NAME = "#{cache_name}";
      const ASSETS = ["/", "/icon.png", "/icon.svg", "/audio/beautiful-things.mp3"];

      self.addEventListener("install", (event) => {
        event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
      });

      self.addEventListener("activate", (event) => {
        event.waitUntil(
          caches.keys().then((keys) =>
            Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
          )
        );
      });

      self.addEventListener("fetch", (event) => {
        event.respondWith(
          caches.match(event.request).then((response) => response || fetch(event.request).then((networkResponse) => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
              return networkResponse;
            }

            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
            return networkResponse;
          }).catch(() => caches.match("/")))
        );
      });
    JS
  end
end
