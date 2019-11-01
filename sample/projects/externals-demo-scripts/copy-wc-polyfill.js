//
// This script copies over some polyfills to the project's assets folder
// It's called by the npm script npx-build-plus:copy-assets
// If you call it manually, call it from your projects root
// > node projects/externals-demo-scripts//copy-wc-polyfill.js
//

const copy = require('copy');

console.log('Copy webcomponent polyfills ...');
copy('node_modules/@webcomponents/**/*.js', 'projects/externals-demo-scripts/src/assets', {}, _ => {});
