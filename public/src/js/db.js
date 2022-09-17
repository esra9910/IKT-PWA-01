/** ------> Wir haben unter den Developer Tools diese "Datenbank" vielleicht schon im Application-Reiter auf der linken Seite unter Storage entdeckt.
 *
 * INDEXDB
 *
 * - transaktionsbasierte Datenbank, die Schlüssel-Werte-Paare im Browser speichert
 * - Index DB wird in einem Browser verwalet
 * - dynamisch Daten speichern, sogenannten dynamischen Inhalt
 * - Daten hinzufügen und lesen ähnlich wie eine Datenbank
 * - belibige Dtaen werden gespeichert ( Bilder, Dateien, Arrays, Objekte)
 *  Lokal Storage ist, dass wir sowohl über den "normalen" JavaScript-Thread unserer Webanwendung als auch über den Service Worker auf die IndexedDB zugreifen können
 * - In-Browser-IndexedDB spielt die Fetch-API keine Rolle.
 * - sind nur sich häufig ändernde Daten drinn(dynamic content)
 * Dynamischen Cache:
 *
 * - wurde schon ausgefügrt
 * Die Webanwendung stellt eine Anfrage an den Webserver, der Service Worker schaltet sich jedoch als Proxy dazwischen.
 * - werden  dynamisch Ressourcen im Cache abgelegt
 *
 *
 *
 * Achten Sie darauf, die Versionsnummern der Caches in der sw.js zu ändern, denn wir haben ja die index.html und die feed.js geändert. Diese Änderungen würden nicht wirksam sein, ohne Versionsänderungen der Caches, da ansonsten die Dateien aus dem statischen Cache und nicht vom Webserver gelesen würden.

 Stellen Sie auch sicher, dass Ihr Backend gestartet ist.
 Reloaden Sie die Anwendung im Browser.
 skipWaiting den neuen Service Worker
 checken, ob der neuen statische Cache unter Cache --> Cache-Storage verwendet wird
 checken, ob die IndexedDB befüllt ist (sollte durch writeData() im Service Worker passieren)
 In der Console steht From backend ... mit dem dazugehörigen Data-Array
 Schalten Sie im Service Worker die Anwendung nun offline und reloaden Sie die Anwendung
 In der Console erscheint Fetch failed loading GET http://localhost:3000/posts mit dem dazugehörigen Fehler, aber es erscheint auch From cache ... mit dem dazugehörigen Daten-Array. Es werden alle cards erstellt und angezeigt.
 Die Anwendung ist nun auch insofern offline-fähig geworden, dass nun die dynamischen Daten in die IndexedDB geschrieben und aus der IndexedDB gelesen werden.
 *
 *
 *
 *
 *
 *
 * */

//neue Indexdb

const db = idb.openDB('posts-store', 1, {
    upgrade(db) {
        // Create a store of objects
        const store = db.createObjectStore('posts', {
            // The '_id' property of the object will be the key.
            keyPath: '_id',
            // If it isn't explicitly set, create a value by auto incrementing.
            autoIncrement: true,
        });
        // Create an index on the '_id' property of the objects.
        store.createIndex('_id', '_id');
    },
});
//schreiben
function writeData(st, data) {
    return db
        .then( dbPosts => {
            let tx = dbPosts.transaction(st, 'readwrite');
            let store = tx.objectStore(st);
            store.put(data);
            return tx.done;
        })
}

//auslesen
function readAllData(st) {
    return db
        .then( dbPosts => {
            let tx = dbPosts.transaction(st, 'readonly');
            let store = tx.objectStore(st);
            return store.getAll();
        })
}
//alles löschen
function clearAllData(st) {
    return db
        .then( dbPosts => {
            let tx = dbPosts.transaction(st, 'readwrite');
            let store = tx.objectStore(st);
            store.clear();
            return tx.done;
        })
}
//Index DB datnesatz löschen
function deleteOneData(st, id) {
    db
        .then( dbPosts => {
            let tx = dbPosts.transaction(st, 'readwrite');
            let store = tx.objectStore(st);
            store.delete(id);
            return tx.done;
        })
        .then( () => {
            console.log('Data deleted ...');
        });
}