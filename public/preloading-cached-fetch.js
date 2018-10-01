const imageList = Array(300).fill('').map((v, i) => new URL(`images/${i}.png`, self.location).href);
const preloadMap = new Map();

self.oninstall = event => {
  self.skipWaiting();

  const toCache = ['./'].concat(imageList);

  event.waitUntil(
    caches.open('sw-benchmark-images').then(cache => cache.addAll(toCache))
  );
};

function getResponse(request) {
  return caches.match(request).then(response => response || fetch(request));
}

self.onfetch = event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(getResponse(event.request));
    for (let i = 0; i < imageList.length; ++i) {
      const image = imageList[i];
      if (preloadMap.has(image)) {
        return;
      }
      preloadMap.set(image, getResponse(image));
    }
    return;
  }
  let preload = preloadMap.get(event.request.url);
  if (preload) {
    event.respondWith(preload);
    preloadMap.delete(event.request.url);
    return;
  }
  event.respondWith(getResponse(event.request));
};
