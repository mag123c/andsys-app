// 4ndSYS Service Worker
// 기본 오프라인 지원 (캐시 우선 전략)

const CACHE_NAME = "4ndsys-v1";
const OFFLINE_URL = "/offline";

// 캐싱할 정적 자원
const STATIC_ASSETS = [
  "/",
  "/offline",
  "/novels",
  "/manifest.webmanifest",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// 설치 시 정적 자원 캐싱
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 활성화 시 이전 캐시 정리
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// 요청 처리: 네트워크 우선, 실패 시 캐시
self.addEventListener("fetch", (event) => {
  // API 요청은 캐싱하지 않음
  if (event.request.url.includes("/api/")) {
    return;
  }

  // HTML 페이지 요청
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // 성공하면 캐시에 저장
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // 오프라인이면 캐시에서 찾거나 오프라인 페이지
          return caches.match(event.request).then((cached) => {
            return cached || caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // 정적 자원 (이미지, JS, CSS)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      // 캐시에 있으면 캐시 반환하면서 백그라운드에서 업데이트
      if (cached) {
        fetch(event.request).then((response) => {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response);
          });
        });
        return cached;
      }
      // 캐시에 없으면 네트워크 요청
      return fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // 네트워크 실패 시 캐시된 버전 반환 시도
          return cached;
        });
    })
  );
});
