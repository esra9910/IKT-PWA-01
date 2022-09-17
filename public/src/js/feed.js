/**
 * Daten werden aus der DB angezeigt
 * KARTEN werden erstellt
 *
 */
//Alle Input felder und Button der Seite werden initialisert
let shareImageButton = document.querySelector('#share-image-button');
let createPostArea = document.querySelector('#create-post');
let closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
let sharedMomentsArea = document.querySelector('#shared-moments'); //Div in index.html

//block verwandelt ein Inline-Element (Element, das keinen Zeilenumbruch erzeugt) in ein Blockelement, das zu einem Zeilenumbruch führt.
// Umgekehrt transformiert die Eigenschaft display: inline ein Blockelement in ein Inline-Element.
function openCreatePostModal() {
    createPostArea.style.display = 'block';
}

function closeCreatePostModal() {
    createPostArea.style.display = 'none';//versteckt element
}

shareImageButton.addEventListener('click', openCreatePostModal);//eventlistener bei Click und bei Funktionsaufruf

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);
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
    cardTitle.style.height = '180px';
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