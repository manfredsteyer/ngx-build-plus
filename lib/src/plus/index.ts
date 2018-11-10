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

  buildWebpackConfig(
    root: Path,
    projectRoot: Path,
    host: virtualFs.Host<fs.Stats>,
    options: PlusBuilderSchema,
  ) {

    let config = super.buildWebpackConfig(root, projectRoot, host, options);

    if (options.singleBundle) {
      delete config.entry.polyfills;
      delete config.optimization;
    }

    if (options.singleBundle && options.bundleStyles !== false) {
      delete config.entry.styles;
    }
    
    if (options.extraWebpackConfig) {
      const filePath = path.resolve(getSystemPath(projectRoot), options.extraWebpackConfig);
      const additionalConfig = require(filePath);
      config = webpackMerge([config, additionalConfig]);
    }

    let plugin: Plugin | null = null;
    if (options.plugin) {
      plugin = loadHook<Plugin>(options.plugin);
    }

    if (plugin && plugin.config) {
      config = plugin.config(config);
    }

    if (options.configHook) {
      const hook = loadHook<ConfigHookFn>(options.configHook);
      config = hook(config);
    }

    return config;
  }

  run(builderConfig: BuilderConfiguration<PlusBuilderSchema>): Observable<BuildEvent> {

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
