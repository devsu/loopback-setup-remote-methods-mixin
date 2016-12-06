'use strict';

module.exports = {
  getModelMock,
  getServerMock,
};

function getModelMock() {
  let theModel = {
    sharedClass: {},
  };
  theModel.on = function(event, cb) {
    if (event === 'attached') {
      theModel.sharedClass.methods = function() {
        return [
          {'name': 'create', 'isStatic': true},
          {'name': 'findById', 'isStatic': true},
          {'name': 'one', 'isStatic': true},
          {'name': 'two', 'isStatic': true},
          {'name': 'three', 'isStatic': false},
          {'name': 'four', 'isStatic': true},
          {'name': 'five', 'isStatic': false},
          {'name': 'six', 'isStatic': false},
        ];
      };
      theModel.definition = {
        settings: {
          acls: [
            {
              permission: 'ALLOW',
              property: ['one', 'two'],
            },
            {
              permission: 'ALLOW',
              property: 'three',
            },
            {
              permission: 'DENY',
              property: ['four', 'five'],
            },
            {
              permission: 'DENY',
              property: 'six',
            },
          ],
        },
      };
      cb(getServerMock());
    }
  };
  theModel.disableRemoteMethodByName = jasmine.createSpy('disableRemoteMethodByName');
  theModel.remoteMethod = jasmine.createSpy('remoteMethod');
  return theModel;
}

function getServerMock() {
  return {
    on(event, cb) {
      if (event === 'started') {
        cb();
      }
    },
  };
}
