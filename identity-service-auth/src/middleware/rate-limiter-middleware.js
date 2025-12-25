const rateLimitMiddleware = (rateLimiter) => {
  return async (req, res, next) => {
    try {
      await rateLimiter.consume(req.ip);
      next();
    } catch (err) {
      res.status(429).json({
        message: `Rate limit exceeded for ${req.ip}`,
      });
    }
  };
};
module.exports = rateLimitMiddleware;


// notice how this is a function that returns a middleware function. This is an example of a higher order function in javascript. We do this so that we can pass in the rateLimiter instance when we use the middleware in server.js