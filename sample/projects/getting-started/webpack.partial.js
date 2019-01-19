const webpack = require('webpack');

module.exports = {
    plugins: [
        new webpack.DefinePlugin({
            "VERSION": JSON.stringify("4711")
        })
    ],

    devServer: {
        headers: {
          "Access-Control-Allow-Origin": "https://localhost.intranet:8081",
          "Access-Control-Allow-Credentials": "true"
        }
      }
}