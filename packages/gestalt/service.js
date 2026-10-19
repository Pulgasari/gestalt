//

import transform from './transform.js';

// Intercept network requests
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Filter for CSS stylesheet requests
  const isCSS = request.destination === 'style' || request.url.endsWith('.css');

  if (isCSS) {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (!response.ok) return response;

          const code = await response.text();
          const transformedCSS = transform (code);

          // Return newly constructed CSS Response
          return new Response(transformedCSS, {
            status: response.status,
            statusText: response.statusText,
            headers: {
              'Content-Type': 'text/css; charset=utf-8',
              'Cache-Control': 'no-cache'
            }
          });
        })
        .catch(error => {
          console.error(error);
          return fetch(request);
        })
    );
  }
});

// Immediately activate SW without waiting
self.addEventListener('install',  (event) => { self.skipWaiting(); });
self.addEventListener('activate', (event) => { event.waitUntil(clients.claim()); });


/*
navigator?.serviceWorker?.register('/sw.js', { scope: '/' })
  .then(reg => console.log('CSS Transformer SW registered:', reg.scope))
  .catch(err => console.error('SW registration failed:', err));
}
*/
