const CACHE = "ddl-static-v0.11.0";
const BASE_PATH = new URL("./", self.location.href).pathname;
const SHELL = [BASE_PATH, `${BASE_PATH}manifest.webmanifest`];
const SHARE_DB = "digital-dhamma-library";
const SHARE_STORE = "shares";

function openShareDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(SHARE_DB, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(SHARE_STORE)) db.createObjectStore(SHARE_STORE, { keyPath: "id", autoIncrement: true });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function storeShare(formData) {
  const files = [];
  for (const [name, value] of formData.entries()) {
    if (value instanceof File && value.size > 0) files.push({ field: name, file: value });
  }
  const record = {
    title: String(formData.get("name") || ""),
    text: String(formData.get("description") || ""),
    url: String(formData.get("link") || ""),
    files: files.map((entry) => entry.file),
    fields: files.map((entry) => entry.field),
    receivedAt: Date.now()
  };
  const db = await openShareDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SHARE_STORE, "readwrite");
    const request = tx.objectStore(SHARE_STORE).add(record);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL).catch(() => undefined)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const shareTarget = new URL("./share-target/", self.location.href);
  if (request.method === "POST" && url.pathname === shareTarget.pathname) {
    event.respondWith((async () => {
      try {
        const formData = await request.formData();
        const id = await storeShare(formData);
        return Response.redirect(`${shareTarget.href}?id=${encodeURIComponent(id)}`, 303);
      } catch {
        return Response.redirect(`${shareTarget.href}?error=1`, 303);
      }
    })());
    return;
  }

  if (request.method !== "GET") return;
  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => undefined);
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match(BASE_PATH)))
  );
});
