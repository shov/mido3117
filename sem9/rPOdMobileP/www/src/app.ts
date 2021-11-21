document.addEventListener('deviceready', () => {
    // @ts-ignore


    (window as any).plugins.screensize.get((o: any) => {
        document.getElementById('out')!.innerHTML += JSON.stringify(o)
    }, (o: any) => {
        document.getElementById('out')!.innerHTML += JSON.stringify(o)
    })

    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version)
    document.getElementById('deviceready')!.classList.add('ready')
}, false)
