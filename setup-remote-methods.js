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
        methodsToDisable = _.differenceWith(methodsToDisable, authorizedAclMethods, (a, b) => {
          return a === b || a === 'prototype.' + b;
        });
      }

      if (options.add) {
        addRemoteMethods(Model, options.add);
      }

      if (methodsToDisable.length) {
        disableRemoteMethods(Model, methodsToDisable);
      }
    });
  });
};

function addRemoteMethods(Model, addOptions) {
  let keys = Object.keys(addOptions);
  keys.forEach(key => {
    let value = addOptions[key];
    addRemoteMethod(Model, key, value);
  });
}

function addRemoteMethod(Model, key, value) {
  if (typeof value === 'object' && value !== null) {
    Model.remoteMethod(key, value);
    return;
  }

  if (typeof value === 'string' || value instanceof String) {
    let components = value.split('.');
    let method = components.reduce((obj, currentComponent) => {
      return obj[currentComponent];
    }, Model);
    Model.remoteMethod(key, method());
  }
}

function disableRemoteMethods(Model, methodsToDisable) {
  methodsToDisable.forEach(methodName => {
    Model.disableRemoteMethodByName(methodName);
  });
  debug('Model `%s`: Disable remote methods:  `%s`', Model.modelName,
    methodsToDisable.join(', '));
}
