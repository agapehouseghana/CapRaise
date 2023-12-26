// const CACHE_NAME = "version-1";
// const urlsToCache = ["index.html", "offline.html"];

// const self = this;

// self.addEventListener("install", (event) => {
//   event.waitUntil(
//     caches.open(CACHE_NAME).then((cache) => {
//       console.log("Opened cache");

//       return cache.addAll(urlsToCache);
//     })
//   );
// });

// self.addEventListener("fetch", (event) => {
//   event.respondWith(
//     caches.match(event.request).then(() => {
//       return fetch(event.request).catch(() => caches.match("offline.html"));
//     })
//   );
// });

// self.addEventListener("activate", (event) => {
//   const cacheWhitelist = [];
//   cacheWhitelist.push(CACHE_NAME);

//   event.waitUntil(
//     caches.keys().then((cacheNames) =>
//       Promise.all(
//         cacheNames.map((cacheName) => {
//           if (!cacheWhitelist.includes(cacheName)) {
//             return caches.delete(cacheName);
//           }
//         })
//       )
//     )
//   );
// });
const CACHE_NAME = "my-pwa-cache-v1";
const urlsToCache = ["offline.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .catch((error) => console.log("Cache open failed:", error))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((response) => {
            if (
              !response ||
              response.status !== 200 ||
              response.type !== "basic"
            ) {
              return response;
            }

            const responseToCache = response.clone();

            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, responseToCache))
              .catch((error) => console.log("Failed to cache:", error));

            return response;
          })
          .catch((fetchError) => {
            console.log("Fetch failed:", fetchError);
            return caches.match("offline.html");
          });
      })
      .catch((cacheError) => {
        console.log("Cache match failed:", cacheError);
        return caches.match("offline.html");
      })
  );
});
