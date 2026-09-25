// Service Worker — تحديث تلقائي بدون مسح بيانات من المستخدم
// مهم: اسم الملف ثابت ./sw.js عشان المتصفح يستبدل النسخة القديمة
const CACHE = 'delivery-v8-auto';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './data.js',
  './app.js',
  './enhance.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      Promise.all(ASSETS.map(url => cache.add(url).catch(() => {})))
    )
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    // امسح كل الكاشات القديمة
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => caches.open(CACHE).then(cache =>
        Promise.all(ASSETS.map(url => cache.add(url).catch(() => {})))
      ))
      .then(() => self.clients.claim())
      // أعد تحميل كل التبويبات المفتوحة تلقائيًا → المستخدم يشوف النسخة الجديدة فورًا
      .then(() => self.clients.matchAll({ type: 'window', includeUncontrolled: true }))
      .then(clients => {
        clients.forEach(client => {
          try {
            if (client.navigate) client.navigate(client.url);
            else client.postMessage({ type: 'FORCE_RELOAD' });
          } catch (err) {}
        });
      })
  );
});

// الشبكة أولًا دائمًا للملفات الأساسية
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return;

  const path = url.pathname;
  const isAppFile =
    path.endsWith('/') ||
    path.endsWith('.html') ||
    path.endsWith('.js') ||
    path.endsWith('.css') ||
    /\/(index\.html)?$/.test(path);

  if (isAppFile) {
    e.respondWith(
      fetch(new Request(req, { cache: 'no-store' }))
        .then(res => {
          if (res && res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(req, clone)).catch(() => {});
          }
          return res;
        })
        .catch(() =>
          caches.match(req).then(c => c || caches.match('./index.html'))
        )
    );
    return;
  }

  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(req, clone)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});

self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING' || (e.data && e.data.type === 'SKIP_WAITING')) {
    self.skipWaiting();
  }
});
