import { Rule, SchematicContext, Tree, apply, url, template, move, branchAndMerge, mergeWith, chain, noop } from '@angular-devkit/schematics';
import { getWorkspace, updateWorkspace } from '@schematics/angular/utility/config';
import { RunSchematicTask, NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { BrowserBuilderBaseOptions } from '@schematics/angular/utility/workspace-models';
import { AdvancedScriptConf } from '../utils/types';

const spawn = require('cross-spawn');

// function npmInstall(options: any): Rule {
//   return function (tree: Tree, context: SchematicContext) {
//     spawn.sync('npm', ['install', options.package, options.switch], { stdio: 'inherit' });
//     return tree;
//   }
// }

export function npmRun(options: any): Rule {
  return function (tree: Tree, context: SchematicContext) {
    spawn.sync('npm', ['run', options.script], { stdio: 'inherit' });
    return tree;
  }
}

export function addWebComponentsPolyfill(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {

    const packageJson = loadPackageJson(tree);

    if (!packageJson['dependencies'] || !packageJson['dependencies']['@webcomponents/webcomponentsjs']) {
      _context.addTask(new NodePackageInstallTask({
        packageName: '@webcomponents/webcomponentsjs',
      }));
    }

    return chain([
      addScriptsToProject(tree, _options)
    ]); 
  };
}

function addScriptsToProject(tree: Tree, options: any): Rule {
    const workspace = getWorkspace(tree);
    if (!options.project) {
      options.project = Object.keys(workspace.projects)[0];
    }
    const project = workspace.projects[options.project];
    
    if (!project.architect || !project.architect.build || !project.architect.build.options) {
      return noop();
    }

    const buildOptions = project.architect.build.options as BrowserBuilderBaseOptions;

    if (!buildOptions) return noop();
    
    if (!buildOptions.scripts) {
      buildOptions.scripts = [];
    }
    
    const scripts = buildOptions.scripts as unknown as AdvancedScriptConf[];
    
    if (!scripts.find(s => s.bundleName === 'polyfill-webcomp-es5')) {
      scripts.push({
        bundleName: 'polyfill-webcomp-es5',
        input: 'node_modules/@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js'
      });
    }
    
    if (!scripts.find(s => s.bundleName === 'polyfill-webcomp')) {
      scripts.push({
        bundleName: 'polyfill-webcomp',
        input: 'node_modules/@webcomponents/webcomponentsjs/bundles/webcomponents-sd-ce-pf.js'
      });
    }

    return updateWorkspace(workspace);

}

function loadPackageJson(tree: Tree) {
  const pkg = tree.read('package.json');
  if (pkg === null)
    throw Error('could not read package.json');
  const contentAsString = pkg.toString('UTF-8');
  const config = JSON.parse(contentAsString);
  return config;
}
