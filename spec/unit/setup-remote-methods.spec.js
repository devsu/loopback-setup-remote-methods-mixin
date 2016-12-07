'use strict';

const path = require('path');
const setupRemoteMethods = require('../../setup-remote-methods');
const employeeRemotes = require('./employee-remotes');
const mocks = require('./mocks');

describe('setupRemoteMethods', () => {
  let MyModel, options;

  beforeEach(() => {
    MyModel = mocks.getModelMock();
  });

  describe('disable', () => {
    beforeEach(() => {
      options = {
        'disable': ['create', 'findById', 'one', 'prototype.five'],
      };
    });

    describe('when ignoreACL is true', () => {
      beforeEach(() => {
        options.ignoreACL = true;
      });

      it('should disable the methods, even if they are in the ACL', () => {
        setupRemoteMethods(MyModel, options);
        expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledTimes(4);
        expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledWith('create');
        expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledWith('findById');
        expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledWith('one');
        expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledWith('prototype.five');
      });
    });

    describe('when ignoreACL is false', () => {
      beforeEach(() => {
        options.ignoreACL = false;
      });

      it('should disable the methods, except if they are in the ACL', () => {
        setupRemoteMethods(MyModel, options);
        expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledTimes(3);
        expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledWith('create');
        expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledWith('findById');
        expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledWith('prototype.five');
        expect(MyModel.disableRemoteMethodByName).not.toHaveBeenCalledWith('one');
      });
    });

    describe('when ignoreACL is undefined', () => {
      beforeEach(() => {
        options.ignoreACL = undefined;
      });

      it('should disable the methods, except if they are in the ACL', () => {
        setupRemoteMethods(MyModel, options);
        expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledTimes(3);
        expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledWith('create');
        expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledWith('findById');
        expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledWith('prototype.five');
        expect(MyModel.disableRemoteMethodByName).not.toHaveBeenCalledWith('one');
      });
    });
  });

  describe('disableAllExcept', () => {
    beforeEach(() => {
      options = {
        'disableAllExcept': ['create', 'one', 'prototype.five'],
      };
    });

    describe('when ignoreACL is true', () => {
      beforeEach(() => {
        options.ignoreACL = true;
      });

      it('should disable all methods except the options, even if they are in the ACL', () => {
        setupRemoteMethods(MyModel, options);
        expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledTimes(5);
        expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledWith('two');
        expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledWith('prototype.three');
        expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledWith('four');
        expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledWith('prototype.six');
        expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledWith('findById');
        expect(MyModel.disableRemoteMethodByName).not.toHaveBeenCalledWith('create');
        expect(MyModel.disableRemoteMethodByName).not.toHaveBeenCalledWith('one');
        expect(MyModel.disableRemoteMethodByName).not.toHaveBeenCalledWith('prototype.five');
      });
    });

    describe('when ignoreACL is false', () => {
      beforeEach(() => {
        options.ignoreACL = false;
      });

      it('should disable all methods, except the options or if they are in the ACL', () => {
        setupRemoteMethods(MyModel, options);
        expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledTimes(3);
        expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledWith('four');
        expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledWith('prototype.six');
        expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledWith('findById');
        expect(MyModel.disableRemoteMethodByName).not.toHaveBeenCalledWith('create');
        expect(MyModel.disableRemoteMethodByName).not.toHaveBeenCalledWith('one');
        expect(MyModel.disableRemoteMethodByName).not.toHaveBeenCalledWith('two');
        expect(MyModel.disableRemoteMethodByName).not.toHaveBeenCalledWith('prototype.three');
        expect(MyModel.disableRemoteMethodByName).not.toHaveBeenCalledWith('prototype.five');
      });
    });

    describe('when ignoreACL is undefined', () => {
      beforeEach(() => {
        options.ignoreACL = undefined;
      });

      it('should disable all methods, except the options or if they are in the ACL', () => {
        setupRemoteMethods(MyModel, options);
        expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledTimes(3);
        expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledWith('four');
        expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledWith('prototype.six');
        expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledWith('findById');
        expect(MyModel.disableRemoteMethodByName).not.toHaveBeenCalledWith('create');
        expect(MyModel.disableRemoteMethodByName).not.toHaveBeenCalledWith('one');
        expect(MyModel.disableRemoteMethodByName).not.toHaveBeenCalledWith('two');
        expect(MyModel.disableRemoteMethodByName).not.toHaveBeenCalledWith('prototype.three');
        expect(MyModel.disableRemoteMethodByName).not.toHaveBeenCalledWith('prototype.five');
      });
    });

    it('should not disable methods added by the "add" option', () => {
      options.ignoreACL = true;
      options.add = {'two': {}};
      setupRemoteMethods(MyModel, options);
      expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledTimes(4);
      expect(MyModel.disableRemoteMethodByName).not.toHaveBeenCalledWith('two');
    });

    it('should not disable methods added by the "addFromFile" option', () => {
      options.ignoreACL = true;
      options.addFromFile = './spec/unit/employee-remotes.js';
      setupRemoteMethods(MyModel, options);
      expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledTimes(4);
      expect(MyModel.disableRemoteMethodByName).not.toHaveBeenCalledWith('one');
      expect(MyModel.disableRemoteMethodByName).not.toHaveBeenCalledWith('two');
    });

    it('should not disable methods added by the "addFromFile" option', () => {
      options.ignoreACL = true;
      options.addFromFile = {
        filename: './spec/unit/employee-remotes.js',
        methods: ['two'],
      };
      setupRemoteMethods(MyModel, options);
      expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledTimes(4);
      expect(MyModel.disableRemoteMethodByName).not.toHaveBeenCalledWith('two');
    });
  });

  describe('add', () => {
    let methodDefinition, methodDefinition2;

    beforeEach(() => {
      methodDefinition = {
        accepts: {arg: 'msg', type: 'string'},
        returns: {arg: 'greeting', type: 'string'},
      };
      methodDefinition2 = {};
    });

    describe('when receiving the definition as an object', () => {
      beforeEach(() => {
        options = {
          add: {
            greet: methodDefinition,
            ping: methodDefinition2,
          },
        };
      });

      it('should add the remote method using the received definition', () => {
        setupRemoteMethods(MyModel, options);
        expect(MyModel.remoteMethod).toHaveBeenCalledTimes(2);
        expect(MyModel.remoteMethod).toHaveBeenCalledWith('greet', methodDefinition);
        expect(MyModel.remoteMethod).toHaveBeenCalledWith('ping', methodDefinition2);
      });
    });

    describe('when receiving the definition as an string', () => {
      beforeEach(() => {
        options = {
          add: {
            greet: 'remotesDefinitions.greet',
            ping: 'remotesDefinitions.ping',
          },
        };
        MyModel.remotesDefinitions = {
          greet: function() {
            return methodDefinition;
          },
          ping: function() {
            return methodDefinition2;
          },
        };
      });

      it('should add the remote method using the received definition', () => {
        setupRemoteMethods(MyModel, options);
        expect(MyModel.remoteMethod).toHaveBeenCalledTimes(2);
        expect(MyModel.remoteMethod).toHaveBeenCalledWith('greet', methodDefinition);
        expect(MyModel.remoteMethod).toHaveBeenCalledWith('ping', methodDefinition2);
      });
    });
  });

  describe('addFromFile', () => {
    let originalCWD;

    beforeAll(() => {
      // Modifying process.cwd, to test that it will be taken into account when defining the definitions path.
      originalCWD = process.cwd();
      process.cwd = () => {
        return path.join(originalCWD, 'spec');
      };
    });

    afterAll(() => {
      // reverting the change we made
      process.cwd = originalCWD;
    });

    describe('when receiving the definition as an object', () => {
      beforeEach(() => {
        options = {
          addFromFile: {
            // the path is relative to the process.cwd we defined above
            filename: './unit/employee-remotes.js',
            methods: ['one'],
          },
        };
      });

      it('should add the specified methods from the definitions', () => {
        setupRemoteMethods(MyModel, options);
        expect(MyModel.remoteMethod).toHaveBeenCalledTimes(1);
        expect(MyModel.remoteMethod).toHaveBeenCalledWith('one', employeeRemotes.one());
      });
    });

    describe('when receiving the definition as an string', () => {
      beforeEach(() => {
        options = {
          // the path is relative to the process.cwd we defined above
          addFromFile: './unit/employee-remotes.js',
        };
      });

      it('should add all remote methods from the definitions', () => {
        setupRemoteMethods(MyModel, options);
        expect(MyModel.remoteMethod).toHaveBeenCalledTimes(2);
        expect(MyModel.remoteMethod).toHaveBeenCalledWith('one', employeeRemotes.one());
        expect(MyModel.remoteMethod).toHaveBeenCalledWith('two', employeeRemotes.two());
      });
    });
  });
});
