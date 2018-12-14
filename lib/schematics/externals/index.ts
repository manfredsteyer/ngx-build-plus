import { Rule, SchematicContext, Tree, apply, url, template, move, branchAndMerge, mergeWith } from '@angular-devkit/schematics';
import { parseName } from '@schematics/angular/utility/parse-name';
import { getWorkspace } from '@schematics/angular/utility/config';
import { addPackageJsonDependency, NodeDependencyType } from '@schematics/angular/utility/dependencies';

export function addExternalsSupport(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    
    //setupOptions(_options, tree);

    console.log('root', _options.path);
    updateIndexHtml(_options, tree);
    const config = loadPackageJson(tree);
    updateScripts(config, _options);
    savePackageJson(config, tree);
    
    const templateSource = apply(url('./files'), [
      template({
        ..._options
      }),
      move('/')
    ]);

    const rule = 
      branchAndMerge(
        mergeWith(templateSource)

      );

    return rule(tree, _context);
  };
}

function setupOptions(options: any, host: Tree): void {
  console.log('*');
  const workspace = getWorkspace(host);
  console.log('*');
  if (!options.project) {
    options.project = Object.keys(workspace.projects)[0];
  }
  console.log('*');
  const project = workspace.projects[options.project];
  console.log('project', project);
  if (options.path === undefined) {
    const projectDirName = project.projectType === 'application' ? 'app' : 'lib';
    options.path = `/${project.root}/src/${projectDirName}`;
  }
  console.log('*');
  const parsedPath = parseName(options.path, options.name);
  options.name = parsedPath.name;
  options.path = parsedPath.path;
  console.log('*');
}

function updateIndexHtml(options: any, tree: Tree) {
  const workspace = getWorkspace(tree);
  if (!options.project) {
    options.project = Object.keys(workspace.projects)[0];
  }
  const project = workspace.projects[options.project];
  const fileName = `${project.sourceRoot}/index.html`;
  console.debug(fileName);
  
  const indexHtml = tree.read(fileName);
  if (indexHtml === null)
    throw Error('could not read index.html');
  const contentAsString = indexHtml.toString('UTF-8');
  console.log('index.html', contentAsString);


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

  if (!config.scripts['start:externals']) {
    config.scripts['start:externals'] = `ng serve --extra-webpack-config webpack.externals.js`;
  }
  if (_options.project) {
    config.scripts[`build:externals:${_options.project}`] = `ng build --extra-webpack-config webpack.externals.js --prod --project ${_options.project}`;
    config.scripts[`start:externals:${_options.project}`] = `ng serve --extra-webpack-config webpack.externals.js --project ${_options.project}`;
  }
}

