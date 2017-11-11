const assert = require('chai').assert;
const expect = require('chai').expect;
const Mock = require('../src/index.js');

const endpointRequestObject = {
    "body": "{}",
    "message": {},
    "method": null,
    "params": {}
};

const endpointResponseObject = {
    "headers": {},
    "status": 200,
    "send": function ( body ) {
        return new Promise( (resolve) => {
            if (body === undefined) {
                body = "";
            }
            resolve({
                "body": body,
                "status": this.status
            });
        });
    }
};

describe('#endpoint', () => {
    let endpoint;

    beforeEach(() => {
        endpoint = Mock('./test/endpointEventHandler.js');
    });

    it('creates endpoint event handler of type Function', function (done) {
        assert.isFunction(endpoint, 'was successfully created');
        done();
    });

    it('returns "Hello World!"', function (done) {
        
        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);

        let correctResult = {
            "body": "Hello World!",
            "status": 200 
        };

        endpoint(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');
            assert.equal(testResult.body, correctResult.body, 'response body');

            done();
        });
    });

    it('returns GET using "xhr"', function (done) {
        
        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);

        request.xhr = true;

        let correctResult = {
            "body": true,
            "status": 200 
        };

        endpoint(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');
            assert.equal(testResult.body, correctResult.body, 'response body');

            done();
        });
    });

    it('tests "codec/base64"', function (done) {
        
        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);

        request.b64 = true;

        let btoa = 'aGVsbG8=';
        let atob = 'hello';
        let encodeString = 'Kw==';
        let decodeString = '+';

        let correctResult = {
            "body": {
                btoa,
                atob,
                encodeString,
                decodeString
            },
            "status": 200 
        };

        endpoint(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');
            assert.equal(testResult.body.btoa, correctResult.body.btoa, 'btoa');
            assert.equal(testResult.body.atob, correctResult.body.atob, 'atob');
            assert.equal(testResult.body.encodeString, correctResult.body.encodeString, 'encodeString');
            assert.equal(testResult.body.decodeString, correctResult.body.decodeString, 'decodeString');

            done();
        });
    });

    it('returns a kvstore "get" value that has been mocked', function (done) {
        
        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);

        request.getKvValue = true;
        request.key = "key";

        let preExistingValue = { "key" : "value" };

        let correctResult = {
            "body": preExistingValue.key,
            "status": 200 
        };

        // Mock a pre-existing KVStore value for this test only
        endpoint.mockKVStoreData(preExistingValue);

        endpoint(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');
            assert.equal(testResult.body, correctResult.body, 'response body');

            done();
        });
    });

    it('fails to mock the KVStore', function (done) {
        
        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);

        let preExistingValue = null;

        expect(function () {
            // Mock a pre-existing KVStore value for this test only
            endpoint.mockKVStoreData(preExistingValue);
        }).to.throw(Error);

        done();
    });

    it('fails to mock the KVStore counters', function (done) {
        
        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);

        let preExistingValue = null;

        expect(function () {
            // Mock a pre-existing KVStore counter for this test only
            endpoint.mockKVStoreCounters(preExistingValue);
        }).to.throw(Error);

        done();
    });

    it('sets a kvstore value', function (done) {
        
        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);

        request.setKvValue = true;
        request.key = 'key';
        request.value = 'value';

        let correctResult = {
            "body": null,
            "status": 200 
        };

        endpoint(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');
            assert.equal(testResult.body, correctResult.body, 'response body');

            done();
        });
    });

    it('returns a kvstore "getItem" value that has been mocked', function (done) {
        
        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);

        request.getItem = true;
        request.key = "key";

        let preExistingValue = { "key" : "value" };

        let correctResult = {
            "body": preExistingValue.key,
            "status": 200 
        };

        // Mock a pre-existing KVStore value for this test only
        endpoint.mockKVStoreData(preExistingValue);

        endpoint(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');
            assert.equal(testResult.body, correctResult.body, 'response body');

            done();
        });
    });

    it('sets a kvstore value with "setItem"', function (done) {
        
        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);

        request.setItem = true;
        request.key = 'key';
        request.value = 'value';

        let correctResult = {
            "body": null,
            "status": 200 
        };

        endpoint(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');
            assert.equal(testResult.body, correctResult.body, 'response body');

            done();
        });
    });

    it('returns a kvstore "getCounter" value that has been mocked', function (done) {
        
        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);

        request.getKvCounter = true;
        request.key = "key";

        let preExistingValue = { "key" : 456 };

        let correctResult = {
            "body": preExistingValue.key,
            "status": 200 
        };

        // Mock a pre-existing KVStore value for this test only
        endpoint.mockKVStoreCounters(preExistingValue);

        endpoint(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');
            assert.equal(testResult.body, correctResult.body, 'response body');

            done();
        });
    });

    it('increments a kvstore value', function (done) {
        
        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);

        request.incKvValue = true;
        request.key = 'key';
        request.value = 123;

        let correctResult = {
            "body": null,
            "status": 200 
        };

        endpoint(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');
            assert.equal(testResult.body, correctResult.body, 'response body');

            done();
        });
    });

    it('overrides default modules', function (done) {
        
        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);

        request.testOverride = true;

        let overrides = {
            "pubnub": function () {
                return new Promise.resolve(true);
            }
        };

        let correctResult = {
            "body": overrides.pubnub,
            "status": 200 
        };

        let ep = Mock('./test/endpointEventHandler.js', overrides);

        ep(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');
            assert.equal(testResult.body, correctResult.body, 'response body');

            done();
        });
    });

    it('fails to override default modules', function (done) {
        
        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);

        let overrides = null;

        expect(() => {
            endpoint = Mock('./test/endpointEventHandler.js', overrides);
        }).to.throw(Error);

        done();
    });

    it('overrides pubnub mock for this 1 test', function (done) {
        
        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);

        request.testOverride = true;

        let overrides = {
            "pubnub": function () {
                return new Promise.resolve(true);
            }
        };

        endpoint.overrideDefaultModules(overrides);

        let correctResult = {
            "body": overrides.pubnub,
            "status": 200 
        };

        endpoint(request, response).then((testResult) => {
            
            assert.equal(testResult.status, correctResult.status, 'status');
            assert.equal(testResult.body, correctResult.body, 'response body');

            done();
        });
    });

    it('fails to override pubnub mock for this 1 test', function (done) {
        
        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);

        let overrides = null;

        expect(() => {
            endpoint.overrideDefaultModules(overrides);
        }).to.throw(Error);

        done();
    });

    it('"require()" pubnub module, should be an instance of the default mock', function (done) {
        
        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);

        request.defaultMock = true;

        let correctResult = {
            "body": true,
            "status": 200
        };

        endpoint(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');
            assert.equal(testResult.body, correctResult.body, 'body');

            done();
        });
    });

    it('pubnub grant', function (done) {
        
        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);

        request.grant = true;

        request.toGrant = {
            "channels": ["test"]
        };

        let correctResult = {
            "body": "Success",
            "status": 200
        };

        endpoint(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');
            assert.equal(testResult.body, correctResult.body, 'body');

            done();
        });
    });

    it('fails to complete pubnub grant', function (done) {
        
        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);

        request.grant = true;
        request.toGrant = {};

        let correctResult = {
            "status": 500
        };

        endpoint(request, response).then((testResult) => {
            assert.equal(testResult.status, correctResult.status, 'status');
            done();
        });

    });

});