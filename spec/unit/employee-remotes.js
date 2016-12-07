'use strict';

module.exports = {
  one,
  two,
};

function one() {
  return {
    accepts: [
      {arg: 'msg', type: 'string'},
      {
        arg: 'accessToken',
        type: 'object',
        description: 'This argument is automatically extracted from request headers.',
        http: extractAccessTokenFromHeaders,
      },
    ],
    returns: {arg: 'greeting', type: 'string'},
  };
}

function two() {
  return {
    accepts: [
      {arg: 'msg', type: 'string'},
      {
        arg: 'accessToken',
        type: 'object',
        description: 'This argument is automatically extracted from request headers.',
        http: extractAccessTokenFromHeaders,
      },
    ],
    returns: {arg: 'farewell', type: 'string'},
  };
}

function extractAccessTokenFromHeaders(context) {
  var req = context && context.req;
  var accessToken = req && req.accessToken;
  return accessToken !== null && accessToken !== undefined ? accessToken : undefined;
}
