// 缓存名称和版本
const CACHE_NAME = 'expense-tracker-v1';

// 需要缓存的资源列表
const urlsToCache = [
  '.',
  'expense-tracker.html',
  'manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css'
];

// 安装事件 - 缓存初始资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 网络请求事件 - 实现缓存策略
self.addEventListener('fetch', (event) => {
  event.respondWith(
    // 先尝试从网络获取
    fetch(event.request)
      .then((response) => {
        // 如果网络请求成功，将响应缓存起来
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then((cache) => {
            if (event.request.method === 'GET') {
              cache.put(event.request, responseToCache);
            }
          });
        return response;
      })
      .catch(() => {
        // 如果网络请求失败，尝试从缓存中获取
        return caches.match(event.request);
      })
  );
});