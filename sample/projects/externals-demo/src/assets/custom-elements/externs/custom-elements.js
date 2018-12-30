/** @type {boolean|undefined} */
CustomElementRegistry.prototype.forcePolyfill;

class AlreadyConstructedMarkerType {}

/**
 * @enum {number}
 */
const CustomElementState = {
  custom: 1,
  failed: 2,
};

/**
 * @typedef {{
 *  localName: string,
 *  constructorFunction: !Function,
 *  connectedCallback: Function,
 *  disconnectedCallback: Function,
 *  adoptedCallback: Function,
 *  attributeChangedCallback: Function,
 *  observedAttributes: !Array<string>,
 *  constructionStack: !Array<!HTMLElement|!AlreadyConstructedMarkerType>,
 * }}
 */
let CustomElementDefinition;


// These properties are defined in the closure externs so that they will not be
// renamed during minification.

// Used for both Documents and Nodes which represent documents in the HTML
// Imports polyfill.

/** @type {boolean|undefined} */
Node.prototype.__CE_hasRegistry;

/** @type {boolean|undefined} */
Node.prototype.__CE_isImportDocument;

/** @type {boolean|undefined} */
Node.prototype.__CE_documentLoadHandled;

// Apply generally to Node.

/** @type {boolean|undefined} */
Node.prototype.__CE_patched;

// Apply generally to Element.

/** @type {!CustomElementState|undefined} */
Element.prototype.__CE_state;

/** @type {!CustomElementDefinition|undefined} */
Element.prototype.__CE_definition;

/** @type {!DocumentFragment|undefined} */
Element.prototype.__CE_shadowRoot;
