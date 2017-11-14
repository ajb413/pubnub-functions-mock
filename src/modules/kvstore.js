const kvInterface = {
    "keyValueStorage": {},
    "keyValueCounters": {},
    set: (key, value, ttl) => {
        return new Promise((resolve) => {
            if (typeof(key) !== "string") {
                throw Error("not a valid key string. kvstore.set expects a string.");
            }

            if (ttl && typeof(ttl) !== "number") {
                throw Error("ttl must be a number.");
            }

            kvInterface.keyValueStorage[key] = value;
            resolve(null);
        });
    },
    get: (key) => {
        return new Promise((resolve) => {
            if (typeof(key) !== "string") {
                throw Error("not a valid key. kvstore.get expects a string.");
            }
            resolve(kvInterface.keyValueStorage[key]);
        });
    },
    incrCounter: (key, value) => {
        return new Promise((resolve) => {
            if (typeof(key) !== "string") {
                throw Error("not a valid key. kvstore.incrCounter expects a string.");
            }

            if (value && typeof(value) !== "number") {
                throw Error("not a valid value. kvstore.incrCounter expects a number.");
            }

            if (!kvInterface.keyValueCounters[key]) {
                kvInterface.keyValueCounters[key] = value || 1;
            } else {
                kvInterface.keyValueCounters[key] += value || 1;
            }

            resolve(null);
        });
    },
    getCounter: (key) => {
        return new Promise((resolve) => {
            if (typeof(key) !== "string") {
                throw Error("not a valid key. kvstore.get expects a string.");
            }
            resolve(kvInterface.keyValueCounters[key]);
        });
    },
    removeItem: (key) => {
        return new Promise((resolve) => {
            if (typeof(key) !== "string") {
                throw Error("not a valid key. kvstore.removeItem expects a string.");
            }
            delete kvInterface.keyValueStorage[key];
            resolve(null);
        });
    }
};

kvInterface.getItem = kvInterface.get;
kvInterface.setItem = kvInterface.set;

module.exports = kvInterface;
