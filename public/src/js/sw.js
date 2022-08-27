//Serviceworker registierieren

/*importScripts(
    'https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js'
);
//workbox hilft um sw zu erstellen
//unser browser denkt ist offline fähig
workbox.routing.registerRoute(
    ({request}) => request.destination === 'image',
    new workbox.strategies.NetworkFirst()     // NetworkFirst() vs CacheFirst()
)*/

//installierbar
self.addEventListener('install', event => {
    console.log('service worker --> installing ...', event);
    event.waitUntil(
        caches.open('static')
            .then( cache => {
                console.log('Service-Worker-Cache erzeugt und offen');
                cache.add('/src/js/app.js');    // relativ vom public-Ordner fügen hinzu
            })
    );
})

self.addEventListener('activate', event => {
    console.log('service worker --> activating ...', event);
    return self.clients.claim();
})

self.addEventListener('fetch', event => {
    event.respondWith(fetch(event.request));
    //Respond With()-Funktion sorgt einerseits dafür, den Browser von seiner Standardbehandlung des FetchEvents abzuhalten
    //wird noch nicht auf den Cache zugegriffen, sondern der request direkt an den Webserver weitergeleitet
})

//Kamera: müssen immer refreshen damit es klappt: in der Index.html ist das Formular für Titel,Inhalt und Bild, Location