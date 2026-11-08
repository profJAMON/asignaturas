// sw.js — Service worker: guarda los archivos de la app para que funcione sin conexión.
// Estrategia "primero la red": si hay conexión se usa la versión más nueva
// (así tus cambios aparecen solos); si no la hay o tarda más de 3 s, se usa la guardada.
// Si añades un archivo nuevo a la app, añádelo también a ARCHIVOS.

const CACHE = 'entreno-v5';
const ARCHIVOS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/estilos.css',
  './js/app.js',
  './js/db.js',
  './js/estado.js',
  './js/ui.js',
  './js/utilidades.js',
  './js/datos-iniciales.js',
  './js/progreso.js',
  './js/cuerpo.js',
  './js/vistas/cuerpo.js',
  './js/vistas/mapa-cuerpo.js',
  './js/vistas/inicio.js',
  './js/vistas/entreno.js',
  './js/vistas/calendario.js',
  './js/vistas/actividades.js',
  './js/vistas/maquinas.js',
  './js/vistas/plantillas.js',
  './js/vistas/ajustes.js',
  './js/vistas/formulario-maquina.js',
  './fuentes/big-shoulders-800.woff2',
  './fuentes/big-shoulders-900.woff2',
  './iconos/icono-192.png',
  './iconos/icono-512.png',
  './iconos/apple-touch-icon.png'
];

self.addEventListener('install', evento => {
  evento.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', evento => {
  evento.waitUntil(
    caches.keys()
      .then(claves => Promise.all(claves.filter(c => c !== CACHE).map(c => caches.delete(c))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', evento => {
  const peticion = evento.request;
  if (peticion.method !== 'GET' || new URL(peticion.url).origin !== location.origin) return;

  evento.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const respuesta = await Promise.race([
        fetch(peticion),
        new Promise((_, rechazar) => setTimeout(() => rechazar(new Error('lento')), 3000))
      ]);
      if (respuesta.ok) cache.put(peticion, respuesta.clone());
      return respuesta;
    } catch {
      return (await cache.match(peticion, { ignoreSearch: true })) ?? (await cache.match('./index.html'));
    }
  })());
});
