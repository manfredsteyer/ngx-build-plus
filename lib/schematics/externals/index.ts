import { Rule, SchematicContext, Tree, apply, url, template, move, branchAndMerge, mergeWith, chain } from '@angular-devkit/schematics';
import { getWorkspace } from '@schematics/angular/utility/config';
import { RunSchematicTask, NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

const spawn = require('cross-spawn');

const scripts = `
  <!-- core-js for legacy browsers 
        Consider only loading for IE
  -->
  <script src="./assets/core-js/core.js"></script>

  <!-- Zone.js 
        Consider excluding zone.js when creating
        custom Elements by using the noop zone.
  -->
  <script src="./assets/zone.js/zone.js"></script>

  <!-- Rx -->
  <script src="./assets/rxjs/rxjs.umd.js"></script>

  <!-- Angular Packages -->
  <script src="./assets/core/bundles/core.umd.js"></script>
  <script src="./assets/common/bundles/common.umd.js"></script>
  <script src="./assets/platform-browser/bundles/platform-browser.umd.js"></script>
  <script src="./assets/elements/bundles/elements.umd.js"></script>
`


export function addExternalsSupport(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    
    const project = getProject(tree, _options);

    const relProjectRootPath = 
            project.root.replace(/[^\/]+/g, '..') || '';

    updateIndexHtml(_options, tree);
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
        (!packageJson['dependencies'] || !packageJson['dependencies']['@webcomponents/custom-elements']) 
        && (!packageJson['devDependencies'] || !packageJson['devDependencies']['@webcomponents/custom-elements']) 
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

function getProject(tree: Tree, options: any) {
  const workspace = getWorkspace(tree);
  if (!options.project) {
    options.project = Object.keys(workspace.projects)[0];
  }
  const project = workspace.projects[options.project];
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
  
  // Heuristic for default project
  if (!project.root) {
    config.scripts['build:old'] = config.scripts['build'];
    config.scripts['start:old'] = config.scripts['start'];
    config.scripts['build'] = `ng build --extra-webpack-config webpack.externals.js --single-bundle true --prod`;
    config.scripts['start'] = `ng serve --extra-webpack-config webpack.externals.js --single-bundle true -o`;
  }

  if (_options.project) {
    config.scripts[`build:${_options.project}`] = `ng build --extra-webpack-config webpack.externals.js --single-bundle true --prod --project ${_options.project}`;
    config.scripts[`start:${_options.project}`] = `ng serve --extra-webpack-config webpack.externals.js --single-bundle true --project ${_options.project} -o`;
  }
}