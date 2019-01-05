import { Rule, SchematicContext, Tree, apply, url, template, move, branchAndMerge, mergeWith, chain } from '@angular-devkit/schematics';
import { getWorkspace } from '@schematics/angular/utility/config';
import { RunSchematicTask, NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import * as path from 'path';

const spawn = require('cross-spawn');

const scripts = `

  <!-- Here, all the shared code is imported -->
  <!-- consider creating one or several bundles -->
  <!-- for those -->

  <!-- core-js for legacy browsers 
        Consider only loading for IE
  -->
  <script src="./assets/core-js/core.js"></script>

  <!-- Zone.js 
        Consider excluding zone.js when creating
        custom Elements by using the noop zone.

        If you load zone.js with an additional 
        bundle, delete this line.
  -->
  <script src="./assets/zone.js/zone.js"></script>

  <!-- TODO: Add further needed polyfills here ... -->

  <!-- Rx -->
  <script src="./assets/rxjs/rxjs.umd.js"></script>

  <!-- Angular Packages -->
  <script src="./assets/core/bundles/core.umd.js"></script>
  <script src="./assets/common/bundles/common.umd.js"></script>
  <script src="./assets/common/bundles/common-http.umd.js"></script>
  <script src="./assets/elements/bundles/elements.umd.js"></script>

  <script src="./assets/forms/bundles/forms.umd.js"></script>
  <script src="./assets/router/bundles/router.umd.js"></script>

  <!-- TODO: Add further needed Angular libs here ... -->

  <!-- Just needed for prod mode -->
  <script src="./assets/platform-browser/bundles/platform-browser.umd.js"></script>

`

export function addExternalsSupport(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    
    const project = getProject(tree, _options);

    const relProjectRootPath = 
            project.root.replace(/[^\/]+/g, '..') || '';

    updateIndexHtml(_options, tree);
    
    // The host decides about prod mode 
    // when sharing deps
    if (!_options.host) {
      removeEnableProdModeInMainTs(_options, tree);
    }

    emptyPolyfillsTs(_options, tree);

    updatePackageJson(project.root || '', tree, _options);
    
    const templateSource = apply(url('./files'), [
      template({..._options, relProjectRootPath, projectRoot: project.root || ''}),
      move(project.root || '/')
    ]);

    const rule = 
      chain([
        branchAndMerge(mergeWith(templateSource))
      ]);

      const packageJson = loadPackageJson(tree);

      if (
        (!packageJson['dependencies'] || !packageJson['dependencies']['copy']) 
        && (!packageJson['devDependencies'] || !packageJson['devDependencies']['copy']) 
      ) {
  
      const id = _context.addTask(new NodePackageInstallTask({
          packageName: 'copy',
      }));
  
      _context.addTask(new RunSchematicTask('npmRun', {script: 'npx-build-plus:copy-assets'}), [id]);
    }
    else {
      _context.addTask(new RunSchematicTask('npmRun', {script: 'npx-build-plus:copy-assets'}));
    }
    return rule(tree, _context);
  };
}

function updatePackageJson(path: string, tree: Tree, _options: any) {
  const config = loadPackageJson(tree);
  updateScripts(path, config, tree, _options);
  savePackageJson(config, tree);
}

function removeEnableProdModeInMainTs(options: any, tree: Tree) {
  const project = getProject(tree, options);

  const fileName = `${project.sourceRoot}/main.ts`;

  const content = tree.read(fileName);
  if (content === null)
    throw Error('could not read main.ts');
  const contentAsString = content.toString('UTF-8');
  
  const modifiedContent = contentAsString.replace('enableProdMode();', '// Let the host app decide about prod mode\n  // enableProdMode();');

  tree.overwrite(fileName, modifiedContent);
}

function updateIndexHtml(options: any, tree: Tree) {
  const project = getProject(tree, options);

  const fileName = `${project.sourceRoot}/index.html`;

  const indexHtml = tree.read(fileName);
  if (indexHtml === null)
    throw Error('could not read index.html');
  const contentAsString = indexHtml.toString('UTF-8');
  
  if (contentAsString.indexOf('.umd.js') > -1) {
    console.info('Seems like, UMD bundles are already referenced by index.html');
    return;
  }

  const modifiedContent = contentAsString.replace('</body>', scripts + '\n</body>');

  tree.overwrite(fileName, modifiedContent);
}


function emptyPolyfillsTs(options: any, tree: Tree) {
  const project = getProject(tree, options);

  const fileName = `${project.sourceRoot}/polyfills.ts`;
  const bakFileName = `${project.sourceRoot}/polyfills.ts.bak`;

  const content = tree.read(fileName);
  if (content === null)
    throw Error('could not read polyfills.ts');
  const contentAsString = content.toString('UTF-8');
  
  if (!tree.exists(bakFileName)) {
    tree.create(bakFileName, contentAsString);
  }

  tree.overwrite(fileName, `
// in extenals mode, polyfills are directly loaded into index.html
// to make sure everything is loaded in the right order
// the original contents of this file has been moved to polyfills.ts.bak
  `);
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
  const project = getProject(tree, _options);
  
  if (!config['scripts']) {
    config.scripts = {};
  }

  const script = `node ${path}copy-bundles.js`;
  let copyAssetsScript: string = config.scripts['npx-build-plus:copy-assets'];

  if (!copyAssetsScript) {
    copyAssetsScript = script;
  }
  else if (!copyAssetsScript.includes(script)) {
    copyAssetsScript += ' && ' + script;
  }

  config.scripts['npx-build-plus:copy-assets'] = copyAssetsScript;
  
  let additionalFlags = '';

  if (!_options.host) {
    // external web components need single bundle w/ output hashing
    additionalFlags = '-- single-bundle --output-hashing none';
  }

  // Heuristic for default project
  if (!project.root) {
    config.scripts['build:externals'] = `ng build --extra-webpack-config webpack.externals.js ${additionalFlags} true --prod`;
  }

  if (_options.project) {
    config.scripts[`build:${_options.project}:externals`] = `ng build --extra-webpack-config webpack.externals.js ${additionalFlags} --prod --project ${_options.project}`;

  }
}