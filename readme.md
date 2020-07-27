# ngx-build-plus

Extend the Angular CLI's default build behavior without ejecting:

- 📄 Extend the default behavior by providing a **partial** config that just contains your additional settings
- 📄 Alternative: Extend the default behavior by providing a custom function
- 📦 Optional: Build a single bundle (e. g. for Angular Elements)
- ☑️ Inherits from the default builder, hence you have the same options
- ☑️ Provides schematics for some advanced use cases like webpack externals
- 🍰 Simple to use 
- ⏏️ No eject needed

## Credits

Big thanks to [Rob Wormald](https://twitter.com/robwormald) and [David Herges](https://twitter.com/davidh_23)!

## Get the right version

- Angular 6-7/ CLI 6-7: ngx-build-plus@^7
- Angular 8/ CLI 8: ngx-build-plus^8.0.0
- Angular 9/ CLI 9: ngx-build-plus^9.0.0

## Updating to Version 8

```
ng update ngx-build-plus --force
```

## Breaking Changes

## Version 7

- The switch ``single-bundle`` now defaults to ``false`` to align with the CLI's default behavior.

## Version 9

- `keepPolyfills` and `keepStyles` default to true to avoid misunderstandings.

## Schematics and Options

### Options

- ``ng build --single-bundle``: Puts everything reachable from the main entry point into one bundle. Polyfills, scripts, and styles stay in their own bundles as the consuming application might have its own versions of these.

### Schematics

- ``ng add ngx-build-plus``
- ``ng g ngx-build-plus:wc-polyfill``: Adds webcomponent polyfills to your app 
- ``ng g ngx-build-plus:externals``: Updates your app to use webpack externals (see example at the end)

## Getting started

This shows a minimal example for getting started. It uses a minimal partial webpack configuration that is merged into the CLI's one. Representative for all possible custom webpack configurations, the used one just leverages the ``DefinePlugin`` to create a global ``VERSION`` constant during the build.

Please find the example shown here in the sample application in the folder ``projects/getting-started``.

1. Create a new Angular project with the CLI
2. Add ngx-build-plus: ``ng add ngx-build-plus``
   
   **Note:** If you want to add it to specific sub project in your ``projects`` folder, use the ``--project`` switch to point to it: ``ng add ngx-build-plus --project getting-started``
  
   **Remark:** This step installs the package via npm and updates your angular.json so that your project uses custom builders for ``ng serve`` and ``ng build``.
   
3. Add a file ``webpack.partial.js`` to the root of your (sub-)project:

    ```javascript
    const webpack = require('webpack');

    module.exports = {
        plugins: [
            new webpack.DefinePlugin({
                "VERSION": JSON.stringify("4711")
            })
        ]
    }
    ```
4. Use the global variable VERSION in your ``app.component.ts``:

    ```typescript
    import { Component } from '@angular/core';

    declare const VERSION: string;

    @Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
    })
    export class AppComponent {
    title = 'Version: ' + VERSION;
    }
    ```

5. Start your application with the ``--extra-webpack-config`` switch pointing to your partial webpack config:

    ```
    ng serve --extra-webpack-config webpack.partial.js -o
    ```

    If your project is a CLI based sub project, use the ``--project`` switch too:

    ```
    ng serve --project getting-started -o --extra-webpack-config webpack.partial.js
    ```

    **Hint**: Consider creating a npm script for this command.

6. Make sure that the VERSION provided by your webpack config is displayed.

## ngx-build-plus and Angular Elements

While ``ngx-build-plus`` can be used in every Angular configuration, it also comes with some schematics automating some scenarios for Angular Elements. More information about can be found [here](https://www.softwarearchitekt.at/post/2019/01/27/building-angular-elements-with-the-cli.aspx).

## Using Plugins

Plugins allow you to provide some custom code that modifies your webpack configuration. In addition to that, they also provide a pre- and a post-hook for tasks that need to take happen before and after bundling. This is an example for an plugin:

```typescript
export default {
    pre(options) {
        console.debug('pre');
    },
    config(cfg) {
        console.debug('config');
        return cfg;
    },
    post(options) {
        console.debug('post');
    }
}
```

As this plugin is written with TypeScript you need to compile it.

The ``config`` method works like a ``configHook`` (see above).

To use a plugin, point to it's JavaScript representation (not the TypeScript file) using the ``--plugin`` switch:

```
ng build --plugin ~dist\out-tsc\hook\plugin
```

The prefix ``~`` points to the current directory. Without this prefix, ngx-build-plus assumes that the plugin is an installed ``node_module``.

## Using different merging strategies

You can also use plugins to implement different merging strategies. The following plugin demonstrates this:

```javascript
var merge = require('webpack-merge');
var webpack = require('webpack');

exports.default = {
    config: function(cfg) {
        const strategy = merge.strategy({
            'plugins': 'prepend'
        });

        return strategy (cfg, {
            plugins: [
                new webpack.DefinePlugin({
                    "VERSION": JSON.stringify("4711")
                })
            ]
        });
    }
}
```
To execute this, use the following command:

```
ng build --plugin ~my-plugin.js
```

One more time, the ``~`` tells ngx-build-plus that the plugin is not an installed node_module but a local file.

## Advanced example: Externals and Angular Elements

This shows another example for using ``ngx-build-plus``. It uses a custom webpack configuration to define some dependencies of an Angular Element as external which can be loaded separately into the browser and shared among several bundles.

*If you are not interested into this very use case, skip this section.*

The result of this description can be found in the [repository's](https://github.com/manfredsteyer/ngx-build-plus) ``sample`` directory.

1. Create a new Angular CLI based project and install ``@angular/elements`` as well as ``@webcomponents/custom-elements`` which provides needed polyfills:

    ```
    npm i @angular/elements --save
    ```

2. Expose a component as an Custom Element:

    ```TypeScript
    import { BrowserModule } from '@angular/platform-browser';
    import { NgModule, Injector } from '@angular/core';
    import { createCustomElement } from '@angular/elements';

    import { AppComponent } from './app.component';

    @NgModule({
        imports: [
            BrowserModule
        ],
        declarations: [
            AppComponent
        ],
        providers: [],
        bootstrap: [],
        entryComponents:[AppComponent]
    })
    export class AppModule { 

        constructor(private injector: Injector) {
        }

        ngDoBootstrap() {
            const elm = createCustomElement(AppComponent, { injector: this.injector });
            customElements.define('custom-element', elm);
        }

    }
    ```
3. Install ``ngx-build-plus``:

    When using Angular >= 7 and CLI >= 7, you can simply use ``ng add`` for installing ``ngx-build-plus``:

    ```
    ng add ngx-build-plus 
    ```

    If you are using a monorepo, mention the project you want to install ngx-build-plus for:

    ```
    ng add ngx-build-plus --project myProject
    ```

4. Add polyfills:
   
   ```
   ng g ngx-build-plus:wc-polyfill --project myProject
   ```

5. Execute the externals schematc:
   
   ```
   ng g ngx-build-plus:externals --project myProject
   ```

6. This creates a partial webpack config in your project's root:

    ```JavaScript
    module.exports = {
        "externals": {
            "rxjs": "rxjs",
            "@angular/core": "ng.core",
            "@angular/common": "ng.common",
            "@angular/platform-browser": "ng.platformBrowser",
            "@angular/elements": "ng.elements"
        }
    }
    ```

7. Build your application. You can use the npm script created by the above mentioned schematic:

    ```
    npm run build:externals:myProject
    ```

8. Angular will now be compiled into a ``scripts.js`` and can be reused amongs several seperately compiled bundles. Your code is in the main bundle which is quite tiny b/c it does not contain Angular.


Further information about this can be found in my blog [here](https://www.softwarearchitekt.at/post/2019/01/27/building-angular-elements-with-the-cli.aspx).

## Angular Trainings, Consultings, Schulungen

see http://www.softwarearchitekt.at


