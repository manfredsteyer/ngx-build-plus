# ngx-build-modern: Differential Serving for Angular and the CLI

> Stop making all of your users pay for IE9 -- Stephen Fluin from the Angular Team at [Angular Mix 2018](https://docs.google.com/presentation/d/1uEeFwJ7bubdNwVF2lDhyhT8Pkl9jRSoStxE0lFV867Y/preview?slide=id.g43c65a1fb9_1_266)

## Features

- 📦 Create optimized bundles for modern browsers 
- 📦 Create legacy bundles for older browsers
- 📦 Make the browser load the right set of bundles
- 📦 Automate this all by providing an CLI extension

## Why is this a good idea

Because of downleveling to ES5 and importing lots of polyfills for IE, a simple Hello-World app comes already with an overhead of ~ 70 KB. This overhead increases when the applications becomes bigger and when it uses more parts of Angular and other libraries. This extension to the CLI provides a solution!

## Acknowledgments

Big thanks to ...

- [Stephen Fluin](https://twitter.com/stephenfluin) from the Angular Team for his inspirational [talk](https://docs.google.com/presentation/d/1uEeFwJ7bubdNwVF2lDhyhT8Pkl9jRSoStxE0lFV867Y/preview?slide=id.g43c65a1fb9_1_266) at Angular Mix 2018.
- [Rob Wormald](https://twitter.com/robwormald) from the Angular Team for an enlightening chat about this topic in the context of Angular Elements and Polyfills.
- [The Vue CLI Team](https://cli.vuejs.org) for implementing this idea for Vue and sharing their implementation via GitHub.

## What you need

- Angular >= 7.0.0
- Angular CLI >= 7.0.0

## Getting Started

Using this library is quite automated. You just need the following commands:

```
ng add ngx-build-plus
ng add ngx-build-modern
```

After this, you'll find a ``polyfills.modern.ts`` file in your project. Make sure, it just contains the polyfills your modern browsers need. The kown ``polyfills.ts`` should still contain all   polyfills including the ones for legacy browsers.

``ng add`` also creates a npm script build:modern. Use it to create production bundles for modern and legacy browsers:

```
npm run build:modern
```

## Using ngx-build-modern in monorepos

If you have more than one project in your CLI-based solution, you have to mention the project using the ``--project`` flag:

```
ng add ngx-build-plus --project demo
ng add ngx-build-modern --project demo
```

In this example, ``demo`` is the name of the project in question. To build your project, ``ng add`` creates an additional npm script for you:

```
npm run build:modern:demo
```

## Known Limitations

- This plugin needs to switch the CLI into verbose mode to prevent a code conflict. I plan a PR to the CLI that solves this.
- This solution extends the webpack-based builder. Hence, its limited to using webpack under the covers of the CLI.
- Make sure to use the latest rxjs lib. This lib was successfully tested with version 6.3.3. On the other side, with 6.1.1 there have been some issues regarding tree shaking and the build optimizer in conjunction with ES2015 bundles.
- Because this plugin is building the application twice -- once for legacy browsers and once for modern ones -- build time doubles. PRs for compensating this by performing the two builds in parallel are welcome.