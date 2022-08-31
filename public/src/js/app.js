//Registrierung des SW
if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('src/js/sw.js')
        .then(function() {
            console.log('service worker registriert')
        });
}