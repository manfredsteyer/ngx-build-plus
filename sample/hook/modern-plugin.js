"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var domino = require('domino');
// TODO: PR that allows skipping options.verbose = true; 
// TODO: Custom Elements Polyfill
// TODO: Schematics
exports.default = {
    pre: function (builderConfig) {
        var options = builderConfig.options;
        // Printing the non-verbose summary at the end
        // causes some troubles in the CLI's code if
        // the webpack config is an array of configurations
        // like [legacyConfig, modernConfig]
        options.verbose = true;
    },
    config: function (config) {
        console.debug('config', config);
        // Preventing too much unneeded warnings
        config.stats.warningsFilter = /Terser Plugin/;
        var legacyConfig = __assign({}, config, { output: buildLegacyOutput(config) });
        var modernConfig = __assign({}, config, { output: buildModernOutput(config), plugins: buildModernPlugins(config), entry: buildModernEntry(config), resolve: buildModernResolve(config) });
        var newConfig = [legacyConfig, modernConfig];
        // The CLI expects this stats property
        newConfig['stats'] = __assign({}, config.stats);
        return newConfig;
    },
    post: function (builderConfig) {
        var outputPath = builderConfig.options.outputPath;
        var indexPath = path.join(outputPath, 'index.html');
        var indexDocument = loadIndexHtml(indexPath);
        var legacyScripts = findLegacyScripts(indexDocument);
        var anchorElement = legacyScripts[0];
        setNoModuleFlag(legacyScripts);
        addModernElements(outputPath, indexDocument, anchorElement);
        addPolyfill(outputPath, indexDocument, anchorElement);
        writeIndexHtml(indexPath, indexDocument);
    }
};
function writeIndexHtml(indexPath, indexDocument) {
    fs.writeFileSync(indexPath, indexDocument['outerHTML'], { encoding: 'UTF-8' });
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
function addModernElements(outputPath, indexDocument, firstLegacyScript) {
    var modernIndexPath = path.join(outputPath, 'index.modern.html');
    var modernIndex = fs.readFileSync(modernIndexPath, { encoding: 'UTF-8' });
    var modernIndexDocument = domino.createDocument(modernIndex, true);
    insertPreloadStyles(indexDocument);
    var scripts = Array.from(modernIndexDocument.getElementsByTagName('script'));
    var modernScripts = scripts.filter(function (s) { return s.type === 'text/javascript' && s.src.endsWith('.modern.js'); });
    modernScripts.forEach(function (script) {
        indexDocument.adoptNode(script);
        script.type = 'module';
        firstLegacyScript.parentElement.insertBefore(script, firstLegacyScript);
        insertPreloadScript(indexDocument, script);
    });
    moveStylesToEndOfHead(indexDocument);
}
function findPreloadAnchor(indexDocument) {
    var heads = Array.from(indexDocument.getElementsByTagName('head'));
    console.assert(heads.length === 1, 'exactly one head tag in index.html expected');
    var head = heads[0];
    return head;
}
function insertPreloadScript(indexDocument, script) {
    var preloadAnchor = findPreloadAnchor(indexDocument);
    var preloadLink = indexDocument.createElement('link');
    preloadLink.rel = 'modulepreload';
    preloadLink.setAttribute('as', 'script');
    preloadLink.href = script.src;
    preloadAnchor.appendChild(preloadLink);
}
function insertPreloadStyles(indexDocument) {
    var preloadAnchor = findPreloadAnchor(indexDocument);
    var links = Array.from(indexDocument.getElementsByTagName('link'));
    var styles = links.filter(function (l) { return l.rel === 'stylesheet'; });
    styles.forEach(function (s) {
        var preloadLink = indexDocument.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.setAttribute('as', 'style');
        preloadLink.href = s.href;
        preloadAnchor.appendChild(preloadLink);
    });
}
function moveStylesToEndOfHead(indexDocument) {
    var preloadAnchor = findPreloadAnchor(indexDocument);
    var links = Array.from(indexDocument.getElementsByTagName('link'));
    var styles = links.filter(function (l) { return l.rel === 'stylesheet'; });
    styles.forEach(function (s) {
        s.remove();
        preloadAnchor.appendChild(s);
    });
}
function buildLegacyOutput(config) {
    return __assign({}, config.output, { filename: '[name].legacy.js' });
}
function buildModernOutput(config) {
    return __assign({}, config.output, { filename: '[name].modern.js' });
}
function buildModernResolve(config) {
    var modernResolve = __assign({}, config.reolve);
    modernResolve.mainFields = ['es2015', 'module', 'browser', 'main'];
    return modernResolve;
}
function buildModernEntry(config) {
    var entry = config.entry;
    var polyfills = entry.polyfills;
    var tweakPolyfills = function (file) {
        if (file.endsWith('polyfills.ts')) {
            return file.replace('polyfills.ts', 'polyfills.modern.ts');
        }
        else {
            return file;
        }
    };
    var modernPolyfills = polyfills.map(tweakPolyfills);
    var modernEntry = __assign({}, entry, { polyfills: modernPolyfills });
    return modernEntry;
}
function buildModernPlugins(config) {
    var plugins = config.plugins;
    var modernPlugins = plugins.slice();
    var acpIndex = plugins.findIndex(function (p) { return p.constructor.name === 'AngularCompilerPlugin'; });
    var acp = plugins[acpIndex];
    var modernAcp = buildModernAcp(acp);
    modernPlugins[acpIndex] = modernAcp;
    var htmlPluginIndex = plugins.findIndex(function (p) { return p.constructor.name === 'IndexHtmlWebpackPlugin'; });
    var htmlPlugin = plugins[htmlPluginIndex];
    var modernHtmlPlugin = buildModernHtmlPlugin(htmlPlugin);
    modernPlugins[htmlPluginIndex] = modernHtmlPlugin;
    return modernPlugins;
}
function buildModernHtmlPlugin(htmlPlugin) {
    var indexOptions = htmlPlugin._options;
    var modernIndexOptions = __assign({}, indexOptions);
    modernIndexOptions.output = 'index.modern.html';
    var modernHtmlPlugin = new htmlPlugin.constructor(modernIndexOptions);
    return modernHtmlPlugin;
}
function buildModernAcp(acp) {
    var options = acp._options;
    var modernOptions = __assign({}, options);
    modernOptions.tsConfigPath = modernOptions.tsConfigPath.replace('tsconfig.app.json', 'tsconfig.modern.app.json');
    var modernAcp = new acp.constructor(modernOptions);
    return modernAcp;
}
