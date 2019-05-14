export default (request, response) => {
  const kvstore = require('kvstore');
  const base64Codec = require('codec/base64');
  const xhr = require('xhr');
  const vault = require('vault');

  const testFail = (err) => {
    response.status = 500;
    return response.send(err);
  };

  if (request.xhr) {
    return xhr.fetch('https://httpbin.org/get').then((res) => {
      if (res.status >= 200 && res.status < 300) {
        response.status = 200;
        return response.send(true);
      } else {
        testFail(res);
      }
    }).catch(testFail);
  }

  if (request.getKvValue) {
    let key = request.key;
    return kvstore.get(key).then((value) => {
      response.status = 200;
      return response.send(value);
    }).catch(testFail);
  }

  if (request.setKvValue) {
    let key = request.key;
    let value = request.value;
    let ttl = request.ttl;
    return kvstore.set(key, value, ttl).then((value) => {
      response.status = 200;
      return response.send(value);
    }).catch(testFail);
  }

  if (request.getItem) {
    let key = request.key;
    return kvstore.getItem(key).then((value) => {
      response.status = 200;
      return response.send(value);
    }).catch(testFail);
  }

  if (request.setItem) {
    let key = request.key;
    let value = request.value;
    let ttl = request.ttl;
    return kvstore.setItem(key, value, ttl).then((value) => {
      response.status = 200;
      return response.send(value);
    }).catch(testFail);
  }

  if (request.incKvValue) {
    let key = request.key;
    let value = request.value;
    return kvstore.incrCounter(key, value).then((value) => {
      response.status = 200;
      return response.send(value);
    }).catch(testFail);
  }

  if (request.getKvCounter) {
    let key = request.key;
    return kvstore.getCounter(key).then((value) => {
      response.status = 200;
      return response.send(value);
    }).catch(testFail);
  }

  if (request.removeItem) {
    let key = request.removeItem;
    return kvstore.removeItem(key).then((value) => {
      response.status = 200;
      return response.send(value);
    }).catch(testFail);
  }

  if (request.b64) {
    let btoa = base64Codec.btoa('hello'); // aGVsbG8=
    let atob = base64Codec.atob('aGVsbG8='); // hello
    let encodeString = base64Codec.encodeString('+'); // Kw==
    let decodeString = base64Codec.decodeString('Kw=='); // +

    let body = {
      btoa,
      atob,
      encodeString,
      decodeString,
    };

    response.status = 200;
    return response.send(body);
  }

  if (request.testOverride) {
    let pubnub = require('pubnub');
    response.status = 200;
    return response.send(pubnub);
  }

  if (request.defaultMock) {
    let pubnub = require('pubnub');
    if (pubnub.publish) {
      response.status = 200;
      return response.send(true);
    }
  }

  if (request.pnTime) {
    let pubnub = require('pubnub');
    return pubnub.time().then((value) => {
      if (typeof(value) === 'number') {
        response.status = 200;
        return response.send(value);
      } else {
        return testFail(value);
      }
    }).catch(testFail);
  }

  if (request.pub) {
    let pubnub = require('pubnub');
    let toPublish = request.toPublish;
    return pubnub.publish(toPublish).then((value) => {
      if (value[1] === 'Sent') {
        response.status = 200;
        return response.send(value[1]);
      } else {
        return testFail(value);
      }
    }).catch(testFail);
  }

  if (request.toGrant) {
    let pubnub = require('pubnub');
    let toGrant = request.toGrant;
    return pubnub.grant(toGrant).then((value) => {
      if (value.message === 'Success') {
        response.status = 200;
        return response.send(value.message);
      } else {
        return testFail(value);
      }
    }).catch(testFail);
  }

  if (request.toGetState) {
    let pubnub = require('pubnub');
    let toGetState = request.toGetState;
    return pubnub.getState(toGetState).then((value) => {
      if (value.message === 'OK') {
        response.status = 200;
        return response.send(value.message);
      } else {
        return testFail(value);
      }
    }).catch(testFail);
  }

  if (request.toSetState) {
    let pubnub = require('pubnub');
    let toSetState = request.toSetState;
    return pubnub.setState(toSetState).then((value) => {
      if (value.message === 'OK') {
        response.status = 200;
        return response.send(value.message);
      } else {
        return testFail(value);
      }
    }).catch(testFail);
  }

  if (request.toHereNow) {
    let pubnub = require('pubnub');
    return pubnub.hereNow().then((value) => {
      if (value.message === 'OK') {
        response.status = 200;
        return response.send(value.message);
      } else {
        return testFail(value);
      }
    }).catch(testFail);
  }

  if (request.toWhereNow) {
    let pubnub = require('pubnub');
    let toWhereNow = request.toWhereNow;
    return pubnub.whereNow(toWhereNow).then((value) => {
      if (value.message === 'OK') {
        response.status = 200;
        return response.send(value.message);
      } else {
        return testFail(value);
      }
    }).catch(testFail);
  }

  if (request.history) {
    let pubnub = require('pubnub');
    let history = request.history.toHistory;
    return pubnub.history(history).then((value) => {
      if (value.messages) {
        response.status = 200;
        return response.send(true);
      } else {
        return testFail(value);
      }
    }).catch(testFail);
  }

  if (request.vault) {
    return vault.get(request.vault.key).then((value) => {
      if (value) {
        response.status = 200;
        return response.send(true);
      }
      else {
        return testFail(value);
      }
    }).catch(testFail);
  }

  if (request.channelGroups) {
    let pubnub = require('pubnub');
    let channelGroups = request.channelGroups;

    if (channelGroups.addChannels) {
      return pubnub.channelGroups.addChannels(channelGroups.addChannels).then((value) => {
        if (value) {
          response.status = 200;
          return response.send(value)
        } else {
          return testFail(value);
        }
      })
    }

    if (channelGroups.removeChannels) {
      return pubnub.channelGroups.removeChannels(channelGroups.removeChannels).then((value) => {
        if (value) {
          response.status = 200;
          return response.send(value)
        } else {
          return testFail(value);
        }
      })
    }
  }

  response.status = 200;
  return response.send('Hello World!');
};
