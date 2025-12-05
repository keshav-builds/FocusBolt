self.addEventListener("install", (event) => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  self.clients.claim()
})

//works even when page is backgrounded.
self.addEventListener("message", (event) => {
  const { type, payload } = event.data || {};
  if (type === "FOCUSBOLT_NOTIFY" && payload) {
    const { title, options } = payload;
    self.registration.showNotification(title, options);
  }
});
