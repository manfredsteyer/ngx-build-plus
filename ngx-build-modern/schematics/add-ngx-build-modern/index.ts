import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getProject } from '@schematics/angular/utility/project';
import * as path from 'path';

const tsconfigModernAppJson = ` {
  "extends": "./tsconfig.app.json",
  "compilerOptions": {
    "target": "es2015"
  }
}
`;

const polyfillsModernJson = `
import 'zone.js/dist/zone';
`;

export function addNgxBuildModern(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const config = loadPackageJson(tree);
    updateScripts(config, _options);
    generateModernConfigs(tree, _options);
    savePackageJson(config, tree);
    return tree;
  };
}

function generateModernConfigs(tree: Tree, _options: any) {
  const project = getProject(tree, _options.project);

  // TODO: If project is not main project (src !== ""), 
  // use root instead of sourceRoot for tsconfig.modern.app.json
  // (the path of polyfills.modern.ts is fine)

  const tsConfigModernRootPath = (project.root) ? project.root : project.sourceRoot;

  const tsConfigModernPath = path.join(tsConfigModernRootPath, 'tsconfig.modern.app.json');
  if (!tree.exists(tsConfigModernPath)) {
    tree.create(tsConfigModernPath, tsconfigModernAppJson);
  }
  const polyfillsModernPath = path.join(project.sourceRoot, 'polyfills.modern.ts');
  if (!tree.exists(polyfillsModernPath)) {
    tree.create(polyfillsModernPath, polyfillsModernJson);

    console.info('HINT:  Add all polyfills for modern browsers to polyfills.modern.ts, if there are any.')

  }
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
  if (!config.scripts['build:modern']) {
    config.scripts['build:modern'] = `ng build --plugin ngx-build-modern --prod`;
  }
  config.scripts[`build:modern:${_options.project}`] = `ng build --plugin ngx-build-modern --project ${_options.project} --prod`;
}

