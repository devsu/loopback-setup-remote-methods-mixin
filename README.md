# loopback-setup-remote-methods-mixin

Mixins for Loopback, to easily:

- disable remote methods (disable, disableAll)
- setup new ones from the model configuration file. (not implemented yet)
 
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

```
  "mixins": {
    "SetupRemoteMethods": {
      "disable": ["create"]
    }
  }
```

### disableAllExcept

Disable all the remote methods, except the defined on the options. For example, to disable all except the create method: 

```
  "mixins": {
    "SetupRemoteMethods": {
      "disableAllExcept": ["create"]
    }
  }
```

### ignoreACL

**Default value:** false

This method works together with `disable` and `disableAllExcept`. If **true**, it forces to disable the methods, even if they are configured in the ACL to be allowed. 

```
  "mixins": {
    "SetupRemoteMethods": {
      "ignoreACL": true,
      "disableAllExcept": ["create"]
    }
  }
```
