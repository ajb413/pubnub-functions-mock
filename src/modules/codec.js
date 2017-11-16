const qs = require('qs');

const queryInterface = {
  'stringify': qs.stringify,
};

const base64Interface = {
  btoa: (unencoded) => {
    return new Buffer(unencoded || '').toString('base64');
  },
  atob: (encoded) => {
    return new Buffer(encoded || '', 'base64').toString('utf8');
  },
  encodeString: (unencoded) => {
    return base64Interface.btoa(unencoded)
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  },
};

base64Interface.decodeString = base64Interface.atob;

module.exports = {
  'queryInterface': queryInterface,
  'base64Interface': base64Interface,
};
