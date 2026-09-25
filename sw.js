// Service Worker بسيط للـ PWA
// لازم تغيّر اسم الـ CACHE ده (رقم النسخة) في كل مرة بترفع تعديلات جديدة،
// وإلا الأجهزة اللي فاتحة التطبيق قبل كده هتفضل شايفة النسخة القديمة المخزنة
// عندها حتى لو النسخة الجديدة اتحدثت على السيرفر.
const CACHE = 'delivery-v4';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './data.js',
  './app.js',
  './firebase-config.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  // كل ملف بيتحمّل لوحده بدل addAll (اللي بيفشل بالكامل لو ملف واحد رجّع 404)
  // عشان لو أي مصدر خارجي فشل، باقي الملفات تتخزن برضه ويشتغل الأوفلاين.
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      Promise.all(ASSETS.map(url => cache.add(url).catch(() => {})))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => caches.match('./index.html')))
  );
});
