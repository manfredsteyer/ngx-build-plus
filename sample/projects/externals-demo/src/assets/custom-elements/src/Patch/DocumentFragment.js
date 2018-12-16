import CustomElementInternals from '../CustomElementInternals.js';
import Native from './Native.js';
import PatchParentNode from './Interface/ParentNode.js';

/**
 * @param {!CustomElementInternals} internals
 */
export default function(internals) {
  PatchParentNode(internals, DocumentFragment.prototype, {
    prepend: Native.DocumentFragment_prepend,
    append: Native.DocumentFragment_append,
  });
};
