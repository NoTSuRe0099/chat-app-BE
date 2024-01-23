"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
const redis = __importStar(require("redis"));
let redisClient;
// const REDIS_URL = process.env.REDIS_CLIENT_URL;
(async () => {
    exports.redisClient = redisClient =
        (redis === null || redis === void 0 ? void 0 : redis.createClient) &&
            (redis === null || redis === void 0 ? void 0 : redis.createClient({
                url: 'rediss://red-cfr9d85a499b40d89pkg:g27tvaFQTDr20qr195HgtCrql65PIzht@singapore-redis.render.com:6379',
            }));
    redisClient.on('connect', () => {
        console.log('Connected to Redis server');
    });
    redisClient.on('error', (err) => console.log('Redis Client Error', err));
    redisClient.on('end', () => {
        console.log('Disconnected from Redis server');
    });
    await redisClient.connect();
    // Send and retrieve some valuese
    // await client.set('key', 'node redis');
    // const value = await client.get('key');
    // console.log("found value: ", value)
})();
//# sourceMappingURL=redis.service.js.map