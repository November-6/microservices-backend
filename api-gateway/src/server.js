require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Redis = require("ioredis");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const logger = require("./utils/logger");
const proxy = require("express-http-proxy");
const errorHandler = require("./middleware/errorhandler");
// const { validateToken } = require("./middleware/authMiddleware");

const app = express();
const redisClient = new Redis(process.env.REDIS_URL);

redisClient.on("connect", () => {
  logger.info("API GATEWAY Connected to Redis");
});

redisClient.on("error", (err) => {
  logger.error("API GATEWAY Redis connection error:", err);
});

const apiGatewayRateLimiter = rateLimit({
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

app.use(apiGatewayRateLimiter);
app.use((req, res, next) => {
  logger.info(
    `API GATEWAY Recieved ${req.method} request for ${req.url} with body ${req.body}`
  );
  next();
});

// creating an API Gateway proxy to forward requests to identity service
// proxying /v1/identity/* to identity service
// proxy req path resolver is used to modify the path before forwarding the request, we are removing the /v1 prefix here

//proxyErrorHandler is used to handle errors that occur during the proxying process, so the main thing im concerned about is only proxyReqPathResolver, other part is just error handling. This proxy options object is passed to the express-http-proxy middleware to configure it.

const proxyOptions = {
  proxyReqPathResolver: (req) => {
    const forwardTo = req.originalUrl.replace(/^\/v1/, "/api");
    return forwardTo;
  },
  proxyErrorHandler: (err, res, next) => {
    logger.error(`Proxy error: ${err.message}`);
    res.status(500).json({
      message: `Internal server error`,
      error: err.message,
    });
  },
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    //important change here -> Refer to word file documents for explaination of this
    //I am not changing req headers here thats quite unsafe actually
    return proxyReqOpts;
  },
  userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
    logger.info(
      `Response received from Identity service: ${proxyRes.statusCode}`
    );
    return proxyResData;
  },
};

app.use("/v1/auth", proxy(process.env.IDENTITY_SERVICE_URL, proxyOptions));


//! Crash course on Proxying bitches
// This crash course got too loong for this file so check for details in this part in word doc


//TODO - this rn does not really check if a service is alive or not, implement a health check endpoint like I did for rust load balancer where a periodic get health message is sent to each service to check if its alive or not

PORT = 3000
app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
  logger.info(`API Gateway forwarding /v1/auth requests to Identity Service at ${process.env.IDENTITY_SERVICE_URL}`);
  logger.info('REDIS URL: %s', process.env.REDIS_URL);
}
)
