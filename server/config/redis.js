const Redis = require('ioredis');
const RedisMock = require('ioredis-mock');

let redis;

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL);
  console.log('Connected to real Redis instance.');
} else {
  redis = new RedisMock();
  console.log('No REDIS_URL found. Using in-memory Redis mock for development.');
}

redis.on('error', (err) => {
  console.error('Redis Error:', err);
});

module.exports = redis;
