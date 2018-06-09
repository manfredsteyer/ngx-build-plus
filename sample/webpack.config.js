/* 
  This is just for a direct webpack-based build
  that can be compared with the result of the
  builder. It's not needed if you just want to
  use the builder.
*/

const AotPlugin = require('@ngtools/webpack').AngularCompilerPlugin;
const path = require('path');
const PurifyPlugin = require('@angular-devkit/build-optimizer').PurifyPlugin;
const webpack = require('webpack');

const config = {
  entry: './src/main.ts',
  resolve: {
    mainFields: ['browser', 'module', 'main']
  },
  module: {
    rules: [
      { test: /\.ts$/, loaders: ['@ngtools/webpack'] },
      // { test: /\.html$/, loader: 'html-loader',  options: { minimize: true } },
      /*{
        test: /\.css$/,
        "use": [
          "style-loader",
          {
            "loader": "css-loader",
            "options": {
              "sourceMap": false,
              "import": false
            }
          }
        ]
      },*/
      
      {
        test: /\.js$/,
        loader: '@angular-devkit/build-optimizer/webpack-loader',
        options: {
          sourceMap: false
        }
      }
      
    ]
  },
  plugins: [
    
    new AotPlugin({
      skipCodeGeneration: false,
      tsConfigPath: './src/tsconfig.app.json',
      hostReplacementPaths: {
        "./src/environments/environment.ts": "./src/environments/environment.prod.ts"
      },
      entryModule: path.resolve(__dirname, './src/app/app.module#AppModule' )
    }),
    
    new PurifyPlugin()
    
  ],
  output: {
    path: __dirname + '/dist',
    filename: 'custom-element.bundle.js',
   // libraryTarget: "umd"
  },
  externals: {
    'rxjs': 'rxjs',
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    '@angular/platform-browser': 'ng.platformBrowser',
    '@angular/elements': 'ng.elements'
  },
  mode: 'production'
};



module.exports = [config];