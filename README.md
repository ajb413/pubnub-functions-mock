# PubNub Functions Mock

Unit test PubNub Functions event handlers.

## Example with Chai testing
```javascript
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
      return {
        "body": body || "",
        "status": this.status
      }
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

        let testResult = endpoint(request, response);

        assert.equal(testResult.status, correctResult.status, 'status');
        assert.equal(testResult.body, correctResult.body, 'response body');

        done();
    });
});
```