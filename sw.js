var CACHE = 'board-v22';
var ASSETS = ['./', './index.html', './manifest.json', './icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.map(function (k) { return k === CACHE ? null : caches.delete(k); }));
  }));
  self.clients.claim();
});

// 行情/数据请求一律走网络，不缓存（腾讯行情、K线、搜索、东方财富涨停池）
self.addEventListener('fetch', function (e) {
  var url = e.request.url;
  if (url.indexOf('gtimg.cn') > -1 || url.indexOf('eastmoney.com') > -1) return;

  // 页面（导航请求）：网络优先，保证每次打开都是最新版；网络失败才回退缓存
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        return res;
      }).catch(function () {
        return caches.match(e.request).then(function (r) { return r || caches.match('./index.html'); });
      })
    );
    return;
  }

  // 静态资源（manifest/icon）：缓存优先，失败回网络
  e.respondWith(
    caches.match(e.request).then(function (r) {
      return r || fetch(e.request).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        return res;
      });
    })
  );
});
