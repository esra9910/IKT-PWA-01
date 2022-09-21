/**
 * Daten werden aus der DB angezeigt
 * KARTEN werden erstellt
 * - Mit JQery werden die Daten zum Backend geschickt
 *
 *
 * Javascript- Datei
 * 1- hinzufügen von Karten und Daten werden in die DB verschikt und im Frontend angezeigt
 * 1.1-  Form wird hier angezeigt Create-post und geöffnet
 * 2- Kamera EInstellung von hier + ImagePicker
 * 3- Geolocation
 *      - Links: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation
 *              - https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API?retiredLocale=de
 *              - https://developers.google.com/maps/documentation/geolocation/overview
 *              - https://nominatim.org und https://nominatim.org/release-docs/develop/api/Overview/
 *
 *       -
 * 4- IndexDB
 */
//Alle Input felder und Button der Seite werden initialisert
let shareImageButton = document.querySelector('#share-image-button');
let createPostArea = document.querySelector('#create-post');
let closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
let sharedMomentsArea = document.querySelector('#shared-moments'); //Div in index.html

//JQuery für den direkten Zugriff auf Steurelemente
//Daten an Backend schicken
let form = document.querySelector('form');
let titleInput = document.querySelector('#title');
let locationInput = document.querySelector('#location');
let contentInput = document.querySelector('#content');

//Variable für Kamerazugriff, nehmen die Id der Elemente
let videoPlayer = document.querySelector('#player');//Video zum Bild aufnehmen
let canvasElement = document.querySelector('#canvas');// Bild
let captureButton = document.querySelector('#capture-btn');//'Foto'-Button, um Bild zu festzuhalten
let imagePicker = document.querySelector('#image-picker');//Selector Bilder hinzufügen
let imagePickerArea = document.querySelector('#pick-image');//Button

//Leere Variablen die dannach befüllt werden
let file = null;
let titleValue = '';
let locationValue = '';
let contentValue = '';
let imageURI = '';
//Variable für geolocation
let locationButton = document.querySelector('#location-btn');
let locationLoader = document.querySelector('#location-loader');
let fetchedLocation;

//Gucken ob Mediadevices gibts
//Links:
//https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices
//Zugriff zur Kamera zu bekommen
// über die moderne getUserMedia()-Funktion aus navigator.mediaDevices geschehen
// oder über das Polyfill unter Verwendung von webkitGetUserMedia() oder mozGetUserMedia()
function initializeMedia() {//benutzung der Meidadevice APi
    if(!('mediaDevices' in navigator)) {
        navigator.mediaDevices = {};
    }

    if(!('getUserMedia' in navigator.mediaDevices)) {
        navigator.mediaDevices.getUserMedia = function(constraints) {
            let getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

            if(!getUserMedia) {
                return Promise.reject(new Error('getUserMedia is not implemented'));
            }

            return new Promise( (resolve, reject) => {
                getUserMedia.call(navigator, constraints, resolve, reject);
            })
        }
    }
    navigator.mediaDevices.getUserMedia({video: true})
        .then( stream => {
            videoPlayer.srcObject = stream;
            videoPlayer.style.display = 'block';
        })
        .catch( err => {
            imagePickerArea.style.display = 'block';
        });
}

//block verwandelt ein Inline-Element (Element, das keinen Zeilenumbruch erzeugt) in ein Blockelement, das zu einem Zeilenumbruch führt.
// Umgekehrt transformiert die Eigenschaft display: inline ein Blockelement in ein Inline-Element.
function openCreatePostModal() {
    ////Habe ich entnommen wegen Probleme: Timeset setzen wir da die kamera die ganze Zeit läuft wir wollen das nicht deswegen setzten wir eine Zeit auf beim Öffnen und schließen
    createPostArea.style.transform = 'translateY(0)';
    initializeMedia();
    initializeLocation();
}

function closeCreatePostModal() {
    createPostArea.style.transform = 'translateY(100vH)'; //Zugriff zur Kamera zu bekommen
    imagePickerArea.style.display = 'none';//versteckt element
    videoPlayer.style.display = 'none'; //versteckt videoplayer
    canvasElement.style.display = 'none';//versteckt canvas
    locationButton.style.display = 'inline';
    locationLoader.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);//eventlistener bei Click und bei Funktionsaufruf

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

