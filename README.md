# PubNub Functions Mock

Unit test PubNub Functions event handlers on your local machine

Currently supported modules for mock ([docs here](https://www.pubnub.com/docs/blocks/xhr-module)):
- XHR
- KV Store
- codec/query_string
- PubNub

## Example PubNub Function Endpoint unit test with Mocha and Chai
```javascript
// myTest.js
const assert = require('chai').assert;
const Mock = require('pubnub-functions-mock');

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
            resolve({
                "body": body || "",
                "status": this.status
            });
        });
    }
};

describe('#endpoint', () => {
    let endpoint = null;

    beforeEach(() => {
        endpoint = Mock('./myEndpointEventHandler.js');
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

    it('returns a kvstore value', (done) => {
        
        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);

        request.getKvValue = true;

        let preExistingValue = { "key" : "value" };

        let correctResult = {
            "body": preExistingValue.key,
            "status": 200 
        };

        // Mock the pre-existing KVStore value for this test only
        endpoint.mockKVStoreData(preExistingValue);

        endpoint(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');
            assert.equal(testResult.body, correctResult.body, 'response body');

            done();
        });
    });
});
```

The above test would be run on `myEndpointEventHandler.js` using
`mocha myTest`

```javascript
// myEndpointEventHandler.js
export default (request, response) => {
    const pubnub = require('pubnub');
    const kvstore = require('kvstore');

    if (request.getKvValue) {
        return kvstore.get('key').then((value) => {
            response.status = 200;
            return response.send(value);
        });
    }

    response.status = 200;
    return response.send("Hello World!");
};
```