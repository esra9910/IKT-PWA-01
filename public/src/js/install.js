
    const installButton = document.getElementById('install');
    console.log('installButton', installButton)
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', evt => {
    console.log(evt.platforms); // e.g., ["web", "android", "windows"]
    evt.preventDefault();
    deferredPrompt = evt;
    installButton.style.display = 'block';
})

    installButton.addEventListener('click', async () => {
    await deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    console.log(choiceResult.outcome);
});

    window.addEventListener('appinstalled', () => {
    installButton.style.display = 'none';
})

