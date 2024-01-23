import * as redis from 'redis';
let redisClient: any;

// const REDIS_URL = process.env.REDIS_CLIENT_URL;
(async () => {
  redisClient =
    redis?.createClient &&
    redis?.createClient({
      url: 'rediss://red-cfr9d85a499b40d89pkg:g27tvaFQTDr20qr195HgtCrql65PIzht@singapore-redis.render.com:6379',
    });

  redisClient.on('connect', () => {
    console.log('Connected to Redis server');
  });

  redisClient.on('error', (err: any) => console.log('Redis Client Error', err));

  redisClient.on('end', () => {
    console.log('Disconnected from Redis server');
  });

  await redisClient.connect();

  // Send and retrieve some valuese
  // await client.set('key', 'node redis');
  // const value = await client.get('key');

  // console.log("found value: ", value)
})();

export { redisClient };