function createCard(card) {
    let cardWrapper = document.createElement('div');
    cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
    cardWrapper.style.width='200px';
    cardWrapper.style.borderRadius='10px';
    cardWrapper.style.borderColor='white';
    cardWrapper.style.borderStyle='solid';
    cardWrapper.style.float='left';
    cardWrapper.style.margin='10px';
    let cardTitle = document.createElement('div');
    cardTitle.className = 'mdl-card__title';
    let image = new Image();//neues Image aus der DB
   // image.style.height = '200px'//hinzugefügt
    image.src = card.image_id;//als Image id gespeichert
    cardTitle.style.backgroundImage = 'url('+ image.src +')';//Bild auf der Karte hinzugefügt und angezeziegt
    cardTitle.style.backgroundSize = 'cover';
    //cardTitle.style.height = '300px';
    cardWrapper.appendChild(cardTitle);
    //let cardTitleTextElement = document.createElement('h5');
    //cardTitleTextElement.className = 'mdl-card__title-text';
    // cardTitle.appendChild(cardTitleTextElement);
    //Titel des Buches
    let cardSupportingText = document.createElement('div');
    cardSupportingText.className = 'mdl-card__supporting-text';
    cardSupportingText.textContent= card.title;
    cardSupportingText.style.textAlign = 'center';
    //Location
    let cardLocationText = document.createElement('h9');
    cardLocationText.className = 'mdl-card__supporting-text';
    cardLocationText.textContent= card.location;
    cardLocationText.style.textAlign= 'center';
    //Content
    let cardContent = document.createElement('div');
    cardContent.className = 'mdl-card__supporting-text';
    cardContent.textContent=card.content;
    cardContent.style.textAlign='center';
    //Hinzufügen zur Karte
    cardWrapper.appendChild(cardSupportingText);
    cardWrapper.appendChild(cardContent);
    cardWrapper.appendChild(cardLocationText);
    componentHandler.upgradeElement(cardWrapper);
    sharedMomentsArea.appendChild(cardWrapper);
}

//network first-Strategie implemntiert.
//Zugriff auf das Backend möglich ist, dann werden die Daten von dort geholt und
// auch dazu verwendet, um die Cards zu erstellen. Nur für den Fall, dass das Netzwerk nicht verfügbar ist,
// werden die aus der IndexedDB geholten Daten verwendet, um die Cards zu erstellen.
let networkDataReceived = false;

fetch('http://localhost:3000/posts')
    .then((res) => {
        return res.json();
    })
    .then((data) => {
        networkDataReceived = true;
        console.log('From backend ...', data);
        updateUI(data);
    })
    .catch( (err) => {//wenn nicht die Daten geholt werden dann
        if('indexedDB' in window) {//gucken ob Index API unterstützt wird
            readAllData('posts')//lesen alle daten aus posts
                .then( data => {
                    console.log('From cache ...', data);
                    updateUI(data);//werden die aus der IndexedDB geholten Daten verwendet, um die Cards zu erstellen
                })
        }
    });


