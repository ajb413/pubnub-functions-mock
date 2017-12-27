const assert = require('chai').assert;
const expect = require('chai').expect;
const mock = require('pubnub-functions-mock');

const fireRequestObject = {
  'headers': {},
  'status': 200,
  'message': {},
  'ok': function(message) {
    return new Promise((resolve) => {
      if (message === undefined) {
        message = '';
      }
      resolve({
        'message': message,
      });
    });
  },
  'abort': function(message) {
    return new Promise((reject) => {
      if (message === undefined) {
        message = '';
      }
      reject({
        'message': message,
      });
    });
  },
};

describe('#KVStoreBeforeEH', () => {
  let beforePublish;

  beforeEach(() => {
    beforePublish = mock('./examples/KVStore/KVstoreBeforeEH.js');
  });

  it('creates before publish event handler of type Function', function(done) {
    assert.isFunction(beforePublish, 'was successfully created');
    done();
  });

  it('tests the KVStore get', function(done) {
    let request = Object.assign({}, fireRequestObject);

    request.message.key = 'foo';

    let correctResult = {
      'message': {
        'value': 'bar'
      }
    };

    beforePublish.mockKVStoreData({ "foo": "bar" });

    beforePublish(request).then((testResult) => {

      assert.equal(testResult.message.value, correctResult.message.value, 'response');

      done();
    });
  });
});
