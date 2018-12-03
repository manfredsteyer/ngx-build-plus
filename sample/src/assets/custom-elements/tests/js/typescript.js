/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

/*
Original TypeScript source code used in this test suite:

class XTypescript extends HTMLElement {}
class XTypescript2 extends HTMLElement {}

 */
suite('TypeScript ES5 Output', function() {

  customElements.enableFlush = true;

  test('TypeScript generated ES5 works via new()', function() {
    var __extends = (this && this.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var XTypescript = /** @class */ (function (_super) {
        __extends(XTypescript, _super);
        function XTypescript() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return XTypescript;
    }(HTMLElement));

    // register x-foo
    customElements.define('x-typescript', XTypescript);
    // create an instance via new
    var e = new XTypescript();
    // test localName
    assert.equal(e.localName, 'x-typescript');
    // test instanceof
    assert.instanceOf(e, XTypescript);
  });

  test('TypeScript generated ES5 works via createElement', function() {
    var __extends = (this && this.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var XTypescript2 = /** @class */ (function (_super) {
        __extends(XTypescript2, _super);
        function XTypescript2() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return XTypescript2;
    }(HTMLElement));

    // register x-foo
    customElements.define('x-typescript2', XTypescript2);
    // create an instance via new
    var e = document.createElement('x-typescript2');
    // test localName
    assert.equal(e.localName, 'x-typescript2');
    // test instanceof
    assert.instanceOf(e, XTypescript2);

  });

});
