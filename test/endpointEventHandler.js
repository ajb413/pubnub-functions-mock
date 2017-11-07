export default (request, response) => {
    const kvstore = require('kvstore');
    const base64Codec = require('codec/base64');

    if (request.getKvValue) {
        return kvstore.get('key').then((value) => {
            response.status = 200;
            return response.send(value);
        });
    }

    if (request.setKvValue) {
        return kvstore.set('key', 'value', 123).then((value) => {
            response.status = 200;
            return response.send(value);
        });
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
        pubnub().then((shouldBeTrue) => {
            response.status = 200;
            return response.send(shouldBeTrue);
        });
    }

    if (request.defaultMock) {
        let pubnub = require('pubnub');
        if (pubnub.publish) {
            console.log(pubnub.publish);
            response.status = 200;
            return response.send(true);
        }
    }

    response.status = 200;
    return response.send("Hello World!");
};