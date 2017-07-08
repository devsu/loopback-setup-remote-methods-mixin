'use strict';
const Utils = require('./lib/utils');
const _ = require('lodash');
const path = require('path');
const debug = require('debug')('loopback:contrib:setup-remote-methods-mixin');

module.exports = (Model, options) => {
  if (!Model || !Model.sharedClass) {
    return;
  }

  let methodsAdded = [];

  if (options.add) {
    processAdd();
  }

  if (options.addFromFile) {
    processAddFromFile();
  }

  // wait for all models to be attached so sharedClass.methods() returns all methods
  Model.on('attached', function(server) {
    server.on('started', function() {
      if (options.disable || options.disableAllExcept) {
        processDisable();
      }
    });
  });

  function processAdd() {
    let definitions = {};
    let keys = Object.keys(options.add);
    keys.forEach(key => {
      definitions[key] = options.add[key];
      if (isString(options.add[key])) {
        let definitionMethodName = options.add[key];
        definitions[key] = getMethodWithName(definitionMethodName)();
      }
    });
    addRemoteMethods(definitions);
  }

  function processAddFromFile() {
    let opt = options.addFromFile;
    let addAll = false;

    if (isString(opt)) {
      opt = {filename: opt};
      addAll = true;
    }

    let filename = path.join(process.cwd(), opt.filename);
    let definitions = require(filename);

    if (!addAll) {
      definitions = _.pickBy(definitions, (definition, key) => {
        return _.includes(opt.methods, key);
      });
    }

    definitions = _.mapValues(definitions, definitionMethod => {
      return definitionMethod();
    });

    addRemoteMethods(definitions);
  }

  function addRemoteMethods(methodsToAdd) {
    let methodNames = Object.keys(methodsToAdd);
    methodNames.forEach(methodName => {
      Model.remoteMethod(methodName, methodsToAdd[methodName]);
    });
    debug('Model `%s`: Add remote methods:  `%s`', Model.modelName, methodNames.join(', '));
    methodsAdded = methodsAdded.concat(methodNames);
  }

  function getMethodWithName(methodName) {
    let components = methodName.split('.');
    let method = components.reduce((obj, currentComponent) => {
      return obj[currentComponent];
    }, Model);
    return method;
  }

  let allMethods = null;

  function getAllMethods() {
    // Cache allMethods on demand as it is used in multiple places, but isn't always needed.
    if (!allMethods) {
      allMethods = Model.sharedClass.methods().map(m => {
        return m.isStatic ? m.name : 'prototype.' + m.name;
      });
    }
    return allMethods;
  }

  function expandWildCards(methods) {
    let results = [];
    methods.forEach(methodName => {
      let pattern = methodName.indexOf('*') !== -1 &&
        new RegExp('^' + methodName.replace(/\./g, '\\.').replace(/\*/g, '(.*?)') + '$');
      if (pattern) {
        let matched = getAllMethods().filter(name => pattern.test(name));
        results = results.concat(matched);
      } else {
        results.push(methodName);
      }
    });
    return results;
  }

  function processDisable() {
    let methodsToDisable = [];

    if (options.disable) {
      methodsToDisable = expandWildCards(options.disable);
    }

    if (options.disableAllExcept) {
      let disableAllExcept = expandWildCards(options.disableAllExcept);
      methodsToDisable = _.difference(getAllMethods(), disableAllExcept);
      methodsToDisable = _.difference(methodsToDisable, methodsAdded);
    }

    if (options.ignoreACL !== true) {
      let authorizedAclMethods = Utils.getAuthorizedAclMethods(Model);
      methodsToDisable = _.differenceWith(methodsToDisable, authorizedAclMethods, (a, b) => {
        return a === b || a === 'prototype.' + b;
      });
    }

    disableRemoteMethods(methodsToDisable);
  }

  function disableRemoteMethods(methodsToDisable) {
    methodsToDisable.forEach(methodName => {
      Model.disableRemoteMethodByName(methodName);
    });
    if (methodsToDisable.length) {
      debug('Model `%s`: Disable remote methods:  `%s`', Model.modelName,
        methodsToDisable.join(', '));
    }
  }

  function isString(value) {
    return (typeof value === 'string' || value instanceof String);
  }
};
