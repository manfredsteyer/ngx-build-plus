"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("core-js/es6");
var fs = require("fs");
var path = require("path");
var domino = require('domino');
function main() {
    var outputPath = './dist/elements-loading';
    var indexPath = path.join(outputPath, 'index.html');
    var indexDocument = loadIndexHtml(indexPath);
    var legacyScripts = findLegacyScripts(indexDocument);
    var anchorElement = legacyScripts[0];
    setNoModuleFlag(legacyScripts);
    addModernScripts(outputPath, indexDocument, anchorElement);
    addPolyfill(outputPath, indexDocument, anchorElement);
    writeIndexHtml(indexPath, indexDocument);
}
function writeIndexHtml(indexPath, indexDocument) {
    fs.writeFileSync(indexPath + '.new', indexDocument['outerHTML'], { encoding: 'UTF-8' });
}
function findLegacyScripts(indexDocument) {
    var scripts = Array.from(indexDocument.getElementsByTagName('script'));
    var legacyScripts = scripts.filter(function (s) { return s.type === 'text/javascript' && s.src.endsWith('.legacy.js'); });
    return legacyScripts;
}
function loadIndexHtml(indexPath) {
    var index = fs.readFileSync(indexPath, { encoding: 'UTF-8' });
    var indexDocument = domino.createDocument(index, true);
    return indexDocument;
}
function addPolyfill(outputPath, indexDocument, anchorElement) {
    var polyfillPath = path.join(outputPath, 'nomodule-polyfill.js');
    var polyfillScript = indexDocument.createElement('script');
    polyfillScript.src = 'nomodule-polyfill.js';
    anchorElement.parentElement.insertBefore(polyfillScript, anchorElement);
    // Workaround for nomodule in Safari 10
    // https://gist.github.com/samthor/64b114e4a4f539915a95b91ffd340acc
    var noModulePolyfill = '!function () { var e = document, t = e.createElement("script"); if (!("noModule" in t) && "onbeforeload" in t) { var n = !1; e.addEventListener("beforeload", function (e) { if (e.target === t) n = !0; else if (!e.target.hasAttribute("nomodule") || !n) return; e.preventDefault() }, !0), t.type = "module", t.src = ".", e.head.appendChild(t), t.remove() } }();';
    fs.writeFileSync(polyfillPath, noModulePolyfill, { encoding: 'UTF-8', flag: 'w' });
}
function setNoModuleFlag(legacyScripts) {
    legacyScripts.forEach(function (s) { return s.setAttribute('nomodule', ''); });
}
function addModernScripts(outputPath, indexDocument, firstLegacyScript) {
    var modernIndexPath = path.join(outputPath, 'index.modern.html');
    var modernIndex = fs.readFileSync(modernIndexPath, { encoding: 'UTF-8' });
    var modernIndexDocument = domino.createDocument(modernIndex, true);
    var heads = indexDocument.getElementsByTagName('head');
    console.assert(heads.length > 0, '<head>...</head> in index.html expected');
    var head = heads[0];
    var titles = head.getElementsByTagName('title');
    console.assert(heads.length > 0, '<head><title>...</title></head> in index.html expected');
    var title = titles[0];
    var preloadAnchor = title.nextSibling;
    var links = Array.from(indexDocument.getElementsByTagName('link'));
    var styles = links.filter(function (l) { return l.rel === 'stylesheet'; });
    styles.forEach(function (s) {
        var preloadLink = indexDocument.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.setAttribute('as', 'style');
        preloadLink.href = s.href;
        head.insertBefore(preloadLink, preloadAnchor);
    });
    var scripts = Array.from(modernIndexDocument.getElementsByTagName('script'));
    var modernScripts = scripts.filter(function (s) { return s.type === 'text/javascript' && s.src.endsWith('.modern.js'); });
    modernScripts.forEach(function (s) {
        indexDocument.adoptNode(s);
        s.type = 'module';
        firstLegacyScript.parentElement.insertBefore(s, firstLegacyScript);
        var preloadLink = indexDocument.createElement('link');
        preloadLink.rel = 'modulepreload';
        preloadLink.setAttribute('as', 'script');
        preloadLink.href = s.src;
        head.insertBefore(preloadLink, preloadAnchor);
    });
}
main();
