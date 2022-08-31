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
