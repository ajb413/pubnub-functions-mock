const assert = require('chai').assert;
const expect = require('chai').expect;
const mock = require('../src/index.js');

const endpointRequestObject = {
  'body': '{}',
  'message': {},
  'method': null,
  'params': {},
};

const endpointResponseObject = {
  'headers': {},
  'status': 200,
  'send': function( body ) {
    return new Promise((resolve) => {
      if (body === undefined) {
        body = '';
      }
      resolve({
        'body': body,
        'status': this.status,
      });
    });
  },
};

describe('#endpoint', () => {
  let endpoint;

  beforeEach(() => {
    endpoint = mock('./test/endpointEventHandler.js');
  });

  it('creates endpoint event handler of type Function', function(done) {
    assert.isFunction(endpoint, 'was successfully created');
    done();
  });

  it('returns "Hello World!"', function(done) {
    let request = Object.assign({}, endpointRequestObject);
    let response = Object.assign({}, endpointResponseObject);

    let correctResult = {
      'body': 'Hello World!',
      'status': 200,
    };

    endpoint(request, response).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
      assert.equal(testResult.body, correctResult.body, 'response body');

      done();
    });
  });

  it('returns GET using "xhr"', function(done) {
    let request = Object.assign({}, endpointRequestObject);
    let response = Object.assign({}, endpointResponseObject);

    request.xhr = true;

    let correctResult = {
      'body': true,
      'status': 200,
    };

    endpoint(request, response).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
      assert.equal(testResult.body, correctResult.body, 'response body');

      done();
    });
  });

  it('tests "codec/base64"', function(done) {
    let request = Object.assign({}, endpointRequestObject);
    let response = Object.assign({}, endpointResponseObject);

    request.b64 = true;

    let btoa = 'aGVsbG8=';
    let atob = 'hello';
    let encodeString = 'Kw==';
    let decodeString = '+';

    let correctResult = {
      'body': {
        btoa,
        atob,
        encodeString,
        decodeString,
      },
      'status': 200,
    };

    endpoint(request, response).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
      assert.equal(testResult.body.btoa, correctResult.body.btoa, 'btoa');
      assert.equal(testResult.body.atob, correctResult.body.atob, 'atob');
      assert.equal(testResult.body.encodeString,
        correctResult.body.encodeString, 'encodeString');
      assert.equal(testResult.body.decodeString,
        correctResult.body.decodeString, 'decodeString');

      done();
    });
  });

  it('fails to kvstore.get', function(done) {
    let request = Object.assign({}, endpointRequestObject);
    let response = Object.assign({}, endpointResponseObject);

    request.getKvValue = true;
    request.key = 123;

    let correctResult = {
      'status': 500,
    };

    endpoint(request, response).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
    });

    done();
  });

  it('returns a kvstore.get value that has been mocked', function(done) {
    let request = Object.assign({}, endpointRequestObject);
    let response = Object.assign({}, endpointResponseObject);

    request.getKvValue = true;
    request.key = 'key';

    let preExistingValue = {'key': 'value'};

    let correctResult = {
      'body': preExistingValue.key,
      'status': 200,
    };

    // mock a pre-existing KVStore value for this test only
    endpoint.mockKVStoreData(preExistingValue);

    endpoint(request, response).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
      assert.equal(testResult.body, correctResult.body, 'response body');

      done();
    });
  });

  it('fails to mock the KVStore', function(done) {
    let preExistingValue = null;

    expect(function() {
      // mock a pre-existing KVStore value for this test only
      endpoint.mockKVStoreData(preExistingValue);
    }).to.throw(Error);

    done();
  });

  it('fails to mock the KVStore counters', function(done) {
    let preExistingValue = null;

    expect(function() {
      // mock a pre-existing KVStore counter for this test only
      endpoint.mockKVStoreCounters(preExistingValue);
    }).to.throw(Error);

    done();
  });

  it('fails to kvstore.set', function(done) {
    let request = Object.assign({}, endpointRequestObject);
    let response = Object.assign({}, endpointResponseObject);

    request.setKvValue = true;
    request.key = null;
    request.value = 'value';
    request.ttl = 123;

    let correctResult = {
      'status': 500,
    };

    endpoint(request, response).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
    }).then(() => {
      request.key = 'test';
      request.ttl = '123';
      return endpoint(request, response);
    }).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
      done();
    });
  });

  it('kvstore.set', function(done) {
    let request = Object.assign({}, endpointRequestObject);
    let response = Object.assign({}, endpointResponseObject);

    request.setKvValue = true;
    request.key = 'key';
    request.value = 'value';
    request.ttl = 123;

    let correctResult = {
      'body': null,
      'status': 200,
    };

    endpoint(request, response).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
      assert.equal(testResult.body, correctResult.body, 'response body');

      done();
    });
  });

  it('returns a mocked kvstore "getItem" value', function(done) {
    let request = Object.assign({}, endpointRequestObject);
    let response = Object.assign({}, endpointResponseObject);

    request.getItem = true;
    request.key = 'key';

    let preExistingValue = {'key': 'value'};

    let correctResult = {
      'body': preExistingValue.key,
      'status': 200,
    };

    // mock a pre-existing KVStore value for this test only
    endpoint.mockKVStoreData(preExistingValue);

    endpoint(request, response).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
      assert.equal(testResult.body, correctResult.body, 'response body');

      done();
    });
  });

  it('sets a kvstore value with "setItem"', function(done) {
    let request = Object.assign({}, endpointRequestObject);
    let response = Object.assign({}, endpointResponseObject);

    request.setItem = true;
    request.key = 'key';
    request.value = 'value';
    request.ttl = 123;

    let correctResult = {
      'body': null,
      'status': 200,
    };

    endpoint(request, response).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
      assert.equal(testResult.body, correctResult.body, 'response body');

      done();
    });
  });

  it('returns mocked kvstore "getCounter" value', function(done) {
    let request = Object.assign({}, endpointRequestObject);
    let response = Object.assign({}, endpointResponseObject);

    request.getKvCounter = true;
    request.key = 'key';

    let preExistingValue = {'key': 456};

    let correctResult = {
      'body': preExistingValue.key,
      'status': 200,
    };

    // mock a pre-existing KVStore value for this test only
    endpoint.mockKVStoreCounters(preExistingValue);

    endpoint(request, response).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
      assert.equal(testResult.body, correctResult.body, 'response body');

      done();
    });
  });

  it('fails to kvstore.getCounter', function(done) {
    let request = Object.assign({}, endpointRequestObject);
    let response = Object.assign({}, endpointResponseObject);

    request.getKvCounter = true;
    request.key = 123;

    let correctResult = {
      'status': 500,
    };

    endpoint(request, response).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
      done();
    });
  });

  it('kvstore.getCounter', function(done) {
    let request = Object.assign({}, endpointRequestObject);
    let response = Object.assign({}, endpointResponseObject);

    request.getKvCounter = true;
    request.key = 'key';

    let correctResult = {
      'body': 0,
      'status': 200,
    };

    endpoint(request, response).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
      assert.equal(testResult.body, correctResult.body, 'response body');

      done();
    });
  });

  it('fails to kvstore.incrCounter', function(done) {
    let request = Object.assign({}, endpointRequestObject);
    let response = Object.assign({}, endpointResponseObject);

    request.incKvValue = true;
    request.key = 123;
    request.value = 123;

    let correctResult = {
      'status': 500,
    };

    endpoint(request, response).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
    }).then(() => {
      request.key = 'test';
      request.value = 'test';
      return endpoint(request, response);
    }).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
      done();
    });
  });

  it('kvstore.incrCounter', function(done) {
    let request = Object.assign({}, endpointRequestObject);
    let response = Object.assign({}, endpointResponseObject);

    request.incKvValue = true;
    request.key = 'key';
    request.value = 123;

    let correctResult = {
      'body': 123,
      'status': 200,
    };

    endpoint(request, response).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
      assert.equal(testResult.body, correctResult.body, 'response body');

      done();
    });
  });

  it('increments existing kvstore "incrCounter" value', function(done) {
    let request = Object.assign({}, endpointRequestObject);
    let response = Object.assign({}, endpointResponseObject);

    let preExistingValue = {'key': 10};

    // mock a pre-existing KVStore value for this test only
    endpoint.mockKVStoreCounters(preExistingValue);

    request.incKvValue = true;
    request.key = 'key';
    request.value = 3;

    let correctResult = {
      'body': 13,
      'status': 200,
    };

    endpoint(request, response).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
      assert.equal(testResult.body, correctResult.body, 'response body');

      done();
    });
  });

  it('fails to kvstore.removeItem', function(done) {
    let request = Object.assign({}, endpointRequestObject);
    let response = Object.assign({}, endpointResponseObject);

    request.removeItem = 123;

    let correctResult = {
      'status': 500,
    };

    endpoint(request, response).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
      done();
    });
  });

  it('kvstore.removeItem', function(done) {
    let request = Object.assign({}, endpointRequestObject);
    let response = Object.assign({}, endpointResponseObject);

    request.removeItem = 'test';

    let correctResult = {
      'body': null,
      'status': 200,
    };

    endpoint(request, response).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
      assert.equal(testResult.body, correctResult.body, 'response body');

      done();
    });
  });

  it('overrides default modules', function(done) {
    let request = Object.assign({}, endpointRequestObject);
    let response = Object.assign({}, endpointResponseObject);

    request.testOverride = true;

    let overrides = {
      'pubnub': function() {
        return Promise.resolve(true);
      },
    };

    let correctResult = {
      'body': overrides.pubnub,
      'status': 200,
    };

    let ep = mock('./test/endpointEventHandler.js', overrides);

    ep(request, response).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
      assert.equal(testResult.body, correctResult.body, 'response body');

      done();
    });
  });

  it('fails to override default modules', function(done) {
    let overrides = null;

    expect(() => {
      endpoint = mock('./test/endpointEventHandler.js', overrides);
    }).to.throw(Error);

    done();
  });

  it('overrides pubnub mock for this 1 test', function(done) {
    let request = Object.assign({}, endpointRequestObject);
    let response = Object.assign({}, endpointResponseObject);

    request.testOverride = true;

    let overrides = {
      'pubnub': function() {
        return Promise.resolve(true);
      },
    };

    endpoint.overrideDefaultModules(overrides);

    let correctResult = {
      'body': overrides.pubnub,
      'status': 200,
    };

    endpoint(request, response).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
      assert.equal(testResult.body, correctResult.body, 'response body');

      done();
    });
  });

  it('fails to override pubnub mock for this 1 test', function(done) {
    let overrides = null;

    expect(() => {
      endpoint.overrideDefaultModules(overrides);
    }).to.throw(Error);

    done();
  });

  it('require(\'pubnub\') should be an instance of default', function(done) {
    let request = Object.assign({}, endpointRequestObject);
    let response = Object.assign({}, endpointResponseObject);

    request.defaultMock = true;

    let correctResult = {
      'body': true,
      'status': 200,
    };

    endpoint(request, response).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
      assert.equal(testResult.body, correctResult.body, 'body');

      done();
    });
  });

  it('pubnub.time', function(done) {
    let request = Object.assign({}, endpointRequestObject);
    let response = Object.assign({}, endpointResponseObject);

    request.pnTime = true;

    let correctResult = {
      'status': 200,
    };

    endpoint(request, response).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
      expect(testResult.body).to.be.a('number');

      done();
    });
  });

  it('fails to pubnub.publish', function(done) {
    let request = Object.assign({}, endpointRequestObject);
    let response = Object.assign({}, endpointResponseObject);

    request.pub = true;

    request.toPublish = null;

    let correctResult = {
      'status': 500,
    };

    endpoint(request, response).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
    }).then(() => {
      request.toPublish = {
        'message': null,
      };
      return endpoint(request, response);
    }).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
      done();
    });
  });

  it('pubnub.publish', function(done) {
    let request = Object.assign({}, endpointRequestObject);
    let response = Object.assign({}, endpointResponseObject);

    request.pub = true;

    request.toPublish = {
      'message': 'test',
    };

    let correctResult = {
      'body': 'Sent',
      'status': 200,
    };

    endpoint(request, response).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
      assert.equal(testResult.body, correctResult.body, 'body');

      done();
    });
  });

  it('pubnub.grant', function(done) {
    let request = Object.assign({}, endpointRequestObject);
    let response = Object.assign({}, endpointResponseObject);

    request.grant = true;

    request.toGrant = {
      'channels': ['test'],
    };

    let correctResult = {
      'body': 'Success',
      'status': 200,
    };

    endpoint(request, response).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
      assert.equal(testResult.body, correctResult.body, 'body');

      done();
    });
  });

  it('fails to pubnub.grant', function(done) {
    let request = Object.assign({}, endpointRequestObject);
    let response = Object.assign({}, endpointResponseObject);

    request.toGrant = {};

    let correctResult = {
      'status': 500,
    };

    endpoint(request, response).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
      done();
    });
  });

  it('fails to pubnub.getState', function(done) {
    let request = Object.assign({}, endpointRequestObject);
    let response = Object.assign({}, endpointResponseObject);

    request.toGetState = 'not object';

    let correctResult = {
      'status': 500,
    };

    endpoint(request, response).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
    }).then(() => {
      request.toGetState = {'uuid': undefined};
      return endpoint(request, response);
    }).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
      done();
    });
  });

  it('pubnub.getState', function(done) {
    let request = Object.assign({}, endpointRequestObject);
    let response = Object.assign({}, endpointResponseObject);

    request.toGetState = {'uuid': 'test'};

    let correctResult = {
      'body': 'OK',
      'status': 200,
    };

    endpoint(request, response).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
      assert.equal(testResult.body, correctResult.body, 'body');
      done();
    });
  });

  it('fails to pubnub.setState', function(done) {
    let request = Object.assign({}, endpointRequestObject);
    let response = Object.assign({}, endpointResponseObject);

    request.toSetState = 'not object';

    let correctResult = {
      'status': 500,
    };

    endpoint(request, response).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
    }).then(() => {
      request.toSetState = {'uuid': undefined};
      return endpoint(request, response);
    }).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
      done();
    });
  });

  it('pubnub.setState', function(done) {
    let request = Object.assign({}, endpointRequestObject);
    let response = Object.assign({}, endpointResponseObject);

    request.toSetState = {'uuid': 'test'};

    let correctResult = {
      'body': 'OK',
      'status': 200,
    };

    endpoint(request, response).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
      assert.equal(testResult.body, correctResult.body, 'body');
      done();
    });
  });

  it('pubnub.hereNow', function(done) {
    let request = Object.assign({}, endpointRequestObject);
    let response = Object.assign({}, endpointResponseObject);

    request.toHereNow = true;

    let correctResult = {
      'body': 'OK',
      'status': 200,
    };

    endpoint(request, response).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
      assert.equal(testResult.body, correctResult.body, 'body');
      done();
    });
  });

  it('fails to pubnub.whereNow', function(done) {
    let request = Object.assign({}, endpointRequestObject);
    let response = Object.assign({}, endpointResponseObject);

    request.toWhereNow = 'not object';

    let correctResult = {
      'status': 500,
    };

    endpoint(request, response).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
    }).then(() => {
      request.toWhereNow = {'uuid': undefined};
      return endpoint(request, response);
    }).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
      done();
    });
  });

  it('pubnub.whereNow', function(done) {
    let request = Object.assign({}, endpointRequestObject);
    let response = Object.assign({}, endpointResponseObject);

    request.toWhereNow = {'uuid': 'test'};

    let correctResult = {
      'body': 'OK',
      'status': 200,
    };

    endpoint(request, response).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
      assert.equal(testResult.body, correctResult.body, 'body');
      done();
    });
  });

  it('fails to pubnub.history', function(done) {
    let request = Object.assign({}, endpointRequestObject);
    let response = Object.assign({}, endpointResponseObject);

    request.history = {
      toHistory: 'not object',
    };

    let correctResult = {
      'status': 500,
    };

    endpoint(request, response).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
    }).then(() => {
      request.history = {
        toHistory: null,
      };
      return endpoint(request, response);
    }).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
      done();
    });
  });

  it('pubnub.history', function(done) {
    let request = Object.assign({}, endpointRequestObject);
    let response = Object.assign({}, endpointResponseObject);

    request.history = {
      toHistory: {},
    };

    let correctResult = {
      'body': true,
      'status': 200,
    };

    endpoint(request, response).then((testResult) => {
      assert.equal(testResult.status, correctResult.status, 'status');
      assert.equal(testResult.body, correctResult.body, 'body');
      done();
    });
  });

  it('getKVStoreData', function(done) {
    let request = Object.assign({}, endpointRequestObject);
    let response = Object.assign({}, endpointResponseObject);

    let preExistingValue = {'key': 'value'};

    // mock a pre-existing KVStore value for this test only
    endpoint.mockKVStoreData(preExistingValue);

    let kv = endpoint.getKVStoreData();

    assert.equal(kv.key, preExistingValue.key, 'compare KVStore');

    done();
  });

  it('getKVStoreCounters', function(done) {
    let request = Object.assign({}, endpointRequestObject);
    let response = Object.assign({}, endpointResponseObject);

    let preExistingValue = {'key': 123};

    // mock a pre-existing KVStore value for this test only
    endpoint.mockKVStoreCounters(preExistingValue);

    let kv = endpoint.getKVStoreCounters();

    assert.equal(kv.key, preExistingValue.key, 'compare KVStore');

    done();
  });
});
