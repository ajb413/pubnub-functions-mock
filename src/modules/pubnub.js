const pubnubInterface = {
  time: () => {
    return new Promise((resolve, reject) => {
      resolve(Date.now() * 10000);
    });
  },
  publish: (obj) => {
    return new Promise((resolve) => {
      if (!obj) {
        throw Error('[publish] Object is required');
      }

      let ts = String(Date.now() * 10000);

      if (typeof(obj) !== 'object' || !obj.message) {
        throw Error([0, 'Invalid JSON', ts]);
      }

      resolve([1, 'Sent', ts]);
    });
  },
  history: (obj) => {
    return new Promise((resolve) => {
      if (!obj || typeof(obj) !== 'object') {
        throw Error('Cannot read property \'extraOptions\'');
      }

      resolve({
        'messages': [{}],
        'startTimeToken': Date.now() * 10000,
        'endTimeToken': Date.now() * 10000,
      });
    });
  },
  whereNow: (obj) => {
    return new Promise((resolve) => {
      if (typeof(obj) !== 'object' || obj.uuid === undefined) {
        throw Error('[whereNow] \'uuid\' is required');
      }

      resolve({
        'status': 200,
        'message': 'OK',
        'payload': {
          'channels': [],
        },
        'service': 'Presence',
      });
    });
  },
  hereNow: () => {
    return Promise.resolve({
      'status': 200,
      'message': 'OK',
      'payload': {
        'channels': {},
        'total_channels': 0,
        'total_occupancy': 0,
      },
      'service': 'Presence',
    });
  },
  setState: (obj) => {
    return new Promise((resolve) => {
      if (typeof(obj) !== 'object' || obj.uuid === undefined) {
        throw Error('[setState] \'uuid\' is required');
      }

      resolve({
        'status': 200,
        'message': 'OK',
        'payload': {},
        'uuid': String(obj.uuid),
        'channel': obj.channels || [],
        'service': 'Presence',
      });
    });
  },
  getState: (obj) => {
    return new Promise((resolve) => {
      if (typeof(obj) !== 'object' || obj.uuid === undefined) {
        throw Error('[getState] \'uuid\' is required');
      }

      resolve({
        'status': 200,
        'message': 'OK',
        'payload': {},
        'uuid': String(obj.uuid),
        'channel': obj.channels || [],
        'service': 'Presence',
      });
    });
  },
  grant: (obj) => {
    return new Promise((resolve) => {
      if (typeof(obj) !== 'object' || (!obj.channels && !obj.channelGroups)) {
        let err = '[grant] expects Object with [channels] or [channelGroups]';
        throw Error(err);
      }

      resolve({
        'message': 'Success',
        'payload': {
          'level': '',
          'subscribe_key': '',
          'ttl': 1,
          'channel': '',
          'auths': {},
          'channel-groups': '',
        },
        'service': 'Access Manager',
        'status': 200,
      });
    });
  },
  channelGroups: {
    addChannels: (obj) => {
      return new Promise((resolve) => {
        if (typeof(obj) !== 'object' || (!obj.channels && !obj.channelGroup)) {
          let err = '[channelGroups.addChannels] expects Object with [channels] and \'channelGroup\'';
          throw Error(err);
        }

        resolve({
          error: false,
          operation: "PNAddChannelsToGroupOperation",
          status: 200
        });
      });
    },
    removeChannels: (obj) => {
      return new Promise((resolve) => {
        if (typeof(obj) !== 'object' || (!obj.channelGroup)) {
          let err = '[channelGroups.addChannels] expects Object with [channels] and \'channelGroup\'';
          throw Error(err);
        }

        resolve({
          error: false,
          operation: "PNRemoveChannelsFromGroupOperation",
          status: 200
        });
      });
    },
  },
};
pubnubInterface.fire = pubnubInterface.publish;

module.exports = pubnubInterface;
