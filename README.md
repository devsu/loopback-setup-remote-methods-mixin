# loopback-setup-remote-methods-mixin

Mixins for Loopback, to easily:

- disable remote methods (disable, disableAll)
- setup new ones from the model configuration file.
 
It works with both Loopback 2 and 3.

Disabling remote methods feature is based on the discussion at [https://github.com/strongloop/loopback/issues/651](https://github.com/strongloop/loopback/issues/651)

## Installation

```bash
npm install --save loopback-setup-remote-methods-mixin
```

## Usage

### As a mixin (recommended)

First, modify your server/model-config.json to include the path to this module:

```json
{
  "mixins": [
    "loopback/common/mixins",
    "loopback/server/mixins",
    "../common/mixins",
    "./mixins",
    "../node_modules/loopback-setup-remote-methods-mixin"
  ]
}
```

Then you can [use the mixin](https://loopback.io/doc/en/lb2/Defining-mixins.html#enable-a-model-with-mixins) from your models:

```json
{
  "name": "Employee",
  "plural": "Employees",
  "base": "PersistedModel",
  "idInjection": true,
  "options": {
    "validateUpsert": true
  },
  "properties": {
    "name": {
      "type": "string",
      "required": true
    }
  },
  "validations": [],
  "relations": {},
  "acls": [],
  "methods": {},
  "mixins": {
    "SetupRemoteMethods": {
      "disableAllExcept": ["create"]
    }
  }
}
```

## Options

### disable

Disable the defined remote methods. For example, to disable the create remote method:

```json
  "mixins": {
    "SetupRemoteMethods": {
      "disable": ["create"]
    }
  }
```

### disableAllExcept

Disable all the remote methods, except the defined on the options. For example, to disable all except the create method: 

```json
  "mixins": {
    "SetupRemoteMethods": {
      "disableAllExcept": ["create"]
    }
  }
```

### ignoreACL

**Default value:** false

This option works together with `disable` and `disableAllExcept`. If **true**, it forces to disable the methods, even if they are configured in the ACL to be allowed. 

```json
  "mixins": {
    "SetupRemoteMethods": {
      "ignoreACL": true,
      "disableAllExcept": ["create"]
    }
  }
```

### add

It adds new remote methods to the model. This is similar to what's planned for the [Methods](https://loopback.io/doc/en/lb2/Model-definition-JSON-file.html#methods) section. (Which is not yet implemented. This option will be deprecated when that happens.)
 
There are two ways to define the new remote method.
 
#### Add using JSON definition

```json
  "mixins": {
    "SetupRemoteMethods": {
      "add": {
        "sayHello": {
          "accepts": {"arg": "msg", "type": "string"},
          "returns": {"arg": "greeting", "type": "string"}
        },
        "sayBye": {
          "accepts": {"arg": "msg", "type": "string"},
          "returns": {"arg": "farewell", "type": "string"}
        }
      }
    }
  }
```

Then you can have the method in your model as usual:

```javascript
const Promise = require('bluebird');

module.exports = function(Employee) {

  Employee.sayHello = msg => {
    return new Promise((resolve) => {
      resolve('Hello ' + msg);
    });
  };
  
  Employee.sayBye = msg => {
    return new Promise((resolve) => {
      resolve('Goodbye ' + msg);
    });
  };

};
```

#### Add using a method that provides the definition

There are some cases that you might want to call a method to return the definition. This happens for example if one of the properties is calculated. In this case, you might want to just add the method name.

```json
  "mixins": {
    "SetupRemoteMethods": {
      "add": {
        "greet": "remotesDefinitions.greet"
      }
    }
  }
```

In order to avoid having this definition in the model definition file (which is one of the motivations of this functionality), we can have the definition on a different file, let's say we name it **remoteMethods.js**

```javascript
module.exports = {
  greet
};

function greet() {
  return {
    accepts: [
      { arg: 'msg', type: 'string' },
      {
        arg: 'accessToken',
        type: 'object',
        description: 'Do not supply this argument, it is automatically extracted from request headers.',
        http: extractAccessTokenFromHeaders
      }
    ],
    returns: {arg: 'greeting', type: 'string'}
  };
}

function extractAccessTokenFromHeaders(context) {
  var req = context && context.req;
  var accessToken = req && req.accessToken;
  return accessToken !== null && accessToken !== undefined ? accessToken : undefined;
}

```

Then, on your model definition JSON file, you would need to have something like:

```javascript
module.exports = function(Employee) {

  // Include the definitions in the model for the mixin to be able to get them
  Employee.remotesDefinitions = require('./remote-methods');

  // The implementation of your remote method  
  Employee.greet = msg => {
    return new Promise((resolve) => {
      resolve('Hello ' + msg);
    });
  };
  
};
```
