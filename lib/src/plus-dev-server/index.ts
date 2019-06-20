import { Path, getSystemPath, virtualFs } from '@angular-devkit/core';
import * as path from 'path';
import * as fs from 'fs';
import { ConfigHookFn, Plugin } from '../ext/hook';
import { loadHook } from '../ext/load-hook';
import { PlusBuilderSchema } from 'src/plus/schema';

import { DevServerBuilder as DevServerBuilderBase, DevServerBuilderOptions as DevServerBuilderOptionsBase } from '@angular-devkit/build-angular';
import { BuilderConfiguration, BuildEvent } from '@angular-devkit/architect';

import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

const webpackMerge = require('webpack-merge');

export interface DevServerBuilderOptions extends DevServerBuilderOptionsBase {
  extraWebpackConfig: string;
  singleBundle: boolean;
  keepPolyfills: boolean;
  bundleStyles: boolean;
  configHook: string;
  plugin: string;
}

export class PlusDevServerBuilder extends DevServerBuilderBase {

  private localOptions: any;

  buildWebpackConfig(
    root: Path,
    projectRoot: Path,
    host: virtualFs.Host<fs.Stats>,
    options: PlusBuilderSchema,
  ) {

    let plugin: Plugin<DevServerBuilderOptions, PlusBuilderSchema> | null = null;
    if (this.localOptions.plugin) {
      plugin = loadHook<Plugin<DevServerBuilderOptions, PlusBuilderSchema>>(this.localOptions.plugin);
    }

    if (plugin && plugin.preConfig) {
      plugin.preConfig(options);
    }

    let config = super.buildWebpackConfig(root, projectRoot, host, options);

    if (this.localOptions.singleBundle) {
      if (!this.localOptions.keepPolyfills) {
        delete config.entry.polyfills;
      }
      delete config.optimization.runtimeChunk;
      delete config.optimization.splitChunks;
    }

    if (this.localOptions.singleBundle && this.localOptions.bundleStyles !== false) {
      delete config.entry.styles;
    }

    if (this.localOptions.extraWebpackConfig) {
      const filePath = path.resolve(getSystemPath(projectRoot), this.localOptions.extraWebpackConfig);
      const additionalConfig = require(filePath);
      config = webpackMerge([config, additionalConfig]);
    }

    if (plugin && plugin.config) {
      config = plugin.config(config);
    }

    if (this.localOptions.configHook) {
      const hook = loadHook<ConfigHookFn>(this.localOptions.configHook);
      config = hook(config);
    }

    if (options.verbose) {
      console.debug('modified webpack config', config);
    }

    return config;
  }

  run(builderConfig: BuilderConfiguration<DevServerBuilderOptions>): Observable<BuildEvent> {

    this.localOptions = builderConfig.options;
    let plugin: Plugin<DevServerBuilderOptions, PlusBuilderSchema> | null = null;
    if (builderConfig.options.plugin) {
      plugin = loadHook<Plugin<DevServerBuilderOptions, PlusBuilderSchema>>(builderConfig.options.plugin);
    }

    if (plugin && plugin.pre) {
      plugin.pre(builderConfig);
    }

    return super.run(builderConfig).pipe(
      tap(_ => {
        if (plugin && plugin.post) {
          plugin.post(builderConfig);
        }
      })
    );

  }


}

export default PlusDevServerBuilder;
