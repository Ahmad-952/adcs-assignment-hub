/* Service worker — receives push even when the app/tab is closed */
self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data.json(); } catch (e) { data = { title: "ADCS", body: event.data.text() }; }
  event.waitUntil(
    self.registration.showNotification(data.title || "🔔 ADCS Assignment Hub", {
      body: data.body || "New assignment uploaded",
      icon: "/logo.png",
      badge: "/favicon.png",
      tag: "adcs-upload",
      requireInteraction: true,   // stays until user dismisses (news-style)
      data: { url: data.url || "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url || "/"));
});
