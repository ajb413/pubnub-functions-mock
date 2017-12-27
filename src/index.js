const fs = require('fs');
const babel = require('babel-core');
const proxyquire = require('proxyquire').noCallThru();
const tmp = require('tmp');
const nodeFetch = require('node-fetch');

// Default PubNub Functions modules that have been converted to mocks
const pubnubInterface = require('./modules/pubnub.js');
const kvInterface = require('./modules/kvstore.js');
const codec = require('./modules/codec.js');

const defaultModules = {
  'xhr': {'fetch': nodeFetch},
  'pubnub': pubnubInterface,
  'kvstore': kvInterface,
  'codec/query_string': codec.queryInterface,
  'codec/base64': codec.base64Interface,
};

let importEventHandler = (ehFilePath, moduleMocks) => {
  const ehContents = fs.readFileSync(ehFilePath, 'UTF-8');
  const transformedCode = babel.transform(ehContents, {
    'presets': ['es2015'],
    'plugins': 'babel-plugin-add-module-exports',
  });
  const tmpobj = tmp.fileSync();

  // Write the transpiled event handler to a temporary file
  fs.writeFileSync(tmpobj.name, transformedCode.code);

  // Reset the keyValueStorage before each test
  kvInterface.keyValueStorage = {};
  kvInterface.keyValueCounters = {};

  // Reset the mock modules to use before each test
  let modules = Object.assign({}, defaultModules);

  // Define an event handler function with mocked modules referenced within
  let ehDefinition = proxyquire(tmpobj.name, modules);

  // Method to set the KVStore to a JS object for a test
  ehDefinition.mockKVStoreData = (kvObject) => {
    if (!kvObject || typeof(kvObject) !== 'object') {
      throw Error('[mockKVStoreData] expects Object');
    }

    kvInterface.keyValueStorage = kvObject;
  };

  // Method to set the KVStore counters to a JS object for a test
  ehDefinition.mockKVStoreCounters = (kvObject) => {
    if (!kvObject || typeof(kvObject) !== 'object') {
      throw Error('[mockKVStoreCounters] expects Object');
    }

    kvInterface.keyValueCounters = kvObject;
  };

  ehDefinition.getKVStoreData = () => {
    return kvInterface.keyValueStorage;
  };

  ehDefinition.getKVStoreCounters = () => {
    return kvInterface.keyValueCounters;
  };

  // Method to override any default module mocks
  ehDefinition.overrideDefaultModules = (overrideModules) => {
    if (!overrideModules || typeof(overrideModules) !== 'object') {
      throw Error('[overrideDefaultModules] expects Object');
    }

    Object.keys(overrideModules).forEach((moduleKey) => {
      modules[moduleKey] = overrideModules[moduleKey];
    });
  };

  // Override default mocks for every single test in a file
  if (moduleMocks !== undefined) {
    ehDefinition.overrideDefaultModules(moduleMocks);
  }

  return ehDefinition;
};

module.exports = importEventHandler;