function updateUI(data) {
    //geht alles Datensätze in der DB durch
    for(let card of data)
    {
        createCard(card);
    }

}
//Funktion wird dann aufgerufen schickt Daten zum Backend. Daten werden gepostet
function sendDataToBackend() {
    //neue FormData wird befüllt mit den geschrieben Ergebnissen
    const formData = new FormData();
    formData.append('title', titleValue);
    formData.append('content', contentValue);
    formData.append('location', locationValue);
    formData.append('file', file);

    console.log('formData', formData)

    fetch('http://localhost:3000/posts', {
        method: 'POST',
        body: formData
    })
        .then( response => {
            console.log('Data sent to backend ...', response);
            return response.json();
        })
        .then( data => {
            console.log('data ...', data);
            const newPost = {
                title: data.title,
                content: data.content,
                location: data.location,
                image_id: imageURI
            }
            updateUI([newPost]);
        });
}
//reagieren des Submit Button des Speicher-Buttons
form.addEventListener('submit', event => {
    event.preventDefault(); // nicht absenden und neu laden
    //Meldung wird angezeigt
    if (file == null) {
        alert('Erst Foto aufnehmen!')
        return;
    }
    //Die JavaScript-trim()-Funktionen entfernt "Leerzeichen" aller Art am Ende des Strings
    if (titleInput.value.trim() === '' || locationInput.value.trim() === '' || contentInput.value.trim() === '') {
        alert('Bitte Titel und Location und Inhalt angeben!')
        return;
    }

    closeCreatePostModal();

    //Werte werden befüllt
    titleValue = titleInput.value;
    locationValue = locationInput.value;
    contentValue = contentInput.value;
    //anzeigen in der Konsole der gegebene Werte
    console.log('titleInput', titleValue)
    console.log('contentInput', contentValue)
    console.log('locationInput', locationValue)
    console.log('file', file)

    sendDataToBackend();
});
//
captureButton.addEventListener('click', event => {
    event.preventDefault(); // nicht absenden und neu laden
    canvasElement.style.display = 'block';
    videoPlayer.style.display = 'none';
    captureButton.style.display = 'none';
    let context = canvasElement.getContext('2d');
    context.drawImage(videoPlayer, 0, 0, canvas.width, videoPlayer.videoHeight / (videoPlayer.videoWidth / canvas.width));
    videoPlayer.srcObject.getVideoTracks().forEach( track => {
        track.stop();
    })
    imageURI = canvas.toDataURL("image/jpg");
    // console.log('imageURI', imageURI)       // base64-String des Bildes

    fetch(imageURI)
        .then(res => {
            return res.blob()
        })
        .then(blob => {
            file = new File([blob], "myFile.jpg", { type: "image/jpg" })
            console.log('file', file)
        })
});

//Funktion zum Bilder hochladen
imagePicker.addEventListener('change', event => {
    file = event.target.files[0];
});

//Behandlung des click-Ereignisses für den Location-Button
//noch, wie für die Kamera, eine initializeLocation()-Funktion,
// in der geprüft wird, ob die Geolocation-API überhaupt im Browser verfügbar ist
locationButton.addEventListener('click', event => {
    if(!('geolocation' in navigator)) {//Falls nicht dann
        return;
    }
//Wenn auf den Button geklickt wurde, setzen wir den Button selbst auf unsichtbar und den Spinner (Loader) auf sichtbar
    locationButton.style.display = 'none';//sind grade versteckt
    locationLoader.style.display = 'block';//sichtbar
    //eigentlich Zugriff auf Standort über getCurrentPosition()----->>https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPosition & https://developer.mozilla.org/en-US/docs/Web/API/GeolocationCoordinates
    navigator.geolocation.getCurrentPosition( position => { //Callback -Funktion
        locationButton.style.display = 'inline';//Button wird sichtbar
        locationLoader.style.display = 'none';//Loader ist unsichtbar

        fetchedLocation = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        console.log('current position: ', fetchedLocation);

        let nominatimURL = 'https://nominatim.openstreetmap.org/reverse';
        nominatimURL += '?format=jsonv2';   // format=[xml|json|jsonv2|geojson|geocodejson]
        nominatimURL += '&lat=' + fetchedLocation.latitude;
        nominatimURL += '&lon=' + fetchedLocation.longitude;

        fetch(nominatimURL)
            .then((res) => {
                console.log('nominatim res ...', res);
                return res.json();
            })
            .then((data) => {
                console.log('nominatim res.json() ...', data);
                locationInput.value = data.display_name;
            })
            .catch( (err) => {
                console.error('err', err)
                locationInput.value = 'In Berlin';
            });

        document.querySelector('#manual-location').classList.add('is-focused');
    }, err => {
        console.log(err);
        locationButton.style.display = 'inline';
        locationLoader.style.display = 'none';
        alert('Couldn\'t fetch location, please enter manually!');


        fetchedLocation = null;//dritte Parameter ist ein JavaScript-Objekt mit options. Wir wählen hier nur eine einzige Option,
    }, { timeout: 5000}); // nämlich wie lange nach der aktuellen Position gesucht werden soll. In der Einstellung erfolgt der timeout nach 5 sek.
});
// geprüft, ob der Browser die Geolocation-API unterstützt
function initializeLocation() {
    if(!('geolocation' in navigator)) {//wenn nicht wird Location Button versteckt
        locationButton.style.display = 'none';
    }
}