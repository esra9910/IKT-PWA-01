/**
 * Daten werden aus der DB angezeigt
 * KARTEN werden erstellt
 * - Mit JQery werden die Daten zum Backend geschickt
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
let videoPlayer = document.querySelector('#player');
let canvasElement = document.querySelector('#canvas');
let captureButton = document.querySelector('#capture-btn');
let imagePicker = document.querySelector('#image-picker');
let imagePickerArea = document.querySelector('#pick-image');


//Erstellung der Karten
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
    image.src = card.image_id;//als Image id gespeichert
    cardTitle.style.backgroundImage = 'url('+ image.src +')';//Bild auf der Karte hinzugefügt und angezeziegt
    cardTitle.style.backgroundSize = 'cover';
    //cardTitle.style.height = '180px';
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
    //let cardContent = document.createElement('div');
    //cardContent.className = 'mdl-card__supporting-text';
    //cardContent.textContent=card.content;
    //cardContent.style.textAlign='center';
    //Hinzufügen zur Karte
    cardWrapper.appendChild(cardSupportingText);
    // cardWrapper.appendChild(cardContent);
    cardWrapper.appendChild(cardLocationText);
    componentHandler.upgradeElement(cardWrapper);
    sharedMomentsArea.appendChild(cardWrapper);
}


//block verwandelt ein Inline-Element (Element, das keinen Zeilenumbruch erzeugt) in ein Blockelement, das zu einem Zeilenumbruch führt.
// Umgekehrt transformiert die Eigenschaft display: inline ein Blockelement in ein Inline-Element.
function openCreatePostModal() {
    //Timeset setzen wir da die kamera die ganze Zeit läuft wir wollen das nicht deswegen setzten wir eine Zeit auf beim Öffnen und schließen
    /*setTimeout( () => {
        createPostArea.style.transform = 'translateY(0)';
    }, 1);*/
    createPostArea.style.display = 'block';
    initializeMedia();
}

function closeCreatePostModal() {
    createPostArea.style.display = 'none';//versteckt element
    imagePickerArea.style.display = 'none';
    videoPlayer.style.display = 'none';
    canvasElement.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);//eventlistener bei Click und bei Funktionsaufruf

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

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
    });

if('indexedDB' in window) {//gucken ob Index API unterstützt wird
    readAllData('posts')//lesen alle daten aus posts
        .then( data => {
            if(!networkDataReceived) {//wenn nicht die Daten geholt werden dann
                console.log('From cache ...', data);
                updateUI(data)//werden die aus der IndexedDB geholten Daten verwendet, um die Cards zu erstellen
            }
        })
}
function updateUI(data) {
    //geht alles Datensätze in der DB durch
    for(let card of data)
    {
        createCard(card);
    }

}
let file = null;
let titleValue = '';
let locationValue = '';
let contentValue = '';
let imageURI = '';

//reagieren des Submit Button des Speicher-Buttons
form.addEventListener('submit', event => {
    event.preventDefault(); // nicht absenden und neu laden
    if (file == null) {//Meldung für Foto
        alert('Erst Foto aufnehmen!')
        return;
    }
    //falls leer dann Nachricht angeben
    if (titleInput.value.trim() === '' || locationInput.value.trim() === '' || contentInput.value.trim() === '') {
        alert('Bitte Titel,Location und Inhalt angeben!')
        return;
    }

    closeCreatePostModal();
    titleValue = titleInput.value;
    locationValue = locationInput.value;
    contentValue = contentInput.value;

    sendDataToBackend();
});

//Funktion wird dann aufgerufen schickt Daten zum Backend
function sendDataToBackend() {
    const formData = new FormData();
    formData.append('title', titleValue);
    formData.append('location', locationValue);
    formData.append('content', contentValue);
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
                location: data.location,
                content: data.content,
                image_id: imageURI
            }
            updateUI([newPost]);
        });
}

form.addEventListener('submit', event => {
    event.preventDefault(); // nicht absenden und neu laden

    if (file == null) {
        alert('Erst Foto aufnehmen!')
        return;
    }
    if (titleInput.value.trim() === '' || locationInput.value.trim() === '' || contentInput.value.trim() === '') {
   // if (titleInput.value.trim() === '' || locationInput.value.trim() === '') {
        alert('Bitte Titel, Inhalt und Location angeben!')
        return;
    }

    closeCreatePostModal();

    titleValue = titleInput.value;
    locationValue = locationInput.value;
    contentValue = contentInput.value;
    sendDataToBackend();
});
//Click event des Foto Buttons
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
//Zum Uploaden von Bilder
imagePicker.addEventListener('change', event => {
    file = event.target.files[0];
});