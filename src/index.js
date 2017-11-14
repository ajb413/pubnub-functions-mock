const fs = require('fs');
const path = require('path');
const babel = require('babel-core');
const proxyquire = require('proxyquire').noCallThru();
const tmp = require('tmp');
const nodeFetch = require('node-fetch');

const pubnubInterface = require('./modules/pubnub.js');
const kvInterface = require('./modules/kvstore.js');
const codec = require('./modules/codec.js');

const defaultModules = {
    "xhr": { "fetch": nodeFetch },
    "pubnub": pubnubInterface,
    "kvstore": kvInterface,
    "codec/query_string": codec.queryInterface,
    "codec/base64": codec.base64Interface
}

let importEventHandler = (ehFilePath, moduleMocks) => {
    const ehContents = fs.readFileSync(ehFilePath, 'UTF-8');
    const transformedCode = babel.transform(ehContents, { presets: ['es2015'], plugins: 'babel-plugin-add-module-exports' });
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
            throw Error('KVStore can only be mocked using a JavaScript Object');
        }

        kvInterface.keyValueStorage = kvObject;
    };

    // Method to set the KVStore counters to a JS object for a test
    ehDefinition.mockKVStoreCounters = (kvObject) => {
        if (!kvObject || typeof(kvObject) !== 'object') {
            throw Error('KVStore counters can only be mocked using a JavaScript Object');
        }

        kvInterface.keyValueCounters = kvObject;
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