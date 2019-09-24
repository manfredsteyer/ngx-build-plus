
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { createTestApp } from '../../testing/schematics';


const collectionPath = path.join(__dirname, '../collection.json');
const projectName = 'ngxTest'


describe('Add ngx-build-plus', () => {
    let runner: SchematicTestRunner;
    let appTree: UnitTestTree;

    beforeEach(async () => {
        runner = new SchematicTestRunner('schematics', collectionPath);
        appTree = await createTestApp(projectName, runner);
    });

    xit('it should add the package as a dev dependency', async () => {
        const tree = await runner.runSchematicAsync('ng-add', { project: projectName }, appTree).toPromise();
        const packageFile = tree.get('./package.json');
        const { devDependencies } = JSON.parse(packageFile!.content.toString());
        expect(devDependencies['ngx-build-plus']).not.toBeUndefined()
    });

    it('it should change default angular builder to custom ngx-build-plus builder', async () => {
        const tree = await runner.runSchematicAsync('ng-add', { project: projectName }, appTree).toPromise();
        const angularJson = tree.get('./angular.json');
        const { projects } = JSON.parse(angularJson!.content.toString());
        expect(projects[projectName].architect.build.builder).toBe('ngx-build-plus:build')
    });

    it('it should change default angular serve builder to custom ngx-build-plus builder', async () => {
        const tree = await runner.runSchematicAsync('ng-add', { project: projectName }, appTree).toPromise();
        const angularJson = tree.get('./angular.json');
        const { projects } = JSON.parse(angularJson!.content.toString());
        expect(projects[projectName].architect.serve.builder).toBe('ngx-build-plus:dev-server')
    });

    it('it should change default angular test builder to custom ngx-build-plus builder', async () => {
        const tree = await runner.runSchematicAsync('ng-add', { project: projectName }, appTree).toPromise();
        const angularJson = tree.get('./angular.json');
        const { projects } = JSON.parse(angularJson!.content.toString());
        expect(projects[projectName].architect.test.builder).toBe('ngx-build-plus:karma')
    });
});