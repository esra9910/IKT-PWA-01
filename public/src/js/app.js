/***
 * PROMISES AND FETCH-API
 *
 *
 * PROMISE
 * - ist ein JavaScript-Objekt
 * - hat ein Teil seines Codes -->Erzeugt ein Promise Object (producing code)
 * - zweiter Teil des Codes ----> zum Verarbeiten eines solchen Promise-Objektes (consuming code)
 *
 * - Objekte werden verarbeitet(resolved) oder nicht erfolgreich abgearbeitet (reject)
 * //Struktur
 *let myPromise = new Promise(function(myResolve, myReject) {
// "Producing Code" (May take some time)

  myResolve(); // when successful
  myReject();  // when error
});

 // "Consuming Code" (Must wait for a fulfilled Promise)
 myPromise.then(
 function(value) { /* code if successful },
 function(error) { /* code if some error  }
);
 *
 *
 *
 *
 *
 *
 * FETCH-API
 * -
 *
 *
 *
 *
 *
 */


//Registrierung des SW
if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(() => {
            console.log('service worker registriert')
        })
        .catch(
            err => { console.log(err); }
        );
}

//https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams
//https://github.com/mdn/dom-examples/tree/main/streams/simple-pump
//https://github.com/mdn/dom-examples/tree/main/streams
//Promise



