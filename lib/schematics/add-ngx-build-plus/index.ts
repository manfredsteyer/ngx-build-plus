import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getWorkspace, updateWorkspace } from '@schematics/angular/utility/config';

export function addNgxBuildPlus(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    
    const project = _options.project;
    const workspace = getWorkspace(tree);

    const architect = workspace.projects[project].architect;
    if (!architect) throw new Error(`expected node projects/${project}/architect in angular.json`);

    const build = architect.build;
    if (!build) throw new Error(`expected node projects/${project}/architect/build in angular.json`);

    // Custom Builders are not part of the CLI's enum
    build.builder = <any>'ngx-build-plus:build';

    const serve = architect.serve;
    if (!serve) throw new Error(`expected node projects/${project}/architect/serve in angular.json`);

    serve.builder = <any>'ngx-build-plus:dev-server';

    return updateWorkspace(workspace);
  };
}

