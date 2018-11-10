"use strict";
exports.__esModule = true;
exports["default"] = {
    config: function (cfg) {
        console.debug('config');
        return cfg;
    },
    pre: function () {
        console.debug('pre');
    },
    post: function () {
        console.debug('post');
    }
};
