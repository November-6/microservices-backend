const Redis = require("ioredis");

const redis = new Redis("redis://localhost:6379");

redis.on("connect", async () => {
  console.log("✅ Redis connected");

  await redis.set("hello", "world");
  const value = await redis.get("hello");

  console.log("Redis value:", value);

  redis.quit();
});

redis.on("error", (err) => {
  console.error("❌ Redis error:", err);
});
