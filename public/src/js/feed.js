/*
Karte wenn die erstellt wird
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

function createCard() {//erstellung der Karte
    let cardWrapper = document.createElement('div');
    cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
    cardWrapper.style.width='200px';
    cardWrapper.style.borderRadius='10px';
    cardWrapper.style.borderColor='white';
    cardWrapper.style.borderStyle='solid';
    let cardTitle = document.createElement('div');
    cardTitle.className = 'mdl-card__title';
    cardTitle.style.backgroundImage = 'url("/src/images/Book.jpeg")';
    cardTitle.style.backgroundSize = 'cover';
    cardTitle.style.height = '300px';
    cardWrapper.appendChild(cardTitle);
    let cardTitleTextElement = document.createElement('h4');
    cardTitleTextElement.className = 'mdl-card__title-text';
    cardTitle.appendChild(cardTitleTextElement);
    let cardSupportingText = document.createElement('div');
    cardSupportingText.className = 'mdl-card__supporting-text';
    cardSupportingText.textContent = 'It Ends with Us';
    cardSupportingText.style.textAlign = 'center';
    cardWrapper.appendChild(cardSupportingText);
    componentHandler.upgradeElement(cardWrapper);
    sharedMomentsArea.appendChild(cardWrapper);
}

fetch('https://httpbin.org/get')
    .then(function(res) {
        return res.json();
    })
    .then(function(data) {
        createCard();
    });