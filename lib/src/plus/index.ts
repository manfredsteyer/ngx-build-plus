import { BrowserBuilder, BrowserBuilderSchema as BrowserBuilderSchemaBase } from '@angular-devkit/build-angular';
import { Path, virtualFs, getSystemPath } from '@angular-devkit/core';
import * as fs from 'fs';
import * as path from 'path';
import { PlusBuilderSchema } from './schema';
import { ConfigHookFn, Plugin } from '../ext/hook';
import { BuilderConfiguration, BuildEvent } from '@angular-devkit/architect';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { loadHook } from '../ext/load-hook';
import { LoggingCallback } from '@angular-devkit/build-webpack';
import { statsToString, statsWarningsToString, statsErrorsToString } from '../stats';

const webpackMerge = require('webpack-merge');

export interface BrowserBuilderSchema extends BrowserBuilderSchemaBase {
  extraWebpackConfig: string;
  singleBundle: boolean;
  keepPolyfills: boolean;
  bundleStyles: boolean;
  configHook: string;
  plugin: string;
}

export class PlusBuilder extends BrowserBuilder  {

  private localOptions: BrowserBuilderSchema;

  protected createLoggingFactory(): (verbose: boolean) => LoggingCallback  {

    return (verbose: boolean): LoggingCallback =>
    (stats, config, logger) => {
      // config.stats contains our own stats settings, added during buildWebpackConfig().

      const json = stats.toJson(config.stats);

      if (verbose) {
        logger.info(stats.toString(config.stats));
      } else {
        logger.info(statsToString(json, config.stats));
      }

      if (stats.hasWarnings()) {
        logger.warn(statsWarningsToString(json, config.stats));
      }
      if (stats.hasErrors()) {
        logger.error(statsErrorsToString(json, config.stats));
      }
    };
  }

  buildWebpackConfig(
    root: Path,
    projectRoot: Path,
    host: virtualFs.Host<fs.Stats>,
    options: PlusBuilderSchema,
  ) {

    let plugin: Plugin<BrowserBuilderSchema, PlusBuilderSchema> | null = null;
    if (this.localOptions.plugin) {
      plugin = loadHook<Plugin<BrowserBuilderSchema, PlusBuilderSchema>>(this.localOptions.plugin);
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

    return config;
  }

  run(builderConfig: BuilderConfiguration<BrowserBuilderSchema>): Observable<BuildEvent> {

    this.localOptions = builderConfig.options;
    let plugin: Plugin<BrowserBuilderSchema, PlusBuilderSchema> | null = null;
    if (builderConfig.options.plugin) {
      plugin = loadHook<Plugin<BrowserBuilderSchema, PlusBuilderSchema>>(builderConfig.options.plugin);
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
