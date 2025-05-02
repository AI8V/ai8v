// إصدار الكاش، يمكنك تغييره عند تحديث موقعك
const CACHE_NAME = 'ai8v-cache-v1';

// قائمة الملفات التي ترغب في تخزينها محلياً
const urlsToCache = [
  '/',
  '/index.html',
  '/thank-you.html',
  '/assets/bootstrap/css/bootstrap.min.css',
  '/assets/css/style.css',
  '/assets/fonts/fontawesome-all.min.css',
  '/assets/img/apple-touch-icon.png',
  '/assets/img/favicon-16x16.png',
  '/assets/img/favicon-16x16-Dark.png',
  '/assets/img/favicon-32x32.png',
  '/assets/img/favicon-32x32-Dark.png',
  '/assets/img/android-chrome-192x192.png',
  '/assets/img/android-chrome-512x512.png',
  // أضف هنا أي ملفات إضافية ترغب في تخزينها مسبقاً
];

// تثبيت Service Worker وتخزين الملفات
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('فتح الكاش');
        return cache.addAll(urlsToCache);
      })
  );
});

// استراتيجية خدمة الطلبات: الشبكة أولاً، ثم الكاش
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // إذا كان الطلب ناجحاً، قم بتخزين نسخة في الكاش
        if (event.request.method === 'GET') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // إذا فشل الطلب، ابحث في الكاش
        return caches.match(event.request);
      })
  );
});

// تحديث الكاش عند تحديث Service Worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // حذف الكاش القديم
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});