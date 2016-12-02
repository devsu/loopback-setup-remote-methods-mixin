'use strict';
const Utils = require('./lib/utils');
const _ = require('lodash');
const debug = require('debug')('loopback:contrib:setup-remote-methods-mixin');

module.exports = (Model, options) => {
  if (!Model || !Model.sharedClass) {
    return;
  }
  // wait for all models to be attached so sharedClass.methods() returns all methods
  Model.on('attached', function(server) {
    server.on('started', function() {
      let methodsToDisable = [];

      if (options.disable) {
        methodsToDisable = options.disable;
      }

      if (options.disableAllExcept) {
        let allMethods = Model.sharedClass.methods().map(m => {
          return m.isStatic ? m.name : 'prototype.' + m.name;
        });
        methodsToDisable = _.difference(allMethods, options.disableAllExcept);
      }

      if (options.ignoreACL !== true) {
        let authorizedAclMethods = Utils.getAuthorizedAclMethods(Model);
        methodsToDisable = _.difference(methodsToDisable, authorizedAclMethods);
      }

      if (methodsToDisable.length) {
        methodsToDisable.forEach(methodName => {
          Model.disableRemoteMethodByName(methodName);
        });
        debug('Model `%s`: Disable remote methods:  `%s`', Model.modelName,
          methodsToDisable.join(', '));
      }
    });
  });
};
