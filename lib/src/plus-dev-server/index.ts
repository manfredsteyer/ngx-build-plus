import { Path, getSystemPath, virtualFs } from '@angular-devkit/core';
import * as path from 'path';
import * as fs from 'fs';
import { ConfigHookFn } from '../ext/hook';
import { loadHook } from '../ext/load-hook';

import { DevServerBuilder as DevServerBuilderBase, BrowserBuilderSchema as BrowserBuilderSchemaBase   } from '@angular-devkit/build-angular';
const webpackMerge = require('webpack-merge');

export interface BrowserBuilderSchema extends BrowserBuilderSchemaBase {
  extraWebpackConfig: string;
  singleBundle: boolean;
  bundleStyles: boolean;
  configHook: string;
}

export class PlusDevServerBuilder extends DevServerBuilderBase {

  private localOptions: any;

  run(builderConfig: any): any {
        this.localOptions = builderConfig.options;
    return super.run(builderConfig);
  }

  buildWebpackConfig(root: Path, projectRoot: Path, host: virtualFs.Host<fs.Stats>, browserOptions: BrowserBuilderSchema): any {

    let config = super.buildWebpackConfig(root, projectRoot, host, browserOptions);

    if (this.localOptions.singleBundle) {
      delete config.entry.polyfills;
      delete config.optimization;
    }

    if (this.localOptions.singleBundle && this.localOptions.bundleStyles !== false) {
      delete config.entry.styles;
    }

    if (this.localOptions.extraWebpackConfig) {
      const filePath = path.resolve(getSystemPath(projectRoot), this.localOptions.extraWebpackConfig);
      const additionalConfig = require(filePath);
      config = webpackMerge([config, additionalConfig]);
    }

    if (this.localOptions.configHook) {
      const hook = loadHook<ConfigHookFn>(this.localOptions.configHook);
      config = hook(config);
    }

    return config;
  }

  _buildServerConfig(root, projectRoot, options, browserOptions) {
    let devServerConfig = super._buildServerConfig(root, projectRoot, options, browserOptions);

    if (this.localOptions.extraWebpackConfig) {
      const filePath = path.resolve(core_1.getSystemPath(projectRoot), this.localOptions.extraWebpackConfig);
      const additionalConfig = require(filePath).devServer || {};
      devServerConfig = webpackMerge([devServerConfig, additionalConfig]);
    }

    return devServerConfig;
  }
}

export default PlusDevServerBuilder;
