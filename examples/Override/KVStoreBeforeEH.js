// 
// Get a value from the KVStore
// 
export default request => {
    const kvstore = require('kvstore');
    // Override your original message!
    return kvstore.get(request.message.key).then((result) => {
        return request.ok({ "value" : result });
    });
}