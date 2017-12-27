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

describe('#HelloWorldBeforeEH', () => {
  let beforePublish;

  beforeEach(() => {
    beforePublish = mock('./examples/HelloWorld/HelloWorldBeforeEH.js');
  });

  it('creates before publish event handler of type Function', function(done) {
    assert.isFunction(beforePublish, 'was successfully created');
    done();
  });

  it('test the Hello_World block', function(done) {
    let request = Object.assign({}, fireRequestObject);

    let correctResult = {
      'message': {
        'hello': 'world'
      }
    };

    beforePublish(request).then((testResult) => {

      assert.equal(testResult.message.hello, correctResult.message.hello, 'response');

      done();
    });
  });
});
