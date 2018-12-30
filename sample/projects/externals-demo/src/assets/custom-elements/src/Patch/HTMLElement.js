import Native from './Native.js';
import CustomElementInternals from '../CustomElementInternals.js';
import CEState from '../CustomElementState.js';
import AlreadyConstructedMarker from '../AlreadyConstructedMarker.js';

/**
 * @param {!CustomElementInternals} internals
 */
export default function(internals) {
  window['HTMLElement'] = (function() {
    /**
     * @type {function(new: HTMLElement): !HTMLElement}
     */
    function HTMLElement() {
      // This should really be `new.target` but `new.target` can't be emulated
      // in ES5. Assuming the user keeps the default value of the constructor's
      // prototype's `constructor` property, this is equivalent.
      const constructor = /** @type {!Function} */ (this.constructor);

      const definition = internals.constructorToDefinition(constructor);
      if (!definition) {
        throw new Error('The custom element being constructed was not registered with `customElements`.');
      }

      const constructionStack = definition.constructionStack;

      if (constructionStack.length === 0) {
        const element = /** @type {!HTMLElement} */ (Native.Document_createElement.call(document, definition.localName));
        Object.setPrototypeOf(element, constructor.prototype);
        element.__CE_state = CEState.custom;
        element.__CE_definition = definition;
        internals.patch(element);
        return element;
      }

      const lastIndex = constructionStack.length - 1;
      const element = constructionStack[lastIndex];
      if (element === AlreadyConstructedMarker) {
        throw new Error('The HTMLElement constructor was either called reentrantly for this constructor or called multiple times.');
      }
      const toConstructElement = /** @type {!HTMLElement} */ (element);
      constructionStack[lastIndex] = AlreadyConstructedMarker;

      Object.setPrototypeOf(toConstructElement, constructor.prototype);
      internals.patch(toConstructElement);

      return toConstructElement;
    }

    HTMLElement.prototype = Native.HTMLElement.prototype;
    // Safari 9 has `writable: false` on the propertyDescriptor
    // Make it writable so that TypeScript can patch up the
    // constructor in the ES5 compiled code.
    Object.defineProperty(HTMLElement.prototype, 'constructor', {
      writable: true,
      configurable: true,
      enumerable: false,
      value: HTMLElement
    });

    return HTMLElement;
  })();
};
