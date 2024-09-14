import * as redis from 'redis';
let redisClient: any;

const connectRedis = async (redisUrl: string) => {
  if (redisUrl) {
    redisClient =
      redis?.createClient &&
      redis?.createClient({
        url: redisUrl,
      });

    redisClient.on('connect', () => {
      console.log('Connected to Redis server');
    });

    redisClient.on('error', (err: any) =>
      console.log('Redis Client Error', err)
    );

    redisClient.on('end', () => {
      console.log('Disconnected from Redis server');
    });

    await redisClient.connect();
  }
};

export { redisClient };
export default connectRedis;
