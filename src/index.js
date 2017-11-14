const fs = require('fs');
const path = require('path');
const babel = require('babel-core');
const proxyquire = require('proxyquire').noCallThru();
const tmp = require('tmp');
const qs = require('qs');
const nodeFetch = require('node-fetch');

let keyValueStorage = {};
let keyValueCounters = {};

let kvInterface = {
  set: (key, value, ttl) => {
    return new Promise((resolve, reject) => {
      if (typeof(key) !== "string") {
        reject("not a valid key string. kvstore.set expects a string.");
      }

      if (ttl && typeof(ttl) !== "number") {
        reject("ttl must be a number.");
      }

      keyValueStorage[key] = value;
      resolve(null);
    });
  },
  get: (key) => {
    return new Promise((resolve, reject) => {
      if (typeof(key) !== "string") {
        reject("not a valid key. kvstore.get expects a string.");
      }
      resolve(keyValueStorage[key]);
    });
  },
  incrCounter:  (key, value) => {
    return new Promise((resolve, reject) => {
      if (typeof(key) !== "string") {
        reject("not a valid key. kvstore.incrCounter expects a string.");
      }

      if (value && typeof(value) !== "number") {
        reject("not a valid value. kvstore.incrCounter expects a number.");
      }

      if (!keyValueCounters[key]) {
        keyValueCounters[key] = value || 1;
      } else {
        keyValueCounters[key] += value || 1;
      }

      resolve(null);
    });
  },
  getCounter: (key) => {
    return new Promise((resolve, reject) => {
      if (typeof(key) !== "string") {
        reject("not a valid key. kvstore.get expects a string.");
      }
      resolve(keyValueCounters[key]);
    });
  },
  removeItem: (key) => {
    return new Promise((resolve, reject) => {
      if (typeof(key) !== "string") {
        reject("not a valid key. kvstore.removeItem expects a string.");
      }
      delete keyValueStorage[key];
      resolve();
    });
  }
};
kvInterface.getItem = kvInterface.get;
kvInterface.setItem = kvInterface.set;

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
  history: (obj) => {
    return new Promise((resolve, reject) => { 
      if (!obj || typeof(obj) !== "object") {
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
    return new Promise((resolve) => {
      if (typeof(obj) !== "object" || obj.uuid === undefined) {
        throw Error("[whereNow] 'uuid' is required");
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
    return new Promise((resolve) => {
      if (typeof(obj) !== "object" || obj.uuid === undefined) {
        throw Error("[setState] 'uuid' is required");
      }

      resolve({
        "status": 200,
        "message": "OK",
        "payload": {},
        "uuid": String(obj.uuid),
        "channel": obj.channels || [],
        "service": "Presence"
      });

    });
  },
  getState: (obj) => {
    return new Promise((resolve) => {
      if (typeof(obj) !== "object" || obj.uuid === undefined) {
        throw Error("[getState] 'uuid' is required");
      }

      resolve({
        "status": 200,
        "message": "OK",
        "payload": {},
        "uuid": String(obj.uuid),
        "channel": obj.channels || [],
        "service": "Presence"
      });

    });
  },
  grant: (obj) => {
    return new Promise((resolve) => {
      if (typeof(obj) !== "object" || (!obj.channels && !obj.channelGroups)) {
        throw Error("[grant] Object with property 'channels' or 'channelGroups' is required");
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
pubnubInterface.fire = pubnubInterface.publish;

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
  }
};
base64Interface.decodeString = base64Interface.atob;

const defaultModules = {
  "xhr": { "fetch": nodeFetch },
  "pubnub": pubnubInterface,
  "kvstore": kvInterface,
  "codec/query_string": queryInterface,
  "codec/base64": base64Interface
}

let importEventHandler = (ehFilePath, moduleMocks) => {
  const ehContents = fs.readFileSync(ehFilePath, 'UTF-8');
  const transformedCode = babel.transform(ehContents, { presets: ['es2015'], plugins: 'babel-plugin-add-module-exports' });
  const tmpobj = tmp.fileSync();

  // Write the transpiled event handler to a temporary file
  fs.writeFileSync(tmpobj.name, transformedCode.code);

  // Reset the keyValueStorage before each test
  keyValueStorage = {};
  keyValueCounters = {};

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

  // Method to set the KVStore counters to a JS object for a test
  ehDefinition.mockKVStoreCounters = (kvObject) => {
    if (!kvObject || typeof(kvObject) !== 'object') {
      throw Error('KVStore counters can only be mocked using a JavaScript Object');
    }

    keyValueCounters = kvObject;
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

  // Override modules passed when the event handler is first initialized for all tests
  if (moduleMocks !== undefined) {
    ehDefinition.overrideDefaultModules(moduleMocks);
  }

  return ehDefinition;
};

module.exports = importEventHandler;
