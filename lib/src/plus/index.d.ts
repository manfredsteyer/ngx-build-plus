/// <reference types="node" />
import { BrowserBuilder } from '@angular-devkit/build-angular';
import { Path, virtualFs } from '@angular-devkit/core';
import * as fs from 'fs';
import { PlusBuilderSchema } from './schema';
export declare class PlusBuilder extends BrowserBuilder {
    buildWebpackConfig(root: Path, projectRoot: Path, host: virtualFs.Host<fs.Stats>, options: PlusBuilderSchema): any;
}
export default PlusBuilder;
