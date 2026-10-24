// Compatibility adapter for this precompiled Blazor publication.
// The original assembly uses root-relative navigation, but GitHub Pages
// publishes this application under /yayinlanacakKlasor/.
// Load after blazor.webassembly.js and before Blazor.start().
(function () {
    'use strict';
    const base = new URL(document.baseURI);
    const routes = new Set([
        '', 'kartlar', 'cards', 'quiz', 'test', 'gorevler', 'missions',
        'sozluk', 'dictionary', 'yedek', 'backup', 'eslestirme', 'match'
    ]);

    function applicationUrl(uri) {
        const target = new URL(uri, base);
        if (target.origin !== base.origin || base.pathname === '/' ||
            target.pathname.startsWith(base.pathname)) {
            return uri;
        }
        const route = target.pathname.replace(/^\/+|\/+$/g, '');
        if (!routes.has(route)) return uri;
        return new URL(route + target.search + target.hash, base).href;
    }

    const manager = window.Blazor && window.Blazor._internal &&
        window.Blazor._internal.navigationManager;
    if (!manager || typeof manager.navigateTo !== 'function') {
        throw new Error('Blazor navigation adapter could not be installed.');
    }
    const navigate = manager.navigateTo;
    manager.navigateTo = function (uri, ...options) {
        return navigate.call(this, applicationUrl(uri), ...options);
    };
    const publicNavigate = window.Blazor.navigateTo;
    window.Blazor.navigateTo = function (uri, ...options) {
        return publicNavigate.call(this, applicationUrl(uri), ...options);
    };
})();
