var utils = require('./src/utils');

//console.debug('v', utils.getDepVersion('@angular-devkit/core'););



// var compareVersions = require('compare-versions');

// console.debug('>', compareVersions('^7.2.1', '7.2.1-beta.0'));

var semver = require('semver');

console.debug('>', semver.lt('7.3.0-beta.0', '7.3.0-beta.0'));

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


