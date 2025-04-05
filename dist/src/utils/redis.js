"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const redis = (0, redis_1.createClient)({
    username: "default",
    password: "KL7VSp0TOB4ozooz5u2Ves7cOlJTdPlx",
    socket: {
        host: "redis-14792.c279.us-central1-1.gce.redns.redis-cloud.com",
        port: 14792,
    },
});
redis.on("error", (err) => console.log("Redis Client Error", err));
redis.connect().catch(console.error);
exports.default = redis;
