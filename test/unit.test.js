const assert = require('chai').assert;
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
        return new Promise( (resolve, reject) => {
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
    let endpoint = null;

    beforeEach(() => {
        endpoint = Mock('./test/endpointEventHandler.js');
    });

    it('creates endpoint event handler of type Function', (done) => {
        assert.isFunction(endpoint, 'was successfully created');
        done();
    });

    it('returns "Hello World!"', (done) => {
        
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

    it('returns GET using "xhr"', (done) => {
        
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

    it('tests "codec/base64"', (done) => {
        
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

    it('returns a kvstore "get" value that has been mocked', (done) => {
        
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

    it('sets a kvstore value', (done) => {
        
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

    it('returns a kvstore "getItem" value that has been mocked', (done) => {
        
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

    it('sets a kvstore value with "setItem"', (done) => {
        
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

    it('returns a kvstore "getCounter" value that has been mocked', (done) => {
        
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

    it('increments a kvstore value', (done) => {
        
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

    it('overrides pubnub mock for this 1 test', (done) => {
        
        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);

        request.testOverride = true;

        let overrides = {
            "pubnub": () => {
                return new Promise((resolve) => {
                    resolve(true);
                });
            }
        };

        endpoint.overrideDefaultModules(overrides);

        let correctResult = {
            "status": 200 
        };

        endpoint(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');

            done();
        });
    });

    it('"require()" pubnub module, should be an instance of the default mock', (done) => {
        
        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);

        request.defaultMock = true;

        let correctResult = {
            "status": 200 
        };

        endpoint(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');
            assert.equal(testResult.body, true, 'body');

            done();
        });
    });

});