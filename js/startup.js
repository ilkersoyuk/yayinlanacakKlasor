(async function () {
    function fail(message) {
        const app = document.getElementById('app');
        app.textContent = message;
        app.style.cssText = 'padding:40px;font:18px sans-serif;white-space:pre-wrap';
    }
    if (location.protocol === 'file:') {
        fail('Bu uygulama dosya olarak açılamaz. Klasördeki BASLAT.bat dosyasını çalıştırın veya python serve.py komutunu kullanın. Ardından http://localhost:8000 adresini açın.');
        return;
    }
    let timer = setTimeout(() => {
        document.getElementById('blazor-error-ui').style.display = 'block';
    }, 45000);
    try {
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = new URL('_framework/blazor.webassembly.js', document.baseURI);
            script.setAttribute('autostart', 'false');
            script.onload = resolve;
            script.onerror = () => reject(new Error('Blazor dosyası yüklenemedi. Yayın klasörünü kontrol edin.'));
            document.body.appendChild(script);
        });
        await Blazor.start();
        clearTimeout(timer);
        document.getElementById('blazor-error-ui').style.display = 'none';
        if ('serviceWorker' in navigator && window.isSecureContext) {
            navigator.serviceWorker.register(new URL('service-worker.js', document.baseURI), {updateViaCache: 'none'})
                .catch(error => console.warn('Çevrimdışı destek başlatılamadı:', error));
        }
    } catch (error) {
        clearTimeout(timer);
        console.error(error);
        fail('Uygulama başlatılamadı. İnternet bağlantısını ve yayın dosyalarını kontrol edin.\n' + error.message);
    }
})();
