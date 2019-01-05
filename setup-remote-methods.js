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
  Model.on('attached', function() {
    if (options.disable || options.disableAllExcept || options.relations) {
      processDisable();
    }
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

  function processDisable() {
    const allMethods = getAllMethods();
    let methodsToDisable = [];
    let methodsToKeep = [];

    if (options.disable) {
      methodsToDisable = expandWildCards(options.disable);
    }

    if (options.relations) {
      const allRelations = Object.keys(Model.settings.relations);
      let relationNames = Object.keys(options.relations);
      allMethods.forEach(method => {
        _.intersection(allRelations, relationNames).forEach(relationName => {
          if (options.relations[relationName].disableAllExcept) {
            let allRelationMethods = getRelationMethodsByRelationName(relationName);
            options.relations[relationName].disableAllExcept.forEach(relationMethod => {
              if (method === 'prototype.__' + relationMethod + '__' + relationName) {
                methodsToKeep.push(method);
              }
            });
            methodsToDisable = methodsToDisable.concat(_.difference(allRelationMethods, methodsToKeep));
          }
        });
      });
    }

    if (options.disableAllExcept) {
      methodsToKeep = methodsToKeep.concat(expandWildCards(options.disableAllExcept));
      methodsToDisable = _.difference(allMethods, methodsToKeep);
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

  function getMethodWithName(methodName) {
    let components = methodName.split('.');
    let method = components.reduce((obj, currentComponent) => {
      return obj[currentComponent];
    }, Model);
    return method;
  }

  function getAllMethods() {
    const allMethods = Model.sharedClass.methods().map(m => {
      return m.isStatic ? m.name : 'prototype.' + m.name;
    });
    return allMethods.concat(getAllRelationsMethods());
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

  // Not fully tested, but based on documentation from
  // https://loopback.io/doc/en/lb2/Accessing-related-models.html
  // and https://loopback.io/doc/en/lb3/Accessing-related-models.html
  const methodsByRelationType = {
    'belongsTo': ['get'],
    'hasOne': ['create', 'get', 'update', 'destroy'],
    'hasMany': ['count', 'create', 'delete', 'destroyById', 'findById', 'get', 'updateById'],
    'hasManyThrough': ['count', 'create', 'delete', 'destroyById', 'exists', 'findById',
      'get', 'link', 'updateById', 'unlink'],
    'hasAndBelongsToMany': ['count', 'create', 'delete', 'destroyById', 'exists', 'findById',
      'get', 'link', 'updateById', 'unlink'],
    'embedsOne': ['create', 'get', 'update', 'destroy'],
    'embedsMany': ['count', 'create', 'delete', 'destroyById', 'findById', 'get', 'updateById'],
  };

  function getAllRelationsMethods() {
    let relationMethods = [];
    Object.keys(Model.definition.settings.relations).forEach(function(relationName) {
      relationMethods = relationMethods.concat(getRelationMethodsByRelationName(relationName));
    });
    return relationMethods;
  }

  function getRelationMethodsByRelationName(relationName) {
    const relationMethods = [];
    const relation = Model.definition.settings.relations[relationName];
    let relationType = relation.type;
    if (relationType === 'hasMany' && relation.through !== undefined) {
      relationType = 'hasManyThrough';
    }
    const methodsByRelation = methodsByRelationType[relationType];
    if (!methodsByRelation) {
      return;
    }
    methodsByRelation.forEach(function(methodName) {
      relationMethods.push('prototype.__' + methodName + '__' + relationName);
    });
    return relationMethods;
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
