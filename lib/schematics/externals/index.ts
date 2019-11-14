import { Rule, SchematicContext, Tree, apply, url, template, move, branchAndMerge, mergeWith, chain, noop } from '@angular-devkit/schematics';
import { getWorkspace, updateWorkspace } from '@schematics/angular/utility/config';
import * as path from 'path';
import { BrowserBuilderBaseOptions } from '@schematics/angular/utility/workspace-models';
import { AdvancedScriptConf } from '../utils/types';
import { spawn } from 'cross-spawn';
import { RunSchematicTask } from '@angular-devkit/schematics/tasks';


const SCRIPTS = [
  "node_modules/rxjs/bundles/rxjs.umd.js",
  "node_modules/@angular/core/bundles/core.umd.js",
  "node_modules/@angular/common/bundles/common.umd.js",
  "node_modules/@angular/common/bundles/common-http.umd.js",
  "node_modules/@angular/compiler/bundles/compiler.umd.js",
  "node_modules/@angular/elements/bundles/elements.umd.js",
  "node_modules/@angular/platform-browser/bundles/platform-browser.umd.js",
  "node_modules/@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js"
];

export function addExternalsSupport(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {

    const project = getProject(tree, _options);
    const relProjectRootPath = project.root.replace(/[^\/]+/g, '..') || '';

    updatePackageJson(project.root || '', tree, _options, _context);

    const templateSource = apply(url('./files'), [
      template({..._options, relProjectRootPath, projectRoot: project.root || ''}),
      move(project.root || '/')
    ]);

    return chain([
        addScriptsToProject(tree, _options),
        mergeWith(templateSource),
    ]);

  }
  
}

function updatePackageJson(path: string, tree: Tree, _options: any, _context: SchematicContext) {
  const config = loadPackageJson(tree);
  updateScripts(path, config, tree, _options, _context);
  savePackageJson(config, tree);
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
  
  const scripts = buildOptions.scripts;
  
  SCRIPTS
    .filter(s => !scripts.includes(s))
    .forEach(script => {
      scripts.push(script);
    });

  return updateWorkspace(workspace);

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

function updateScripts(path: string, config: any, tree: Tree, _options: any, _context: SchematicContext) {
  const project = getProject(tree, _options);
  
  if (!config['scripts']) {
    config.scripts = {};
  }

  let additionalFlags = '';

  // Ivy support
  const postInstall: string = config.scripts['postinstall'] || '';
  if (postInstall.startsWith('ngcc')) {
    config.scripts['postinstall:bak'] = postInstall;
    config.scripts['postinstall'] = 'ngcc';

    _context.addTask(new RunSchematicTask('npmRun', {script: 'postinstall'}));
  } 

  if (!_options.host) {
    // external web components need single bundle 
    additionalFlags = '--single-bundle';
  }

  // Heuristic for default project
  if (!project.root) {
    config.scripts['build:externals'] = `ng build --extra-webpack-config ${path}/webpack.externals.js --prod ${additionalFlags}`;
  }

  if (_options.project) {
    config.scripts[`build:${_options.project}:externals`] = `ng build --extra-webpack-config ${path}/webpack.externals.js --prod --project ${_options.project} ${additionalFlags}`;
  }
}
