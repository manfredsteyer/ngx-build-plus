import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

export function addExternalsSupport(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const config = loadPackageJson(tree);
    updateScripts(config, _options);
    savePackageJson(config, tree);
    return tree;
  };
}

function savePackageJson(config: any, tree: Tree) {
  const newContentAsString = JSON.stringify(config, null, 2) || '';
  tree.overwrite('package.json', newContentAsString);
}

function loadPackageJson(tree: Tree) {
  const pkg = tree.read('package.json');
  if (pkg === null)
    throw Error('could not read package.json');
  const contentAsString = pkg.toString('UTF-8');
  const config = JSON.parse(contentAsString);
  return config;
}

function updateScripts(config: any, _options: any) {
  if (!config['scripts']) {
    config.scripts = {};
  }
  if (!config.scripts['build:externals']) {
    config.scripts['build:externals'] = `ng build --extra-webpack-config webpack.externals.js --prod`;
  }
  config.scripts[`build:externals:${_options.project}`] = `ng build --extra-webpack-config webpack.externals.js --prod --project ${_options.project}`;
}

