/*importScripts(
    'https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js'
);
//workbox hilft um sw zu erstellen
//unser browser denkt ist offline fähig
workbox.routing.registerRoute(
    ({request}) => request.destination === 'image',
    new workbox.strategies.NetworkFirst()     // NetworkFirst() vs CacheFirst()
)*/
/*
SW reagieren auf...
- Fetch-Ereignisse:
        > Browser etwas vom Webserver lädt, führt er ein fetch-Ereignis aus
        > SW Agieren mit Proxy und empfängt die Fetch Anfragen(request)
        > wird weitergeleitet an Webserver
        > (asynchrones) XMLHttpRequest stellt kein fetch-Ereignis dar
        >die Fetch-Ereignisse: push, notificationclick, notificationclose, sync, canmakepayment, paymentrequest usw. (sogenannte Functional events)
- Push-Notifikation:
       > Push-Notifikationen werden von einem (anderen) Server gesendet
       > können durch service worker verwaltet werden
       > SW arbeiten bei geschlossener Webanwendung weiter und empfangen Push-N.
       > Nutzer können dann darauf reagieren und lösen ----> Notification interaction aus
- Notification interaction:
        > Push-Notifikationen werden von einem (anderen) Server gesendet
        > können durch service worker verwaltet werden. Jeder Browser verfügt über eigene Push-Web-Server
- Hintergrund-Notification:
        > Webanwendung Ereignisse ausgeführt werden, jedoch keine Verbindung zum Internet besteht
        > Ausführungen solcher Ereignisse, die offline ausgeführt werden und  durch service worker erledigt
        > Bei Verbindung löst es das Ereignis aus
- Service-worker-Lifecycle-Ereignisse:
        > SW hat einen eigenen "Lebenszyklus"
        >  sind die Lifecycle-Events existieren  für service worker
        > install und activate (sogenannte Lifecycle events)

 */
const CURRENT_STATIC_CACHE = 'static-v2';
const CURRENT_DYNAMIC_CACHE = 'dynamic-v2';

self.addEventListener('install', event => {
    console.log('service worker --> installing ...', event);
    event.waitUntil(
        caches.open(CURRENT_STATIC_CACHE)
            .then( cache => {
                console.log('Service-Worker-Cache erzeugt und offen');
                cache.addAll([
                    '/',
                    '/index.html',
                    '/src/js/app.js',
                    '/src/js/feed.js',
                    '/src/js/material.min.js',
                    '/src/css/app.css',
                    '/src/css/feed.css',
                    '/src/images/htw.jpg',
                    'https://fonts.googleapis.com/css?family=Roboto:400,700',
                    'https://fonts.googleapis.com/icon?family=Material+Icons',
                    'https://code.getmdl.io/1.3.0/material.blue_grey-red.min.css'
                ]);
            })
    );
})

self.addEventListener('activate', event => {
    console.log('service worker --> activating ...', event);
    event.waitUntil(
        caches.keys()
            .then( keyList => {//alle Caches
                return Promise.all(keyList.map( key => {
                    if(key !== CURRENT_STATIC_CACHE && key !== CURRENT_DYNAMIC_CACHE) {
                        console.log('service worker --> old cache removed :', key);
                        return caches.delete(key);
                    }
                }))
            })
    );
    return self.clients.claim();
})

// check if request is made by chrome extensions or web page
// if request is made for web page url must contains http.
self.addEventListener('fetch', event => {
    if (!(event.request.url.indexOf('http') === 0)) return; // skip the request. if request is not made with http protocol

    event.respondWith(
        caches.match(event.request)
            .then( response => {
                if(response) {
                    return response;
                } else {
                    return fetch(event.request)
                        .then( res => {     // nicht erneut response nehmen, haben wir schon
                            return caches.open(CURRENT_DYNAMIC_CACHE)      // neuer, weiterer Cache namens dynamic
                                .then( cache => {
                                    cache.put(event.request.url, res.clone());
                                    return res;
                                })
                        });
                }
            })
    );
})