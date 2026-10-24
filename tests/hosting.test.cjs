// Run with: node tests/hosting.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const root = path.resolve(__dirname, '..');
const adapter = fs.readFileSync(path.join(root, 'js/hosting-compat.js'), 'utf8');
function setup(baseURI = 'https://example.test/yayinlanacakKlasor/') {
    const calls = [];
    const receive = (...args) => { calls.push(args); return 'received'; };
    const Blazor = {navigateTo: receive, _internal: {navigationManager: {navigateTo: receive}}};
    vm.runInNewContext(adapter, {window: {Blazor}, document: {baseURI}, URL});
    return {Blazor, calls};
}
test('all known root routes stay under the publication path', () => {
    const {Blazor, calls} = setup();
    for (const route of ['', 'kartlar', 'test', 'quiz', 'gorevler', 'sozluk', 'yedek', 'eslestirme']) {
        Blazor._internal.navigationManager.navigateTo('/' + route, {forceLoad: false});
        assert.equal(calls.at(-1)[0], 'https://example.test/yayinlanacakKlasor/' + route);
    }
});
test('query, fragment, navigation options and return value survive', () => {
    const {Blazor, calls} = setup();
    const options = {forceLoad: true, replaceHistoryEntry: true, historyEntryState: 'test'};
    assert.equal(Blazor._internal.navigationManager.navigateTo('/kartlar?q=word#card', options), 'received');
    assert.deepEqual(calls[0], ['https://example.test/yayinlanacakKlasor/kartlar?q=word#card', options]);
});
test('public navigation also keeps the publication prefix', () => {
    const {Blazor, calls} = setup();
    Blazor.navigateTo('/kartlar', true, true);
    assert.deepEqual(calls[0], ['https://example.test/yayinlanacakKlasor/kartlar', true, true]);
});
test('external URLs, assets, unknown paths and already-prefixed URLs stay untouched', () => {
    const {Blazor, calls} = setup();
    for (const uri of ['https://other.test/kartlar', '/other', '/data/words.json', '/yayinlanacakKlasor/kartlar', 'kartlar']) {
        Blazor.navigateTo(uri, false);
        assert.equal(calls.at(-1)[0], uri);
    }
});
test('root-hosted publication stays unchanged', () => {
    const {Blazor, calls} = setup('https://example.test/');
    Blazor.navigateTo('/kartlar');
    assert.equal(calls[0][0], '/kartlar');
});
test('both entry documents install the adapter before starting Blazor', () => {
    for (const name of ['index.html', '404.html']) {
        const html = fs.readFileSync(path.join(root,name), 'utf8');
        assert.match(html, /blazor\.webassembly\.js" autostart="false"/);
        assert.ok(html.indexOf('js/hosting-compat.js') < html.indexOf('Blazor.start()'));
    }
});
test('offline manifest hashes match every published asset', () => {
    const context = {self: {}};
    vm.runInNewContext(fs.readFileSync(path.join(root,'service-worker-assets.js'),'utf8'),context);
    const assets = context.self.assetsManifest.assets;
    assert.ok(assets.some(a=>a.url==='js/hosting-compat.js'));
    for (const asset of assets) {
        const bytes = fs.readFileSync(path.join(root,asset.url));
        const published = /\.(html|js|json|css|map|webmanifest)$/.test(asset.url)
            ? Buffer.from(bytes.toString('utf8').replace(/\r\n/g,'\n')) : bytes;
        const digest = crypto.createHash('sha256').update(published).digest('base64');
        assert.equal(asset.hash, 'sha256-' + digest, asset.url);
    }
});
test('compressed entry documents and worker files match current originals', () => {
    for (const name of ['index.html','404.html','service-worker.js','service-worker-assets.js']) {
        const original = fs.readFileSync(path.join(root,name));
        assert.deepEqual(zlib.gunzipSync(fs.readFileSync(path.join(root,name+'.gz'))),original,name+'.gz');
        assert.deepEqual(zlib.brotliDecompressSync(fs.readFileSync(path.join(root,name+'.br'))),original,name+'.br');
    }
});
