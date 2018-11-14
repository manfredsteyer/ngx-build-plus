
import 'core-js/es6';

import * as fs from 'fs';
import * as path from 'path';
import { headersToString } from 'selenium-webdriver/http';

const domino = require('domino');

function main() {

    const outputPath = './dist/elements-loading';

    const indexPath = path.join(
        outputPath,
        'index.html'
    );

    const indexDocument = loadIndexHtml(indexPath);
    const legacyScripts = findLegacyScripts(indexDocument);
    const anchorElement = legacyScripts[0];
    
    setNoModuleFlag(legacyScripts);
    addModernScripts(outputPath, indexDocument, anchorElement);
    addPolyfill(outputPath, indexDocument, anchorElement);

    writeIndexHtml(indexPath, indexDocument);


}

function writeIndexHtml(indexPath: string, indexDocument: HTMLDocument) {
    fs.writeFileSync(indexPath + '.new', indexDocument['outerHTML'], { encoding: 'UTF-8' });
}

function findLegacyScripts(indexDocument: HTMLDocument) {
    const scripts = Array.from(indexDocument.getElementsByTagName('script'));
    const legacyScripts = scripts.filter(s => s.type === 'text/javascript' && s.src.endsWith('.legacy.js'));
    return legacyScripts;
}

function loadIndexHtml(indexPath: string) {
    const index = fs.readFileSync(indexPath, { encoding: 'UTF-8' });
    const indexDocument: HTMLDocument = domino.createDocument(index, true);
    return indexDocument;
}

function addPolyfill(outputPath: string, indexDocument: HTMLDocument, anchorElement: HTMLScriptElement) {
    const polyfillPath = path.join(
        outputPath, 'nomodule-polyfill.js');
    const polyfillScript = indexDocument.createElement('script');
    polyfillScript.src = 'nomodule-polyfill.js';
    anchorElement.parentElement.insertBefore(polyfillScript, anchorElement);
    // Workaround for nomodule in Safari 10
    // https://gist.github.com/samthor/64b114e4a4f539915a95b91ffd340acc
    const noModulePolyfill = '!function () { var e = document, t = e.createElement("script"); if (!("noModule" in t) && "onbeforeload" in t) { var n = !1; e.addEventListener("beforeload", function (e) { if (e.target === t) n = !0; else if (!e.target.hasAttribute("nomodule") || !n) return; e.preventDefault() }, !0), t.type = "module", t.src = ".", e.head.appendChild(t), t.remove() } }();';
    fs.writeFileSync(polyfillPath, noModulePolyfill, { encoding: 'UTF-8', flag: 'w' });
}

function setNoModuleFlag(legacyScripts: HTMLScriptElement[]) {
    legacyScripts.forEach(s => s.setAttribute('nomodule', ''));
}

function addModernScripts(outputPath: string, indexDocument: HTMLDocument, firstLegacyScript: HTMLScriptElement) {
    const modernIndexPath = path.join(
        outputPath, 'index.modern.html');
    const modernIndex = fs.readFileSync(modernIndexPath, { encoding: 'UTF-8' });
    const modernIndexDocument: HTMLDocument = domino.createDocument(modernIndex, true);
    
    const heads = indexDocument.getElementsByTagName('head');
    console.assert(heads.length > 0, '<head>...</head> in index.html expected');
    const head = heads[0];
    
    const titles = head.getElementsByTagName('title');
    console.assert(heads.length > 0, '<head><title>...</title></head> in index.html expected');
    const title = titles[0];
    const preloadAnchor = title.nextSibling;

    const links = Array.from(indexDocument.getElementsByTagName('link'));
    const styles = links.filter(l => l.rel === 'stylesheet');

    styles.forEach(s => {
        const preloadLink = indexDocument.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.setAttribute('as', 'style');
        preloadLink.href = s.href;
        head.insertBefore(preloadLink, preloadAnchor);
     });

    const scripts = Array.from(modernIndexDocument.getElementsByTagName('script'));
    const modernScripts = scripts.filter(s => s.type === 'text/javascript' && s.src.endsWith('.modern.js'));

    modernScripts.forEach(s => {
        indexDocument.adoptNode(s);
        s.type = 'module';
        firstLegacyScript.parentElement.insertBefore(s, firstLegacyScript);

        const preloadLink = indexDocument.createElement('link');
        preloadLink.rel = 'modulepreload';
        preloadLink.setAttribute('as', 'script');
        preloadLink.href = s.src;
        head.insertBefore(preloadLink, preloadAnchor);
    });

    
}

main();