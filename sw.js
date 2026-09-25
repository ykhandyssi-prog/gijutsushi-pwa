// 技術士 答え入力 PWA — オフラインキャッシュ
// biolog-pwa・hasu-pwa と同じオリジン（ykhandyssi-prog.github.io）に同居する。
// CacheStorage はオリジン単位で共有されるので、自分の接頭辞のものだけ消す。
const PREFIX = "gj-";
const CACHE = PREFIX + "v1";
const ASSETS = ["./", "./index.html", "./manifest.json", "./icon.svg"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k.startsWith(PREFIX) && k !== CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

// ネットワーク優先（push 後すぐ反映）→ オフライン時はキャッシュ。自分のスコープ外には触らない
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (!req.url.startsWith(self.registration.scope)) return;
  const net = fetch(req.url, { cache: "no-store", credentials: "same-origin" });
  e.respondWith(
    net.then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(req).then(hit => hit || caches.match("./index.html")))
  );
});