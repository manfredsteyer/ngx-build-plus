import { SchematicTestRunner, UnitTestTree } from "@angular-devkit/schematics/testing";

import { Tree } from "@angular-devkit/schematics/src/tree/interface";

export async function createTestApp(projectName: string, runner: SchematicTestRunner, appOptions = {}, tree?: Tree):
    Promise<UnitTestTree> {
    const workspaceTree = await runner.runExternalSchematic('@schematics/angular', 'workspace', {
        name: 'workspace',
        version: '7.0.0',
        newProjectRoot: 'projects',
    }, tree);

    return await runner.runExternalSchematicAsync('@schematics/angular', 'application',
        { name: projectName, ...appOptions }, workspaceTree).toPromise();
}