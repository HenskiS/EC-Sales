// scripts/generate-sw.js
const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, arrayOfFiles);
    } else {
      // Skip service worker itself and map files
      if (!filePath.endsWith('.map') && !filePath.endsWith('service-worker.js')) {
        arrayOfFiles.push(filePath);
      }
    }
  });

  return arrayOfFiles;
}

function generateSW() {
  const buildPath = path.join(__dirname, '../build');
  const files = getAllFiles(buildPath);
  
  // Convert to relative paths and ensure they start with /
  const relativePaths = files.map(file => {
    const relativePath = file.replace(buildPath, '').replace(/\\/g, '/');
    return relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  });

  // Always include root path and offline path
  if (!relativePaths.includes('/')) {
    relativePaths.unshift('/');
  }
  if (!relativePaths.includes('/offline')) {
    relativePaths.push('/offline');
  }

  const swContent = `/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'cigar-app-v1';
const ASSETS_TO_CACHE = ${JSON.stringify(relativePaths, null, 2)};
const OFFLINE_URL = '/offline';

// List of API endpoints that should be cached
const CACHE_API_ENDPOINTS = [
  '/api/cigars',
  '/api/cigars/intl',
  '/api/clients/clientnames',
  '/api/clients/clientnames/intl',
  '/api/orders/catax',
  // Add other API endpoints that should be cached here
];

// Helper function to check if a URL matches any of our cacheable API endpoints
function shouldCacheEndpoint(url) {
  return CACHE_API_ENDPOINTS.some(endpoint => url.includes(endpoint));
}

// Helper function to determine if a request is for static assets
function isStaticAsset(url) {
  // Exclude any API routes first
  if (url.includes('/api/')) {
    return false;
  }
  
  // For the root path, only match it exactly
  if (url === '/') {
    return true;
  }
  
  // For other assets, do an exact match from our asset list
  return ASSETS_TO_CACHE.includes(url);
}

addEventListener('install', (event) => {
  console.log('Service Worker: Installing');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching Files');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('Service Worker: All Files Cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Caching Failed:', error);
      })
  );
});

addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // Handle different types of requests
  if (isStaticAsset(url.pathname)) {
    // Handle static assets
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => cachedResponse || fetch(event.request))
    );
  } else if (shouldCacheEndpoint(url.pathname)) {
    // Handle cacheable API endpoints
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          // Return cached response if exists
          if (cachedResponse) {
            // Fetch new version in background
            fetch(event.request)
              .then((response) => {
                if (response.ok) {
                  caches.open(CACHE_NAME)
                    .then((cache) => cache.put(event.request, response));
                }
              })
              .catch(() => console.log('Background fetch failed, using cached version'));
            
            return cachedResponse;
          }

          // If no cached version, fetch from network
          return fetch(event.request)
            .then((response) => {
              if (response.ok) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => cache.put(event.request, responseClone));
              }
              return response;
            })
            .catch(() => {
              if (event.request.mode === 'navigate') {
                return caches.match(OFFLINE_URL);
              }
              return Promise.reject('Offline');
            });
        })
    );
  } else {
    // For all other requests, try network first, fallback to offline page for navigation
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
          return Promise.reject('Offline');
        })
    );
  }
});

addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  
  event.waitUntil(Promise.all([
    self.clients.claim(),
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('cigar-app-') && name !== CACHE_NAME)
          .map((name) => {
            console.log('Service Worker: Clearing Old Cache:', name);
            return caches.delete(name);
          })
      );
    })
  ]));
});`;

  fs.writeFileSync(path.join(buildPath, 'service-worker.js'), swContent);
  console.log('Service worker generated successfully!');
}

// Run if called directly
if (require.main === module) {
  generateSW();
}

module.exports = generateSW;