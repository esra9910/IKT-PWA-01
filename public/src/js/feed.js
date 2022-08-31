/*
Karte wenn die erstellt wird
 */

let shareImageButton = document.querySelector('#share-image-button');//Button vom index.html auslöser
let createPostArea = document.querySelector('#create-post');//ganze Inputfelder-Div
let closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');//close Button X
let sharedMomentsArea = document.querySelector('#shared-moments');//shared Moment Id im page Content
//Alle Input felder und Button der Seite werden initialisert

function openCreatePostModal() {
  createPostArea.style.display = 'block';//block verwandelt ein Inline-Element (Element, das keinen Zeilenumbruch erzeugt) in ein Blockelement, das zu einem Zeilenumbruch führt.
  // Umgekehrt transformiert die Eigenschaft display: inline ein Blockelement in ein Inline-Element.
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';//versteckt element
}

shareImageButton.addEventListener('click', openCreatePostModal);//eventlistener bei Click und bei Funktionsaufruf

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);//bei Click und Funktionsaufruf

function createCard() {
  let cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  let cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url("/src/images/htw-gebaeude-h.jpg")';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  let cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = 'Vor der HTW-Mensa';
  cardTitle.appendChild(cardTitleTextElement);
  let cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = 'HTW Berlin';
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