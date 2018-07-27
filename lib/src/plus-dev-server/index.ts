import { Path, getSystemPath, virtualFs } from '@angular-devkit/core';
import * as path from 'path';
import * as fs from 'fs';

import { DevServerBuilder as DevServerBuilderBase, BrowserBuilderSchema as BrowserBuilderSchemaBase   } from '@angular-devkit/build-angular';
const webpackMerge = require('webpack-merge');

export interface BrowserBuilderSchema extends BrowserBuilderSchemaBase {
  extraWebpackConfig: string;
  singleBundle: boolean;
}

export class DevServerBuilder extends DevServerBuilderBase {

  buildWebpackConfig(root: Path, projectRoot: Path, host: virtualFs.Host<fs.Stats>, browserOptions: BrowserBuilderSchema): any {
    
    let config = super.buildWebpackConfig(root, projectRoot, host, browserOptions);

    if (browserOptions.singleBundle) {
      delete config.entry.polyfills;
      delete config.entry.styles;
      delete config.optimization;
    }
    
    if (browserOptions.extraWebpackConfig) {
      const filePath = path.resolve(getSystemPath(projectRoot), browserOptions.extraWebpackConfig);
      const additionalConfig = require(filePath);
      config = webpackMerge([config, additionalConfig]);
    }

    return config;
  }
}

export default DevServerBuilder;