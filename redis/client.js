const redis = require('redis');
const Promise = require('bluebird')
Promise.promisifyAll(redis.RedisClient.prototype)
Promise.promisifyAll(redis.Multi.prototype)

const client = redis.createClient();

client.on('connect', function() {
    console.log('Redis client connected');
    client.flushall()
});

client.on('error', function (err) {
    console.log('Something went wrong ' + err);
});

module.exports = client