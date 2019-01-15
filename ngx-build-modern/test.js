var utils = require('./src/utils');
var v = utils.getDepVersion('@angular-devkit/core1');

console.debug('v', v);


// var compareVersions = require('compare-versions');

// console.debug('>', compareVersions('^7.2.1', '7.2.1-beta.0'));

// var semver = require('semver');

//console.debug('>', semver.gt('7.2.1-beta.0', '7.2.1'));

// console.debug('^7.2.0-beta.3'.replace(/[^\d]*(.*)/, '$1'));


// // const pkginfo = require('pkginfo');
// // let data = {};
// // pkginfo(module);
// // console.debug('data', module.id);
// const path = require('path');
// const root = process.mainModule.paths[0].split('node_modules')[0].slice(0, -1);
// console.debug('root', root);
// const packageJsonPath = path.join(root, 'package.json');
// console.debug('packageJsonPath', packageJsonPath);
// console.debug('package.json', require(packageJsonPath));


