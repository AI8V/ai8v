// إصدار الكاش، يمكنك تغييره عند تحديث موقعك
const CACHE_NAME = 'ai8v-cache-v2';

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
  '/assets/js/script.js',
  '/manifest.json'
];

// تثبيت Service Worker وتخزين الملفات
self.addEventListener('install', event => {
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('فتح الكاش وتخزين الملفات الأساسية');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('فشل في تخزين الملفات في الكاش:', error);
      })
  );
});

// استراتيجية خدمة الطلبات: الكاش أولاً، ثم الشبكة (Cache-First Strategy)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // إذا وجد الملف في الكاش، قم بإرجاعه فوراً
        if (cachedResponse) {
          return cachedResponse;
        }

        // إذا لم يوجد في الكاش، قم بجلبه من الشبكة
        return fetch(event.request)
          .then(response => {
            // تجاهل الطلبات غير الناجحة
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // تخزين نسخة في الكاش للاستخدام المستقبلي (فقط طلبات GET)
            if (event.request.method === 'GET') {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }

            return response;
          })
          .catch(error => {
            console.error('فشل في جلب الطلب من الشبكة:', error);
            // يمكنك هنا إضافة منطق للتعامل مع حالات الفشل
            // مثل إرجاع صفحة خطأ خاصة بك من الكاش
          });
      })
  );
});

// تحديث الكاش عند تحديث Service Worker
self.addEventListener('activate', event => {
  // الحصول على السيطرة على الصفحات دون الانتظار للتحديث
  event.waitUntil(clients.claim());
  
  // حذف الكاش القديم
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('حذف الكاش القديم:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});