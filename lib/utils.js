'use strict';

module.exports = {
  getAuthorizedAclMethods,
};

function getAuthorizedAclMethods(Model) {
  let authorizedMethods = [];
  let acls = Model.settings.acls || [];

  acls.forEach((acl) => {
    if (acl.permission === 'ALLOW' && acl.property) {
      if (!Array.isArray(acl.property)) {
        acl.property = [acl.property];
      }
      authorizedMethods = authorizedMethods.concat(acl.property);
    }
  });

  return authorizedMethods;
}
