import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getWorkspace, updateWorkspace } from '../utils/workspace';

export function addNgxBuildPlus(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    
    const project = _options.project;
    const workspace = getWorkspace(tree);

    const architect = workspace.projects[project].architect;
    if (!architect) throw new Error(`expected node projects/${project}/architect in angular.json`);

    const build = architect.build;
    if (!build) throw new Error(`expected node projects/${project}/architect/build in angular.json`);

    // Custom Builders are not part of the CLI's enum
    build.builder = <any>'ngx-build-plus:browser';

    const serve = architect.serve;
    if (!serve) throw new Error(`expected node projects/${project}/architect/serve in angular.json`);

    serve.builder = <any>'ngx-build-plus:dev-server';

    const extractI18n = architect['extract-i18n'];
    if (extractI18n) {
      extractI18n.builder = <any>'ngx-build-plus:extract-i18n';
    }

    // We decided to not add our server builder by default, 
    // b/c the new jsdom-based Universal API only compiles
    // the server code (that is using the browser bundles) 
    // with this builder.
    //
    // const server = architect.server;
    // if (server) {
    //   server.builder = <any>'ngx-build-plus:server';
    // }

    const test = architect.test;
    if (test) test.builder = <any>'ngx-build-plus:karma';

    return updateWorkspace(tree, workspace);
  };
}

  
