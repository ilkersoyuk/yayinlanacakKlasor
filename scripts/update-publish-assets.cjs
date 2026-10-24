// Rebuild offline asset integrity and the changed precompressed files.
// Run after changing publication files: node scripts/update-publish-assets.cjs
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const root = path.resolve(__dirname, '..');
const manifestPath = path.join(root, 'service-worker-assets.js');
const context = {self: {}};
vm.runInNewContext(fs.readFileSync(manifestPath, 'utf8'), context);
const manifest = context.self.assetsManifest;
const urls = new Set(manifest.assets.map(a => a.url));
urls.add('js/hosting-compat.js');
manifest.assets = [...urls].sort().map(url => ({
    hash: 'sha256-' + crypto.createHash('sha256').update(publishedBytes(url)).digest('base64'),
    url
}));
manifest.version = crypto.createHash('sha256').update(JSON.stringify(manifest.assets)).digest('hex').slice(0,16);
fs.writeFileSync(manifestPath, 'self.assetsManifest = ' + JSON.stringify(manifest,null,2) + ';\n');
const workerPath = path.join(root,'service-worker.js');
fs.writeFileSync(workerPath,fs.readFileSync(workerPath,'utf8').replace(/\r\n/g,'\n').replace(/\/\* Manifest version: .*? \*\//,'/* Manifest version: '+manifest.version+' */'));
for (const name of ['index.html','404.html','service-worker.js','service-worker-assets.js']) {
    const bytes = fs.readFileSync(path.join(root,name));
    fs.writeFileSync(path.join(root,name+'.gz'),zlib.gzipSync(bytes));
    fs.writeFileSync(path.join(root,name+'.br'),zlib.brotliCompressSync(bytes));
}
console.log('Publication updated:', manifest.version, 'assets:', manifest.assets.length);
function publishedBytes(url) {
    const bytes = fs.readFileSync(path.join(root,url));
    // .gitattributes stores published text as LF, even on Windows checkouts.
    return /\.(html|js|json|css|map|webmanifest)$/.test(url)
        ? Buffer.from(bytes.toString('utf8').replace(/\r\n/g,'\n')) : bytes;
}
