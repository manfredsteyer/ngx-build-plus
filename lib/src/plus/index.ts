import { BrowserBuilder, NormalizedBrowserBuilderSchema, BrowserBuilderSchema } from '@angular-devkit/build-angular';
import { Path, virtualFs, getSystemPath } from '@angular-devkit/core';
import * as fs from 'fs';
import * as path from 'path';
import { PlusBuilderSchema } from './schema';
import { ConfigHookFn, Plugin } from '../ext/hook';
import { BuilderConfiguration, BuildEvent } from '@angular-devkit/architect';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { loadHook } from '../ext/load-hook';

const webpackMerge = require('webpack-merge');

export class PlusBuilder extends BrowserBuilder  {

  private localOptions: any;

  buildWebpackConfig(
    root: Path,
    projectRoot: Path,
    host: virtualFs.Host<fs.Stats>,
    options: PlusBuilderSchema,
  ) {

    let config = super.buildWebpackConfig(root, projectRoot, host, options);

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

    let plugin: Plugin | null = null;
    if (this.localOptions.plugin) {
      plugin = loadHook<Plugin>(this.localOptions.plugin);
    }

    if (plugin && plugin.config) {
      config = plugin.config(config);
    }

    if (this.localOptions.configHook) {
      const hook = loadHook<ConfigHookFn>(this.localOptions.configHook);
      config = hook(config);
    }

    return config;
  }

  run(builderConfig: BuilderConfiguration<PlusBuilderSchema>): Observable<BuildEvent> {
    
    this.localOptions = builderConfig.options;
    let plugin: Plugin | null = null;
    if (builderConfig.options.plugin) {
      plugin = loadHook<Plugin>(builderConfig.options.plugin);
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

export default PlusBuilder;
