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

// List of endpoints that should never be cached
const NO_CACHE_ENDPOINTS = [
  '/api/ping',
  // Add other endpoints that shouldn't be cached here
];

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
        return self.skipWaiting(); // Activate worker immediately
      })
      .catch((error) => {
        console.error('Service Worker: Caching Failed:', error);
      })
  );
});

addEventListener('fetch', (event) => {
  // Don't cache:
  // 1. Non-GET requests
  // 2. Endpoints in NO_CACHE_ENDPOINTS
  if (
    event.request.method !== 'GET' ||
    NO_CACHE_ENDPOINTS.some(endpoint => event.request.url.includes(endpoint))
  ) {
    return event.respondWith(
      fetch(event.request)
        .catch(() => {
          // If it's a page navigation, serve offline page
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
          return Promise.reject('Offline');
        })
    );
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('Service Worker: Serving from Cache:', event.request.url);
          return cachedResponse;
        }
        
        console.log('Service Worker: Fetching from Network:', event.request.url);
        return fetch(event.request)
          .then((response) => {
            if (response.ok) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            // If it's a page navigation, serve offline page
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            return Promise.reject('Offline');
          });
      })
  );
});

addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  
  // Take control of all pages immediately
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