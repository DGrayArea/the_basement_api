import { createClient } from "redis";

const redis = createClient({
  username: "default",
  password: "Jq8Y9UM6bVzTPaQWhDLa478utqxz38j8",
  socket: {
    host: "redis-18679.c11.us-east-1-3.ec2.redns.redis-cloud.com",
    port: 18679,
  },
});

redis.on("error", (err) => console.log("Redis Client Error", err));

redis.connect().catch(console.error);

export default redis;
