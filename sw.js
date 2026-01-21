// Fichier: sw.js (SERVICE WORKER COMPLET)

// Version du cache. Changez ceci pour forcer la mise à jour des utilisateurs.
const CACHE_NAME = 'radiolinky-cache-v1.0'; 
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  
  // Fichiers statiques et dépendances critiques
  'https://unpkg.com/lucide@latest', 
  'https://cdn.jsdelivr.net/npm/hls.js@latest'
];

// Phase 1: Installation et Mise en Cache
self.addEventListener('install', (event) => {
  console.log('[SW] Installation. Mise en cache des fichiers...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Tentative de mise en cache de toutes les ressources (y compris les fichiers externes)
        return cache.addAll(urlsToCache).catch(error => {
            console.error('[SW] Erreur lors de la mise en cache de toutes les ressources. Tentative des fichiers locaux seulement.');
            // En cas d'échec d'une ressource externe, on essaie de mettre en cache seulement les fichiers locaux essentiels
            return cache.addAll(urlsToCache.filter(url => !url.startsWith('http')));
        });
      })
  );
  // Force le nouveau Service Worker à prendre le contrôle immédiatement
  self.skipWaiting();
});

// Phase 2: Récupération des ressources (Stratégie Cache-First)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Si la ressource est dans le cache, on la retourne immédiatement.
        if (response) {
          return response;
        }
        // Sinon, on va la chercher sur le réseau.
        return fetch(event.request);
      })
  );
});

// Phase 3: Activation et Nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation. Nettoyage des anciens caches...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Réclame le contrôle des clients immédiatement
  return self.clients.claim();
});
