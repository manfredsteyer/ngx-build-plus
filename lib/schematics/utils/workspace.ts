import { Tree } from "@angular-devkit/schematics";

export function getWorkspace(tree: Tree) {
    return JSON.parse(tree.read('angular.json')!.toString('utf-8'));
}

export function updateWorkspace(tree: Tree, workspace: any) {
    tree.overwrite('angular.json', JSON.stringify(workspace));
}