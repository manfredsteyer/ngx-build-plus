const path = require('path');
const fs = require('fs');

export function getRootPath() {
    const root = process.mainModule.paths[0].split('node_modules')[0].slice(0, -1);
    return root;
}

export function getDepVersion(depName: string): string {
    const root = getRootPath();
    const packageJsonPath = path.join(root, 'node_modules', depName, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
        return null;
    }
    
    const packageJson = require(packageJsonPath);
    return packageJson['version'];
}