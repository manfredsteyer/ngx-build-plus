import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getWorkspace, updateWorkspace } from '@schematics/angular/utility/config';
import { addPackageJsonDependency, NodeDependencyType } from '@schematics/angular/utility/dependencies';
import { WorkspaceSchema } from '@schematics/angular/utility/workspace-models';

// this way we always have the correct version.
const PACKAGE_VERSION = require(`../../package.json`).version;
const PACKAGE_NAME = require(`../../package.json`).name;


export function addNgxBuildPlus(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {

    const project = _options.project;
    const workspace = getWorkspace(tree);

    // add all builders for ngx-build-plus
    addNgxBuildPlusBuilders(workspace, project);

    // we add the ngx-build-plus as a devdependency
    addPackageJsonDependency(tree, { name: PACKAGE_NAME, overwrite: true, type: NodeDependencyType.Dev, version: PACKAGE_VERSION })

    return updateWorkspace(workspace);
  };


  function addNgxBuildPlusBuilders(workspace: WorkspaceSchema, project: any) {

    const architect = workspace.projects[project].architect;
    if (!architect) throw new Error(`expected node projects/${project}/architect in angular.json`);

    const build = architect.build;
    if (!build) throw new Error(`expected node projects/${project}/architect/build in angular.json`);

    // Custom Builders are not part of the CLI's enum
    build.builder = <any>'ngx-build-plus:build';

    const serve = architect.serve;
    if (!serve) throw new Error(`expected node projects/${project}/architect/serve in angular.json`);

    serve.builder = <any>'ngx-build-plus:dev-server';

    const test = architect.test;
    if (!test) throw new Error(`expected node projects/${project}/architect/test in angular.json`);
    test.builder = <any>'ngx-build-plus:karma';

  }
}

