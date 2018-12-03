/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

suite('Custom Element Reactions', function() {
  var work;
  var assert = chai.assert;
  var HTMLNS = 'http://www.w3.org/1999/xhtml';

  setup(function() {
    work = document.createElement('div');
    document.body.appendChild(work);
  });

  teardown(function() {
    document.body.removeChild(work);
  });

  suite('constructor', function() {

    test('new E() instantiates a new customized element', function() {
      class XNew extends HTMLElement {}
      customElements.define('x-new', XNew);
      var xnew = new XNew();

      assert.equal(xnew.localName, 'x-new');
      assert.instanceOf(xnew, XNew);
    });

    test('new E() instantiates subclasses', function() {
      class XSuper extends HTMLElement {}
      class XSub extends XSuper {}
      customElements.define('x-super', XSuper);
      customElements.define('x-sub', XSub);

      var xsuper = new XSuper();
      assert.equal(xsuper.localName, 'x-super');
      assert.instanceOf(xsuper, XSuper);

      var xsub = new XSub();
      assert.equal(xsub.localName, 'x-sub');
      assert.instanceOf(xsub, XSub);
    });

    test('new E() works with ES5-style classes', function() {
      // To work with ES5-style classes we require a complete definition:
      function XES5() {
        // 1) constructors must return the result of the super call
        return HTMLElement.call(this);
      }
      // 2) HTMLElement.prototype must be on the prototype chain
      XES5.prototype = Object.create(HTMLElement.prototype);
      // 3) The `constructor` property must point to the classes constructor
      Object.defineProperty(XES5.prototype, 'constructor', {value: XES5, configurable: true, writable: true,});

      customElements.define('x-es5', XES5);

      var es5 = new XES5();
      assert.equal(es5.localName, 'x-es5');
      assert.instanceOf(es5, XES5);
    });

    test('constructor is called when instantiated via createElement', function() {
      var pass = false;
      class XFoo2 extends HTMLElement {
        constructor() {
          super();
          pass = true;
        }
      }
      var XFoo = customElements.define('x-foo2', XFoo2);
      var xfoo = document.createElement('x-foo2');
      assert.equal(xfoo.localName, 'x-foo2');
      assert.instanceOf(xfoo, XFoo2);
      assert.isTrue(pass);
    });

    test('subclass constructor is called when instantiated via createElement', function() {
      class XSuper2 extends HTMLElement {}
      var pass = false;
      class XSub2 extends XSuper2 {
        constructor() {
          super();
          pass = true;
        }
      }
      customElements.define('x-super-2', XSuper2);
      customElements.define('x-sub-2', XSub2);

      var xsuper = document.createElement('x-super-2');
      assert.equal(xsuper.localName, 'x-super-2');
      assert.instanceOf(xsuper, XSuper2);

      var xsub = document.createElement('x-sub-2');
      assert.equal(xsub.localName, 'x-sub-2');
      assert.instanceOf(xsub, XSub2);
      assert.isTrue(pass);
    });

    test('ES5 constructor is called when instantiated via createElement', function() {
      var pass = false;
      function XBarES5() {
        pass = true;
        return HTMLElement.call(this);
      }
      XBarES5.prototype = Object.create(HTMLElement.prototype);
      Object.defineProperty(XBarES5.prototype, 'constructor', {value: XBarES5, configurable: true, writable: true});
      customElements.define('x-bar-es5', XBarES5);
      var xbar = document.createElement('x-bar-es5');
      assert.equal(xbar.localName, 'x-bar-es5');
      assert.instanceOf(xbar, XBarES5);
      assert.isTrue(pass);
    });

    test('constructor is called when instantiated via createElementNS', function() {
      var pass = false;
      class XFoo3 extends HTMLElement {
        constructor() {
          super();
          pass = true;
        }
      }
      customElements.define('x-foo3', XFoo3);
      var xfoo = document.createElementNS(HTMLNS, 'x-foo3');
      assert.instanceOf(xfoo, XFoo3);
      assert.equal(xfoo.localName, 'x-foo3');
      assert.isTrue(pass);
    });

    test('constructor is called for each instance', function() {
      var count = 0;
      class XFoo4 extends HTMLElement {
        constructor() {
          super();
          count++;
        }
      }
      customElements.define('x-foo4', XFoo4);
      var e1 = document.createElement('x-foo4');
      var e2 = document.createElement('x-foo4');

      assert.notStrictEqual(e1, e2);
      assert.equal(count, 2);
    });

    test('calls constructor only once', function() {
      var count = 0;
      class XConstructor extends HTMLElement {
        constructor() {
          super();
          count++;
        }
      }
      customElements.define('x-constructor', XConstructor);
      var xconstructor = new XConstructor();
      assert.equal(count, 1);
    });

    test('innerHTML on disconnected elements customizes contents', function() {
      var passed = false;
      class XInner extends HTMLElement {
        constructor() {
          super();
          passed = true;
        }
      }
      customElements.define('x-inner', XInner);
      var div = document.createElement('div');
      div.innerHTML = '<x-inner></x-inner>';
      assert.isTrue(passed);
    });

  });

  suite('attributeChangedCallback', function() {

    // TODO(justinfagnani): test for observedAttributes

    test('if not defined, observedAttributes is not read', function() {
      customElements.define('x-no-attr-callback', class extends HTMLElement {
        static get observedAttributes() {
          assert.fail();
        }
      });
    });

    test('called when setting observed attribute via setAttribute', function(done) {
      class XBoo extends HTMLElement {
        static get observedAttributes() {
          return ['foo'];
        }

        attributeChangedCallback(inName, inOldValue) {
          if (inName == 'foo' && inOldValue == 'bar'
              && this.attributes.foo.value == 'zot') {
            done();
          }
        }
      }
      customElements.define('x-boo-acp', XBoo);
      var xboo = new XBoo();
      xboo.setAttribute('foo', 'bar');
      xboo.setAttribute('foo', 'zot');
    });

    test('called for existing observed attributes', function () {
      var changed = [];
      class XBoo extends HTMLElement {
        static get observedAttributes () {
          return ['test1'];
        }
        attributeChangedCallback(name, oldValue, newValue) {
          changed.push({
            name: name,
            oldValue: oldValue,
            newValue: newValue
          });
        }
        connectedCallback() {
          this.innerHTML = 'testing';
        }
      }

      var element = document.createElement('x-boo-at1');
      element.setAttribute('test1', 'test1');
      element.setAttribute('test2', 'test2');
      work.appendChild(element);

      customElements.define('x-boo-at1', XBoo);

      assert.equal(changed.length, 1, 'should only trigger for observed attributes');
      assert.equal(changed[0].name, 'test1', 'name');
      assert.equal(changed[0].oldValue, null, 'oldValue');
      assert.equal(changed[0].newValue, 'test1', 'newValue');
    });

    test('called even if attribute value hasn\'t changed', function () {
      var calls = 0;
      class XBoo extends HTMLElement {
        static get observedAttributes () {
          return ['foo'];
        }
        attributeChangedCallback(name, oldValue, newValue) {
          calls += 1;
        }
      }
      var element = document.createElement('x-boo-at2');

      customElements.define('x-boo-at2', XBoo);
      work.appendChild(element);
      element.setAttribute('foo', 'foo');
      element.setAttribute('foo', 'foo');

      assert.equal(calls, 2);
    })

  });

  suite('connectedCallback', function() {
    var connectedCount;
    class XConnected extends HTMLElement {
      connectedCallback() {
        connectedCount++;
      }
    }
    customElements.define('x-connected', XConnected);

    setup(function() {
      connectedCount = 0;
    });

    test('is not called for disconnected custom elements', function() {
      new XConnected();
      assert.equal(connectedCount, 0);
    });

    test('is not called for deeply disconnected custom elements', function() {
      var parent = new XConnected();
      var child = new XConnected();
      parent.appendChild(child);
      assert.equal(connectedCount, 0);
    });

    test('called when appended to main document', function() {
      work.appendChild(new XConnected());
      assert.equal(connectedCount, 1);
    });

    test('called when re-appended to main document', function() {
      var el = new XConnected();
      work.appendChild(el);
      work.removeChild(el);
      work.appendChild(el);
      assert.equal(connectedCount, 2);
    });

    test('called in tree order', function() {
      var log = [];

      class XOrdering extends HTMLElement {
        connectedCallback() {
          log.push(this.id);
        }
      }

      customElements.define('x-ordering', XOrdering);

      work.innerHTML =
          '<x-ordering id=a>' +
            '<x-ordering id=b></x-ordering>' +
            '<x-ordering id=c>' +
              '<x-ordering id=d></x-ordering>' +
              '<x-ordering id=e></x-ordering>' +
            '</x-ordering>' +
          '</x-ordering>';

      assert.deepEqual(log, ['a', 'b', 'c', 'd', 'e']);
    });

  });

  suite('disconnectedCallback', function() {

    test('called when disconnected from main document', function() {
      var ready, inserted, removed;
      class XBoo extends HTMLElement {
        disconnectedCallback() {
          removed = true;
        }
      }
      customElements.define('x-boo-ir2', XBoo);
      var xboo = new XBoo();
      assert(!removed, 'removed must be false [XBoo]');
      work.appendChild(xboo);
      work.removeChild(xboo);
      assert(removed, 'removed must be true [XBoo]');

      ready = inserted = removed = false;
      class XBooBoo extends HTMLElement {
        disconnectedCallback() {
          removed = true;
        }
      }
      customElements.define('x-booboo-ir2', XBooBoo);
      var xbooboo = new XBooBoo();
      assert(!removed, 'removed must be false [XBooBoo]');
      work.appendChild(xbooboo);
      work.removeChild(xbooboo);
      assert(removed, 'removed must be true [XBooBoo]');
    });

    test('called in tree order', function() {
      var log = [];
      class XOrdering2 extends HTMLElement {
        disconnectedCallback() {
          log.push(this.id);
        }
      }
      customElements.define('x-ordering2', XOrdering2);

      work.innerHTML =
          '<x-ordering2 id=a>' +
            '<x-ordering2 id=b></x-ordering2>' +
            '<x-ordering2 id=c>' +
              '<x-ordering2 id=d></x-ordering2>' +
              '<x-ordering2 id=e></x-ordering2>' +
            '</x-ordering2>' +
          '</x-ordering2>';

        work.removeChild(work.firstElementChild);
        assert.deepEqual(['a', 'b', 'c', 'd', 'e'], log);
    });

  });

  suite('clone/import/adopt', function() {

    test('imported custom elements are customized', function() {
      class XImported extends HTMLElement {}
      customElements.define('x-imported', XImported);

      // most imports happen on nodes in a different document, but elements
      // in another document woudn't be customized in the first place
      var original = document.createElement('x-imported');
      assert.instanceOf(original, XImported);

      var imported = document.importNode(original, true);
      assert.instanceOf(imported, XImported);
    });

    test.skip('cloned custom elements are customized', function() {
      class XCloned extends HTMLElement {}
      customElements.define('x-cloned', XCloned);

      var original = document.createElement('x-cloned');
      assert.instanceOf(original, XCloned);

      var imported = original.cloneNode(true);
      assert.instanceOf(imported, XCloned);
    });

    test.skip('adopted custom elements are customized', function() {
      class XAdopted extends HTMLElement {}
      customElements.define('x-adopted', XAdopted);

      var otherDoc = document.implementation.createHTMLDocument('adopt');
      var original = otherDoc.createElement('x-adopted');
      // x-adopted is not defined in its document
      assert.notInstanceOf(original, XAdopted);

      var imported = document.adoptNode(original);
      assert.notInstanceOf(imported, XAdopted);
    });

  });

  suite('moving and reconnecting', function() {

    test('connected then disconnected', function() {
      class XCallbacks extends HTMLElement {
        constructor() {
          super();
          this.connected = false;
          this.disconnected = false;
        }

        connectedCallback() {
          this.connected = true;
        }

        disconnectedCallback() {
          this.disconnected = true;
        }
      }
      customElements.define('x-callbacks', XCallbacks);
      var e = new XCallbacks();
      assert.isFalse(e.connected);
      assert.isFalse(e.disconnected);

      work.appendChild(e);
      assert.isTrue(e.connected);
      assert.isFalse(e.disconnected);

      work.removeChild(e);
      assert.isTrue(e.connected);
      assert.isTrue(e.disconnected);
    });

    // TODO(justinfagnani): old, ported test. Rendundant?
    test('entered left apply to view', function() {
      var invocations = [];
      var tagName = 'x-entered-left';
      class XEnteredLeft extends HTMLElement {
        constructor() {
          super();
          invocations.push('constructor');
        }
        connectedCallback() {
          invocations.push('entered');
        }
        disconnectedCallback() {
          invocations.push('left');
        }
      }
      customElements.define(tagName, XEnteredLeft);

      var element = document.createElement(tagName);
      assert.deepEqual(invocations, ['constructor'], 'created but not entered view');

      // // note, cannot use instanceof due to IE
      assert.equal(element.__proto__, XEnteredLeft.prototype, 'element is correct type');

      work.appendChild(element)
      assert.deepEqual(invocations, ['constructor', 'entered'],
          'created and entered view');

      element.parentNode.removeChild(element);
      assert.deepEqual(invocations, ['constructor', 'entered', 'left'],
          'created, entered then left view');
    });

    test('connected then disconnected in same task', function() {
      var log = [];
      class XAD extends HTMLElement {
        connectedCallback() {
          log.push('connected');
        }
        disconnectedCallback() {
          log.push('disconnected');
        }
      }

      customElements.define('x-ad', XAD);
      var el = document.createElement('x-ad');
      work.appendChild(el);
      work.removeChild(el);
      assert.deepEqual(log, ['connected', 'disconnected']);
    });

    test('disconnected then re-connected in same task', function() {
      var log = [];
      class XDA extends HTMLElement {
        connectedCallback() {
          log.push('connected');
        }
        disconnectedCallback() {
          log.push('disconnected');
        }
      }
      customElements.define('x-da', XDA);
      var el = document.createElement('x-da');
      work.appendChild(el);
      log = [];
      work.removeChild(el);
      work.appendChild(el);
      assert.deepEqual(log, ['disconnected', 'connected']);
    });

  });

});
