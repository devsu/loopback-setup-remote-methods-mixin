'use strict';

const utils = require('../../../lib/utils');
const mocks = require('../mocks');

describe('utils', () => {
  describe('getAuthorizedAclMethods', () => {
    let MyModel;

    beforeEach(() => {
      MyModel = mocks.getModelMock();
    });

    it('should return the authorized ACL methods for the model', done => {
      const expected = ['one', 'two', 'three'];
      MyModel.on('attached', () => {
        const actual = utils.getAuthorizedAclMethods(MyModel);
        expect(actual).toEqual(expected);
        done();
      });
    });
  });
});
