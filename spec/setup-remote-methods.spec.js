'use strict';

const disableRemoteMethods = require('../setup-remote-methods');
const mocks = require('./mocks');

describe('setupRemoteMethods', () => {
  let MyModel;

  beforeEach(() => {
    MyModel = mocks.getModelMock();
  });

  describe('disable', () => {
    let options;

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
        disableRemoteMethods(MyModel, options);
        expect(MyModel.disableRemoteMethodByName.calls.count()).toEqual(4);
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
        disableRemoteMethods(MyModel, options);
        expect(MyModel.disableRemoteMethodByName.calls.count()).toEqual(3);
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
        disableRemoteMethods(MyModel, options);
        expect(MyModel.disableRemoteMethodByName.calls.count()).toEqual(3);
        expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledWith('create');
        expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledWith('findById');
        expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledWith('prototype.five');
        expect(MyModel.disableRemoteMethodByName).not.toHaveBeenCalledWith('one');
      });
    });
  });

  describe('disableAllExcept', () => {
    let options;

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
        disableRemoteMethods(MyModel, options);
        expect(MyModel.disableRemoteMethodByName.calls.count()).toEqual(5);
        expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledWith('two');
        expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledWith('three');
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
        disableRemoteMethods(MyModel, options);
        expect(MyModel.disableRemoteMethodByName.calls.count()).toEqual(3);
        expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledWith('four');
        expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledWith('prototype.six');
        expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledWith('findById');
        expect(MyModel.disableRemoteMethodByName).not.toHaveBeenCalledWith('create');
        expect(MyModel.disableRemoteMethodByName).not.toHaveBeenCalledWith('one');
        expect(MyModel.disableRemoteMethodByName).not.toHaveBeenCalledWith('two');
        expect(MyModel.disableRemoteMethodByName).not.toHaveBeenCalledWith('three');
        expect(MyModel.disableRemoteMethodByName).not.toHaveBeenCalledWith('prototype.five');
      });
    });

    describe('when ignoreACL is undefined', () => {
      beforeEach(() => {
        options.ignoreACL = undefined;
      });

      it('should disable all methods, except the options or if they are in the ACL', () => {
        disableRemoteMethods(MyModel, options);
        expect(MyModel.disableRemoteMethodByName.calls.count()).toEqual(3);
        expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledWith('four');
        expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledWith('prototype.six');
        expect(MyModel.disableRemoteMethodByName).toHaveBeenCalledWith('findById');
        expect(MyModel.disableRemoteMethodByName).not.toHaveBeenCalledWith('create');
        expect(MyModel.disableRemoteMethodByName).not.toHaveBeenCalledWith('one');
        expect(MyModel.disableRemoteMethodByName).not.toHaveBeenCalledWith('two');
        expect(MyModel.disableRemoteMethodByName).not.toHaveBeenCalledWith('three');
        expect(MyModel.disableRemoteMethodByName).not.toHaveBeenCalledWith('prototype.five');
      });
    });
  });
});
