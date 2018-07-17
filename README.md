# loopback-setup-remote-methods-mixin

Mixins for Loopback, to easily disable or setup new remote methods from the model definition file. It works with both Loopback 2 and 3.

## Installation

```bash
npm install --save loopback-setup-remote-methods-mixin
```

## Usage

### As a mixin (recommended)

First, modify your server/model-config.json to include the path to this module:

For LB3, mixins should be declared in the `_meta.mixins` property. For LB2, mixins should be declared in the `mixins` property.

```json
{
 "_meta": {
   "mixins": [
      "loopback/common/mixins",
      "loopback/server/mixins",
      "../common/mixins",
      "./mixins",
      "../node_modules/loopback-setup-remote-methods-mixin"
    ]
  }
}
```

Then you can [use the mixin](https://loopback.io/doc/en/lb3/Defining-mixins.html#enable-a-model-with-mixins) from your model definition files:

```json
...
  "mixins": {
    "SetupRemoteMethods": {
      "disableAllExcept": ["create", "prototype.updateAttributes"],
      "addFromFile": "./common/models/mymodel-remotes.js"
    }
  }
...
```
List of default remote methods

http://loopback.io/doc/en/lb3/Exposing-models-over-REST.html#predefined-remote-methods

## Options

- [disable](#disable)
- [disableAllExcept](#disableallexcept)
- [relations](#relations)
  - disableAllExcept
- [ignoreACL](#ignoreacl)
- [add](#add)
  - [add using JSON](#add-using-json)
  - [add using a JS file](#add-using-js-in-the-model) (Deprecated, use **addFromFile** instead)
- [addFromFile](#addfromfile)

### disable

Disable the defined remote methods. For example, to disable the `create` and the `updateAttributes` remote methods:

```json
  "mixins": {
    "SetupRemoteMethods": {
      "disable": ["create", "prototype.updateAttributes"]
    }
  }
```

Allows wildcards with `*` (not fully tested though)

### disableAllExcept

Disable all the remote methods, except the defined on the options. For example, to disable all except `create` and `updateAttributes` remote methods: 

```json
  "mixins": {
    "SetupRemoteMethods": {
      "disableAllExcept": ["create", "prototype.updateAttributes"]
    }
  }
```

Allows wildcards with `*` (not fully tested though)

### relations

Allows to setup some options per relation. Currently only `disableAllExcept` is supported.

```json
  "mixins": {
    "SetupRemoteMethods": {
      "relations": {
        "customer": {
          "disableAllExcept": ["create", "get"]          
        }
      }
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
      "disableAllExcept": ["create", "prototype.updateAttributes"]
    }
  }
```

### add

It adds new remote methods to the model. This is similar to what's planned for the [Methods](https://loopback.io/doc/en/lb3/Model-definition-JSON-file.html#methods) section. (Which is not yet implemented. This option will be deprecated when that happens.)
 
#### Add using JSON

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

Then you can have the methods implemented in your model as usual:

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

#### Add using JS in the model

**Deprecated**, use [addFromFile](#addfromfile) instead.

You can define the name of the methods in the model that will provide the remote method definition.

```json
  "mixins": {
    "SetupRemoteMethods": {
      "add": {
        "greet": "remotesDefinitions.greet"
      }
    }
  }
```

In order to avoid having this definition in the model file, we can have the definition on a different file, let's say we name it **remote-methods.js**

```javascript
module.exports = {
  greet
};

function greet() {
  return {
    accepts: {arg: 'msg', type: 'string'},
    returns: {arg: 'greeting', type: 'string'},
  };
}

```

Then, on your model, you would need to have something like:

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

### addFromFile

There are some cases that you might want to call a method to return the definition. This happens for example if one of the properties should be calculated.

You can add **all** the methods from the file:

```json
  "mixins": {
    "SetupRemoteMethods": {
      "addFromFile": "./common/models/employee-remotes.js"
    }
  }
```

Or just some of them:

```json
  "mixins": {
    "SetupRemoteMethods": {
      "addFromFile": {
        "filename": "./common/models/employee-remotes.js",
        "methods": [ "sayHello" ]
      }
    }
  }
```

The path of the file should be relative to `process.cwd()`.

The file (`employee-remotes.js` in our example) would contain the remotes definitions:

```javascript
module.exports = {
  sayHello,
  sayBye
};

function sayHello() {
  return {
    accepts: {arg: 'msg', type: 'string'},
    returns: {arg: 'greeting', type: 'string'},
  };
}

function sayBye() {
  return {
    accepts: {arg: 'msg', type: 'string'},
    returns: {arg: 'farewell', type: 'string'},
  };
}
```

Then, in the model, you will only need the implementation:

```javascript
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

## Credits

Disabling remote methods feature is based on the discussion at [https://github.com/strongloop/loopback/issues/651](https://github.com/strongloop/loopback/issues/651).

The code for `disable`, `disableAllExcept` and `ignoreACL` options is based on this [gist](https://gist.github.com/ebarault/1c3e43e19735f03dee8260471f8d3545) from [ebarault](https://github.com/ebarault), which was based on another [gist](https://gist.github.com/drmikecrowe/7ec75265fda2788e1c08249ece505a44) from [drmikecrowe](https://github.com/drmikecrowe).

Module created by [c3s4r](https://github.com/c3s4r) for [Devsu](http://devsu.com/).
