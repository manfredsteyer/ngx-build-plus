import { Rule, SchematicContext, Tree, apply, url, template, move, branchAndMerge, mergeWith, chain } from '@angular-devkit/schematics';
import { getWorkspace } from '@schematics/angular/utility/config';
import { RunSchematicTask } from '@angular-devkit/schematics/tasks';

const spawn = require('cross-spawn');

const scripts = `
  <!-- Polyfills for Browsers supporting 
        Custom Elements. Needed b/c we downlevel
        to ES5. See: @webcomponents/custom-elements
  -->
  <script src="./assets/custom-elements/src/native-shim.js"></script>

  <!-- Polyfills for Browsers not supporting
        Custom Elements. See: @webcomponents/custom-elements
        Consider only loading when such a browser is used
  -->
  <script src="./assets/custom-elements/custom-elements.min.js"></script>
`
const installNpmPackages: () => Rule = () => (tree: Tree, context: SchematicContext) => {
  spawn.sync('npm', ['install', '@webcomponents/custom-elements', '--save'], { stdio: 'inherit' });
  spawn.sync('npm', ['install', 'copy', '--save-dev'], { stdio: 'inherit' });
  return tree;
}

export function executeNodeScript(options: any): Rule {
  const scriptName = options.script;
  return (tree: Tree, _context: SchematicContext) => {
    spawn.sync('node', [scriptName], { stdio: 'inherit' });
  }
}

export function addWebComponentsPolyfill(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    
    const templateSource = apply(url('./files'), [
      template({..._options}),
      move('/')
    ]);
    const rule = chain([
      updateIndexHtml(_options),
      updatePackageJson( _options),
      branchAndMerge(mergeWith(templateSource)),
      installNpmPackages()
    ]);

    // addTasks makes sure this runs after the current schematic has been committed
    _context.addTask(new RunSchematicTask('executeNodeScript', {script: 'copy-wc-polyfill.js'}));

    return rule(tree, _context);
  };
}

function updatePackageJson(_options: any): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const config = loadPackageJson(tree);
    updateScripts(config, tree, _options);
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
    
    if (contentAsString.includes('custom-elements.min.js')) {
      console.info('Seems like, webcomponent polyfills are already referenced by index.html');
      return;
    }

    const modifiedContent = contentAsString.replace('</body>', scripts + '\n</body>');

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

function updateScripts(config: any, tree: Tree, _options: any) {
  const script = 'node copy-wc-polyfill.js';
  
  if (!config['scripts']) {
    config.scripts = {};
  }
  
  let postinstall: string = config.scripts['postinstall'];

  if (!postinstall) {
    postinstall = script;
  }
  else if (!postinstall.includes(script)) {
    postinstall += ' && ' + script;
  }

  config.scripts['postinstall'] = postinstall;

}

