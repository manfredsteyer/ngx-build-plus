//
// This script copies over some polyfills to the project's assets folder
// It's called by the postscript npm script
// If you call it manually, call it from your projects root
// > node projects/externals-demo//copy-wc-polyfill.js
//

const copy = require('copy');

console.log('Copy webcomponent polyfills ...');
copy('node_modules/@webcomponents/**/*.js', 'projects/externals-demo/src/assets', {}, _ => {});
