import * as fs from 'fs';
import * as path from 'path';

const domino = require('domino');

const SUFFIX_MODERN = 'modern';
const SUFFIX_LEGACY = 'legacy';

// TODO: PR that allows skipping options.verbose = true; 

export default {
    pre(builderConfig) {
        const options = builderConfig.options;
        
        // Printing the non-verbose summary at the end
        // causes some troubles in the CLI's code if
        // the webpack config is an array of configurations
        // like [legacyConfig, modernConfig]
        options.verbose = true;
    },
    config(config) {

        // Preventing too much unneeded warnings
        if (!config['stats']) {
            config['stats'] = {};
        }
        config.stats.warningsFilter = /./;
        
        const legacyConfig = {
            ...config, 
            output: buildOutput(config, SUFFIX_LEGACY)
        };
        
        const modernConfig = {
            ...config, 
            output: buildOutput(config, SUFFIX_MODERN),
            plugins: buildModernPlugins(config),
            entry: buildModernEntry(config),
            resolve: buildModernResolve(config)
        };

        const newConfig = [legacyConfig, modernConfig];

        // The CLI expects this stats property
        newConfig['stats'] = {
            ...config.stats,
        }
        
        return newConfig;
    },
    post(builderConfig) {

        const outputPath = builderConfig.options.outputPath;

        const indexPath = path.join(
            outputPath,
            'index.html'
        );
    
        const indexDocument = loadIndexHtml(indexPath);
        const legacyScripts = findLegacyScripts(indexDocument);
        
        console.assert(legacyScripts.length > 0, '<script> tags in in index.html expected')

        const anchorElement = legacyScripts[0];

        setNoModuleFlag(legacyScripts);
        addModernElements(outputPath, indexDocument, anchorElement);
        addPolyfill(outputPath, indexDocument, anchorElement);
    
        writeIndexHtml(indexPath, indexDocument);
    
    }
}

function writeIndexHtml(indexPath: string, indexDocument: HTMLDocument) {
    fs.writeFileSync(indexPath, indexDocument['outerHTML'], { encoding: 'UTF-8' });
}

function findLegacyScripts(indexDocument: HTMLDocument) {
    const scripts = Array.from(indexDocument.getElementsByTagName('script'));
    const legacyScripts = scripts.filter(s => s.type === 'text/javascript' && s.src.includes(`.${SUFFIX_LEGACY}.`));
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

function addModernElements(outputPath: string, indexDocument: HTMLDocument, firstLegacyScript: HTMLScriptElement) {
    const modernIndexPath = path.join(
        outputPath, `index.${SUFFIX_MODERN}.html`);
    const modernIndex = fs.readFileSync(modernIndexPath, { encoding: 'UTF-8' });
    const modernIndexDocument: HTMLDocument = domino.createDocument(modernIndex, true);
    
    insertPreloadStyles(indexDocument);

    const scripts = Array.from(modernIndexDocument.getElementsByTagName('script'));
    const modernScripts = scripts.filter(s => s.type === 'text/javascript' && s.src.includes(`.${SUFFIX_MODERN}.`));

    modernScripts.forEach(script => {
        indexDocument.adoptNode(script);
        script.type = 'module';
        firstLegacyScript.parentElement.insertBefore(script, firstLegacyScript);

        insertPreloadScript(indexDocument, script);
    });

    moveStylesToEndOfHead(indexDocument);
   
}

function findPreloadAnchor(indexDocument: HTMLDocument) {
    const heads = Array.from(indexDocument.getElementsByTagName('head'));
    console.assert(heads.length === 1, 'exactly one head tag in index.html expected');
    const head = heads[0];
    return head;
}

function insertPreloadScript(indexDocument: HTMLDocument, script: HTMLScriptElement) {
    const preloadAnchor = findPreloadAnchor(indexDocument);
    const preloadLink = indexDocument.createElement('link');
    preloadLink.rel = 'modulepreload';
    preloadLink.setAttribute('as', 'script');
    preloadLink.href = script.src;

    preloadAnchor.appendChild(preloadLink);
}

function insertPreloadStyles(indexDocument: HTMLDocument) {

    const preloadAnchor = findPreloadAnchor(indexDocument);

    const links = Array.from(indexDocument.getElementsByTagName('link'));
    const styles = links.filter(l => l.rel === 'stylesheet');
    styles.forEach(s => {
        const preloadLink = indexDocument.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.setAttribute('as', 'style');
        preloadLink.href = s.href;
        preloadAnchor.appendChild(preloadLink);
    });
}

function moveStylesToEndOfHead(indexDocument: HTMLDocument) {
    const preloadAnchor = findPreloadAnchor(indexDocument);
    const links = Array.from(indexDocument.getElementsByTagName('link'));
    const styles = links.filter(l => l.rel === 'stylesheet');
    styles.forEach(s => {
        s.remove();
        preloadAnchor.appendChild(s);
    })
}

function buildOutput(config: any, suffix: string) {
    const filename = config.output.filename.replace('[name]', `[name].${suffix}`);
    return { ...config.output, filename };
}



function buildModernResolve(config: any) {
    let modernResolve = { ...config.resolve };
    modernResolve.mainFields = ['es2015', 'module', 'browser', 'main'];
    return modernResolve;
}

function buildModernEntry(config: any) {
    const entry = config.entry;
    const polyfills: string[] = entry.polyfills;
    const tweakPolyfills = (file) => {
        if (file.endsWith('polyfills.ts')) {
            return file.replace('polyfills.ts', `polyfills.${SUFFIX_MODERN}.ts`);
        }
        else {
            return file;
        }
    };

    const modernPolyfills = polyfills.map(tweakPolyfills);
    const modernEntry = { ...entry, polyfills: modernPolyfills };
    return modernEntry;
}

function buildModernPlugins(config: any) {
    const plugins = config.plugins;
    const modernPlugins = [...plugins];
    
    const acpIndex = plugins.findIndex(p => p.constructor.name === 'AngularCompilerPlugin');
    const acp = plugins[acpIndex];
    const modernAcp = buildModernAcp(acp);
    modernPlugins[acpIndex] = modernAcp;
    
    const htmlPluginIndex = plugins.findIndex(p => p.constructor.name === 'IndexHtmlWebpackPlugin');
    const htmlPlugin = plugins[htmlPluginIndex];
    const modernHtmlPlugin = buildModernHtmlPlugin(htmlPlugin);
    modernPlugins[htmlPluginIndex] = modernHtmlPlugin;
    return modernPlugins;
}

function buildModernHtmlPlugin(htmlPlugin: any) {
    const indexOptions = htmlPlugin._options;
    const modernIndexOptions = { ...indexOptions };
    modernIndexOptions.output = `index.${SUFFIX_MODERN}.html`;
    const modernHtmlPlugin = new htmlPlugin.constructor(modernIndexOptions);
    return modernHtmlPlugin;
}

function buildModernAcp(acp: any) {
    const options = acp._options;
    const modernOptions = { ...options };
    modernOptions.tsConfigPath = modernOptions.tsConfigPath.replace('tsconfig.app.json', 'tsconfig.modern.app.json');
    const modernAcp = new acp.constructor(modernOptions);
    return modernAcp;
}

