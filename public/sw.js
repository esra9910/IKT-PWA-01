/**SERVICE WORKER
 *bezeichnet eine moderne Browsertechnologie,
 * die mittels JavaScript einen Proxy zwischen dem Webbrowser und dem Server bereitstellt, der vielfältig genutzt werden kann
 *
 *
 *
 *
 * Skript für die Behandlung des fetch-Ereignisses und für die Verwaltung der IndexedDB
 * SW wird benutzt für
 *
 - Fetch-Ereignisse:
 *
     > Browser etwas vom Webserver lädt, führt er ein fetch-Ereignis aus
     > SW Agieren mit Proxy und empfängt die Fetch Anfragen(request)
     > wird weitergeleitet an Webserver
     > (asynchrones) XMLHttpRequest stellt kein fetch-Ereignis dar
     > die Fetch-Ereignisse: push, notificationclick, notificationclose, sync, canmakepayment, paymentrequest usw. (sogenannte Functional events)
 *
 - Push-Notifikation:
 *
     > Push-Notifikationen werden von einem (anderen) Server gesendet
     > können durch service worker verwaltet werden
     > SW arbeiten bei geschlossener Webanwendung weiter und empfangen Push-N.
     > Nutzer können dann darauf reagieren und lösen ----> Notification interaction aus
 *
 - Notification interaction:
 *
     > Push-Notifikationen werden von einem (anderen) Server gesendet
     > können durch service worker verwaltet werden.
    > Jeder Browser verfügt über eigene Push-Web-Server
 *
 - Hintergrund-Notification:
 *
     > Webanwendung Ereignisse ausgeführt werden, jedoch keine Verbindung zum Internet besteht
     > Ausführungen solcher Ereignisse, die offline ausgeführt werden und  durch service worker erledigt
     > Bei Verbindung löst es das Ereignis aus
 *
 - Service-worker-Lifecycle-Ereignisse:
 *
     > SW hat einen eigenen "Lebenszyklus"
     >  sind die Lifecycle-Events existieren  für service worker
     > install und activate (sogenannte Lifecycle events)
 *
 */

/*importScripts(
    'https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js'
);
//workbox hilft um sw zu erstellen
//unser browser denkt ist offline fähig
workbox.routing.registerRoute(
    ({request}) => request.destination === 'image',
    new workbox.strategies.NetworkFirst()     // NetworkFirst() vs CacheFirst()
)
 */

//CAche
const CACHE_VERSION = 4;
const CURRENT_STATIC_CACHE = 'static-v'+CACHE_VERSION;
const CURRENT_DYNAMIC_CACHE = 'dynamic-v'+CACHE_VERSION;
importScripts('/src/js/idb.js');//Importieren es laden somit dies in den Cache
importScripts('/src/js/db.js');

const STATIC_FILES = [//statischen speicher gelagert
    '/',
    '/index.html',
    '/src/js/app.js',
    '/src/js/feed.js',
    '/src/js/material.min.js',
    '/src/css/app.css',
    '/src/js/idb.js',
    '/src/css/feed.css',
    '/src/images/Book.jpeg',
    'https://fonts.googleapis.com/css?family=Roboto:400,700',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://code.getmdl.io/1.3.0/material.blue_grey-red.min.css'
];
//SW wird erzeugt
self.addEventListener('install', event => {
    console.log('service worker --> installing ...', event);
    event.waitUntil(
        caches.open(CURRENT_STATIC_CACHE)
            .then( cache => {
                console.log('Service-Worker-Cache erzeugt und offen');
                cache.addAll(STATIC_FILES);

            })
    );
})
//SW Aktiviert
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
    // check if request is made by chrome extensions or web page
    // if request is made for web page url must contains http.
    if (!(event.request.url.indexOf('http') === 0)) return; // skip the request. if request is not made with http protocol

    const url = 'http://localhost:3000/posts';
    if(event.request.url.indexOf(url) >= 0) {
        event.respondWith(
            fetch(event.request)
                .then ( res => {

                    const clonedResponse = res.clone();//Klone die Response da verbarucht wird
                    clearAllData('posts')// Promise-Objekt zurück
                        .then( () => {
                    return clonedResponse.json()//wird in Json umgewandelt
                        })
                        .then( data => {
                            for(let key in data)
                            {
                                console.log('write data', data[key]);
                                writeData('posts', data[key]);
                            }
                        });
                    return res;
                })
        )
    } else {
    //dynamischer cache
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
        )}
})