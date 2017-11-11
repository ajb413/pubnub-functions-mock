export default (request, response) => {
    const kvstore = require('kvstore');
    const base64Codec = require('codec/base64');
    const xhr = require('xhr');

    const testFail = (err) => {
        response.status = 500;
        return response.send(err);
    };

    if (request.xhr) {
        return xhr.fetch("https://httpbin.org/get").then((res) => {
            if (res.status >= 200 && res.status < 300) {
                response.status = 200;
                return response.send(true);
            }
            else {
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
        return kvstore.set(key, value, 123).then((value) => {
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
        return kvstore.setItem(key, value, 123).then((value) => {
            response.status = 200;
            return response.send(value);
        }).catch(testFail);
    }

    if (request.incKvValue) {
        let key = request.key;
        let value = request.value;
        return kvstore.incrCounter(key, value, 123).then((value) => {
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

    if (request.b64) {
        let btoa = base64Codec.btoa('hello'); // aGVsbG8=
        let atob = base64Codec.atob('aGVsbG8='); // hello
        let encodeString = base64Codec.encodeString('+'); // Kw==
        let decodeString = base64Codec.decodeString('Kw=='); // +

        let body = {
            btoa,
            atob,
            encodeString,
            decodeString
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

    response.status = 200;
    return response.send("Hello World!");
};