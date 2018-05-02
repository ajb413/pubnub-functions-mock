const vaultInterface = {
  get: (key) => {
    return new Promise((resolve, reject) => {
      if (typeof key !== 'string' || key === '') {
        reject(`Invalid key [${key}], non-empty string required`);
      }

      resolve(key);
    });
  },
};

module.exports = vaultInterface;
