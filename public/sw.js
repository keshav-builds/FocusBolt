self.addEventListener("install", (event) => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  self.clients.claim()
})

// Optional: could listen to push events in future.
// This SW exists mainly so reg.showNotification works even when page is backgrounded.
