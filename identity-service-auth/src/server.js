require("dotenv").config();
const mongoose = require("mongoose");
const logger = require("./utils/logger");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const Redis = require("ioredis");
const app = express();
const { rateLimit } = require("express-rate-limit");
const { RateLimiterRedis } = require("rate-limiter-flexible");
const rateLimitMiddleware = require("./middleware/rate-limiter-middleware");
const { RedisStore } = require("rate-limit-redis");
const routes = require("./routes/identity-service-route");
const errorHandler = require("./middleware/errorHandler");

// redis runs as its own server remember, thats why we need a URL for it.
// will prolly make a utube video on this ive studied this tech a lot in the past few days
// Also in past I was using node redis package which is officially supported by redis but ioredis is better for production use cases apparently
const redisClient = new Redis(process.env.REDIS_URL);

redisClient.on("connect", () => {
  logger.info("Connected to Redis");
});

redisClient.on("error", (err) => {
  logger.error("Redis connection error:", err);
});
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => logger.info("Connected to MongoDB"))
  .catch((err) => logger.error("MongoDB connection error:", err));

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(
    `Recieved ${req.method} request for ${req.url} with body ${req.body}`
  );
  next();
});

//! A little crash course on rate limiting bitches:

// Rate limiting is done for DDoS protection and abuse prevention
// 10 Requests per second per IP
// Each request increments a counter associated with that IP, and Redis enforces a maximum count per time window.

// Request
//   ↓
// rateLimiter.consume(ip)
//   ↓
// Redis: INCR middleware:ip
//   ↓
// Counter <= 10 → allow
// Counter > 10 → block (429)

// ok so whats happening here is that we are creating a rate limiter which will limit requests from users. It acheives that by using redis to store the request counts for each IP address.

// Whenever a request is made from an IP -> This increases a counter in redis for that IP

// If the counter exceeds the limit (10 requests per second here) -> further requests are blocked with a 429 status code

// SOOOOO what we AREEE blocking is actually a client making more than 10 request per second. If a client makes 8 requests per second (which still sounds like a lot) they will be allowed. But if they make 11 requests per second, the 11th request and any subsequent requests within that second will be blocked with a 429 Too Many Requests response.

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "middleware", // prefix for all keys
  points: 10, // 10 requests
  duration: 1, // per second by IP
});

// read more on this node-rate-limiter-flexible its kinda cool actually

app.use(rateLimitMiddleware(rateLimiter));

// This is another layer of security for sensitive endpoints like login and registration
// This will stop attackters from making more than 50 requests in 15 minutes to these endpoints

// Request
//   ↓
// Global Redis limiter (10 req/sec)
//   ↓
// Sensitive endpoint limiter (50 / 15 min)
//   ↓
// Auth logic

// For routes where this middleware is applied:
// Allow at most 50 requests per IP per 15 minutes,
// track counts in Redis,
// log abuse,
// and return a clean 429 error when exceeded.

// This is another middleware only, but im not putting it in another file coz i regret putting the last one already. But yeah its a rate limiter specifically for sensitive endpoints like login and registration
const sensitiveEndpointsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ success: false, message: "Too many requests" });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

app.use("/api/auth/register", sensitiveEndpointsLimiter);

app.use("/api/auth", routes);

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`Identity Service Auth running on port ${PORT}`);
});
