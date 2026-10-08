// Kelime Ezber PWA App JS Helpers
window.appJs = {
    speak: function (text) {
        if (!('speechSynthesis' in window)) {
            console.warn('Speech synthesis not supported');
            return;
        }
        try {
            window.speechSynthesis.cancel();
            const cleanText = text.replace(/[\(\)\/\*\=\d]/g, '').trim();
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.lang = 'en-US';
            utterance.rate = 0.88;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
        } catch (e) {
            console.error('TTS error:', e);
        }
    },

    downloadFile: function (filename, content) {
        try {
            const blob = new Blob([content], { type: 'application/json;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            this.showToast('Yedek başarıyla indirildi!');
        } catch (e) {
            console.error('Download error:', e);
            alert('Dosya indirme hatası: ' + e.message);
        }
    },

    triggerLevelUpVibration: function () {
        if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 200, 50, 300]);
        }
    },

    triggerAnswerVibration: function (isCorrect) {
        if ('vibrate' in navigator) {
            if (isCorrect) {
                navigator.vibrate([40]);
            } else {
                navigator.vibrate([80, 50, 80]);
            }
        }
    },

    showToast: function (message) {
        let toast = document.getElementById('app-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'app-toast';
            toast.className = 'app-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(window._toastTimer);
        window._toastTimer = setTimeout(() => {
            toast.classList.remove('show');
        }, 2600);
    }
};
