//JS-FILE FOR BEFORE INSTALL BUTTON

//id Install holen und in Variable  speichern
//Button ist auf display:none dann wird es

const installButton = document.getElementById('install');
console.log('installButton', installButton)
let deferredPrompt;
//Eventlistener BeforInstall
window.addEventListener('beforeinstallprompt', evt => {
    console.log(evt.platforms); // e.g., ["web", "android", "windows"]
    evt.preventDefault();
    deferredPrompt = evt;
    installButton.style.display = 'block';//style= display ; Hier wird der button blockiert und nicht mehr angeziegt
})

installButton.addEventListener('click', async () => {
    await deferredPrompt.prompt();//Popup erscheint
    const choiceResult = await deferredPrompt.userChoice;//Nutzer entscheidet
    console.log(choiceResult.outcome);
});

window.addEventListener('appinstalled', () => {
    installButton.style.display = 'none';
})
