import { Rule, SchematicContext, Tree, apply, url, template, move, branchAndMerge, mergeWith, chain } from '@angular-devkit/schematics';
import { getWorkspace } from '@schematics/angular/utility/config';
import { RunSchematicTask, NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import * as path from 'path';

const spawn = require('cross-spawn');

const scriptsIndexHtml = `
<!-- Comment this out, *if* using differential loading or es2015 as a target in Angular 8+ -->
<script src="./assets/webcomponentsjs/custom-elements-es5-adapter.js"></script>

`

const scriptsPolyfills = `
if (!window['customElements']) {
  const script = document.createElement('script');
  script.src = './assets/webcomponentsjs/bundles/webcomponents-sd-ce.js';
  document.writeln(script.outerHTML);
}
`;

function npmInstall(options: any): Rule {
  return function (tree: Tree, context: SchematicContext) {
    spawn.sync('npm', ['install', options.package, options.switch], { stdio: 'inherit' });
    return tree;
  }
}

export function npmRun(options: any): Rule {
  return function (tree: Tree, context: SchematicContext) {
    spawn.sync('npm', ['run', options.script], { stdio: 'inherit' });
    return tree;
  }
}

export function executeNodeScript(options: any): Rule {
  const scriptName = options.script;
  return (tree: Tree, _context: SchematicContext) => {
    spawn.sync('node', [scriptName], { stdio: 'inherit' });
  }
}

export function addWebComponentsPolyfill(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {

    const project = getProject(tree, _options);

    const relProjectRootPath =
      project.root.replace(/[^\/]+/g, '..') || '';

    const templateSource = apply(url('./files'), [
      template({ ..._options, relProjectRootPath, projectRoot: project.root || '' }),
      move(project.root || '/')
    ]);

    const rule = chain([
      updateIndexHtml(_options),
      updatePolyfills(_options),
      updatePackageJson(project.root || '', _options),
      branchAndMerge(mergeWith(templateSource)),
      // npmInstall({package: '@webcomponents/custom-elements', switch: '--save'}),
      // npmInstall({package: 'copy', switch: '--save-dev'}),
    ]);

    const packageJson = loadPackageJson(tree);

    if (!packageJson['dependencies'] || !packageJson['dependencies']['@webcomponents/custom-elements']) {
      _context.addTask(new NodePackageInstallTask({
        packageName: '@webcomponents/custom-elements',
      }));
    }

    if (!packageJson['dependencies'] || !packageJson['dependencies']['@webcomponents/webcomponentsjs']) {
      _context.addTask(new NodePackageInstallTask({
        packageName: '@webcomponents/webcomponentsjs',
      }));
    }

    if (
      (!packageJson['dependencies'] || !packageJson['dependencies']['copy'])
      && (!packageJson['devDependencies'] || !packageJson['devDependencies']['copy'])
    ) {

      const id = _context.addTask(new NodePackageInstallTask({
        packageName: 'copy',
      }));

      _context.addTask(new RunSchematicTask('npmRun', { script: 'npx-build-plus:copy-assets' }), [id]);
    }
    else {
      _context.addTask(new RunSchematicTask('npmRun', { script: 'npx-build-plus:copy-assets' }));
    }

    return rule(tree, _context);
  };
}

function updatePackageJson(path: string, _options: any): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const config = loadPackageJson(tree);
    updateScripts(path, config, tree, _options);
    savePackageJson(config, tree);
    return tree;
  }
}

function updateIndexHtml(options: any): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const project = getProject(tree, options);
    const fileName = `${project.sourceRoot}/index.html`;

    const indexHtml = tree.read(fileName);
    if (indexHtml === null)
      throw Error('could not read index.html');
    const contentAsString = indexHtml.toString('UTF-8');

    if (contentAsString.includes('native-shim.js')) {
      console.info('Seems like, webcomponent polyfills are already referenced by index.html');
      return;
    }

    const modifiedContent = contentAsString.replace('</body>', scriptsIndexHtml + '\n</body>');

    tree.overwrite(fileName, modifiedContent);
    return tree;
  }
}

function updatePolyfills(options: any): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const project = getProject(tree, options);
    const fileName = `${project.sourceRoot}/polyfills.ts`;

    const polyfillsJs = tree.read(fileName);
    if (polyfillsJs === null)
      throw Error('could not read polyfills.ts');
    const contentAsString = polyfillsJs.toString('UTF-8');

    if (contentAsString.includes('webcomponents-loader.js')) {
      console.info('Seems like, webcomponents-loader is already referenced by polyfill.js');
      return;
    }

    const modifiedContent = contentAsString + '\n\n' + scriptsPolyfills;

    tree.overwrite(fileName, modifiedContent);
    return tree;
  }
}


function getProject(tree: Tree, options: any) {
  const workspace = getWorkspace(tree);
  if (!options.project) {
    options.project = Object.keys(workspace.projects)[0];
  }
  const project = workspace.projects[options.project];

  // compensate for lacking sourceRoot property
  // e. g. when project was migrated to ng7, sourceRoot is lacking
  if (!project.sourceRoot && !project.root) {
    project.sourceRoot = 'src';
  }
  else if (!project.sourceRoot) {
    project.sourceRoot = path.join(project.root, 'src');
  }

  return project;
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

function updateScripts(path: string, config: any, tree: Tree, _options: any) {
  
  if (path) {
    path += '/';
  }
  
  const script = `node ${path}copy-wc-polyfill.js`;

  if (!config['scripts']) {
    config.scripts = {};
  }

  let currentScript: string = config.scripts['npx-build-plus:copy-assets'];

  if (!currentScript) {
    currentScript = script;
  }
  else if (!currentScript.includes(script)) {
    currentScript += ' && ' + script;
  }

  config.scripts['npx-build-plus:copy-assets'] = currentScript;
}

