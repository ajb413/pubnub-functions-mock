const fs = require('fs');
const path = require('path');
const babel = require('babel-core');
const proxyquire = require('proxyquire').noCallThru();
const tmp = require('tmp');
const qs = require('qs');
const nodeFetch = require('node-fetch');

let keyValueStorage = {};

let kvInterface = {
  set: (key, value) => {
    return new Promise((resolve, reject) => {
      if (typeof(key) !== "string") {
        reject("not a valid key string. kvstore.set expects a string.");
      }
      keyValueStorage[key] = value;
      resolve();
    });
  },
  get: (key) => {
    return new Promise((resolve, reject) => {
      if (typeof(key) !== "string") {
        reject("not a valid key string. kvstore.get expects a string.");
      }
      resolve(keyValueStorage[key]);
    });
  },
  getCounter: this.get,
  incrCounter:  (key, value) => {
    return new Promise((resolve, reject) => {
      if (typeof(key) !== "string") {
        reject("not a valid key string. kvstore.incrCounter expects a string.");
      }

      if (value && typeof(value) !== "number") {
        reject("not a valid number value. kvstore.incrCounter expects a number.");
      }

      keyValueStorage[key] = value || 1;
      resolve();
    });
  },
  removeItem: (key) => {
    return new Promise((resolve, reject) => {
      if (typeof(key) !== "string") {
        reject("not a valid key string. kvstore.removeItem expects a string.");
      }
      delete keyValueStorage[key];
      resolve();
    });
  },
  getItem: this.get,
  setItem: this.set
};

let pubnubInterface = {
  time: () => {
    return new Promise((resolve, reject) => {
      resolve(Date.now() * 10000);
    });
  },
  publish: (obj) => {
    return new Promise((resolve, reject) => {
      if (!obj) {
        reject("[publish] Object is required");
      }

      let ts = String(Date.now() * 10000);

      if (typeof(obj) !== "object" || !obj.message) {
        reject([0,"Invalid JSON", ts]);
      }

      resolve([1,"Sent", ts]);
    });
  },
  fire: this.publish,
  history: (obj) => {
    return new Promise((resolve, reject) => { 
      if ( !obj || typeof(obj) !== "object" ) {
        reject("Cannot read property 'extraOptions'");
      }

      resolve({
        "messages": [{}],
        "startTimeToken": Date.now() * 10000,
        "endTimeToken": Date.now() * 10000
      });
    });
  },
  whereNow: (obj) => {
    return new Promise((resolve, reject) => {
      if ( typeof(obj) !== "object" || !obj.uuid ) {
        reject("[whereNow] 'uuid' is required");
      }

      if ( typeof(obj.uuid) !== "string" ) {
        reject("uuid must be a String");
      }

      resolve({
        "status": 200,
        "message": "OK",
        "payload": {
          "channels": []
        },
        "service": "Presence"
      });
    });
  },
  hereNow: () => {
    return Promise.resolve({
      "status": 200,
      "message": "OK",
      "payload": {
        "channels": {},
        "total_channels": 0,
        "total_occupancy": 0
      },
      "service": "Presence"
    });
  },
  setState: (obj) => {
    return new Promise((resolve, reject) => {
      if ( typeof(obj) !== "object" ) {
        reject("[setState] Object is required");
      }

      resolve({
        "status": 200,
        "message": "OK",
        "payload": {},
        "uuid": obj.uuid || "",
        "channel": obj.channels || [],
        "service": "Presence"
      });
    });
  },
  getState: (obj) => {
    return new Promise((resolve, reject) => {
      if ( typeof(obj) !== "object" || !obj.uuid ) {
        reject("[getState] 'uuid' is required");
      }

      if ( typeof(obj.uuid) !== "string" ) {
        reject("uuid must be a String");
      }

      resolve({
        "status": 200,
        "message": "OK",
        "payload": {},
        "uuid": obj.uuid,
        "channel": obj.channels || [],
        "service": "Presence"
      });
    });
  },
  grant: (obj) => {
    return new Promise((resolve, reject) => {
      if (typeof(obj) !== "object" || (!obj.channels && !obj.channelGroups)) {
        reject("[grant] Object with property 'channels' or 'channelGroups' is required");
      }

      resolve({
        "message": "Success",
        "payload": {
          "level": "",
          "subscribe_key": "",
          "ttl": 1,
          "channel": "",
          "auths": {},
          "channel-groups": ""
        },
        "service": "Access Manager",
        "status": 200
      });
    });
  }
};

let queryInterface = {
  "stringify": qs.stringify
};

let base64Interface = {
  btoa: (unencoded) => {
    return new Buffer(unencoded || '').toString('base64');
  },
  atob: (encoded) => {
    return new Buffer(encoded || '', 'base64').toString('utf8');
  },
  encodeString: (unencoded) => {
    return base64Interface.btoa(unencoded)
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  },
  decodeString: this.atob
};

const defaultModules = {
  "xhr": { "fetch": nodeFetch },
  "pubnub": pubnubInterface,
  "kvstore": kvInterface,
  "codec/query_string": queryInterface,
  "codec/base64": base64Interface
}

let importEventHandler = (ehFilePath) => {
  const ehContents = fs.readFileSync(ehFilePath, 'UTF-8');
  const transformedCode = babel.transform(ehContents, { presets: ['es2015'], plugins: 'babel-plugin-add-module-exports' });
  const tmpobj = tmp.fileSync();

  // Write the transpiled event handler to a temporary file
  fs.writeFileSync(tmpobj.name, transformedCode.code);

  // Reset the keyValueStorage before each test
  keyValueStorage = {};

  // Reset the mock modules to use before each test
  let modules = Object.assign({}, defaultModules);

  // Define an event handler function with mocked modules referenced within
  let ehDefinition = proxyquire(tmpobj.name, modules);

  // Method to set the KVStore to a JS object for a test
  ehDefinition.mockKVStoreData = (kvObject) => {
    if (!kvObject || typeof(kvObject) !== 'object') {
      throw Error('KVStore can only be mocked using a JavaScript Object');
    }

    keyValueStorage = kvObject;
  };

  // Method to override any default modules for a test
  ehDefinition.overrideDefaultModules = (overrideModules) => {
    if (!overrideModules || typeof(overrideModules) !== 'object') {
      throw Error('Modules can only be mocked using a JavaScript Object');
    }

    // Override any default mock specified in overrideModules
    Object.keys(overrideModules).forEach((moduleKey) => {
      modules[moduleKey] = overrideModules[moduleKey];
    });
  };

  return ehDefinition;
};

module.exports = importEventHandler;
