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
  '/assets/js/script.js',
  '/assets/img/apple-touch-icon.png',
  '/assets/img/favicon-16x16.png',
  '/assets/img/favicon-16x16-Dark.png',
  '/assets/img/favicon-32x32.png',
  '/assets/img/favicon-32x32-Dark.png',
  '/assets/img/android-chrome-192x192.png',
  '/assets/img/android-chrome-512x512.png',
  '/manifest.json'
  // أضف هنا أي ملفات إضافية ترغب في تخزينها مسبقاً
];

// تثبيت Service Worker وتخزين الملفات
self.addEventListener('install', event => {
  // فرض التنشيط الفوري دون انتظار إغلاق التبويبات
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('فتح الكاش وتخزين الملفات الأساسية');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('خطأ في تخزين الملفات:', error);
      })
  );
});

// استخدام استراتيجية "Cache First, then Network"
self.addEventListener('fetch', event => {
  // تجاهل طلبات POST أو الـ API
  if (event.request.method !== 'GET' || 
      event.request.url.includes('google.com') || 
      event.request.url.includes('macros/s/')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // إعادة الاستجابة من الكاش إذا وجدت
        if (cachedResponse) {
          // في الخلفية، حاول تحديث الكاش
          fetch(event.request)
            .then(networkResponse => {
              if (networkResponse && networkResponse.ok) {
                caches.open(CACHE_NAME)
                  .then(cache => cache.put(event.request, networkResponse.clone()));
              }
            })
            .catch(() => {
              // تجاهل أخطاء الشبكة هنا
            });
            
          return cachedResponse;
        }
        
        // إذا لم تكن موجودة في الكاش، اجلبها من الشبكة
        return fetch(event.request)
          .then(networkResponse => {
            if (!networkResponse || !networkResponse.ok) {
              return networkResponse;
            }
            
            // إنشاء نسخة للتخزين في الكاش
            const responseToCache = networkResponse.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return networkResponse;
          });
      })
  );
});

// تنشيط Service Worker الجديد وحذف الكاش القديم
self.addEventListener('activate', event => {
  // تولي السيطرة على الصفحات دون إعادة تحميل
  clients.claim();
  
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('حذف الكاش القديم:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
