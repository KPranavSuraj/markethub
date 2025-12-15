const client = require('prom-client');

const register = new client.Registry();

client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const activeProducts = new client.Gauge({
  name: 'markethub_active_products',
  help: 'Number of active tracked products',
  registers: [register]
});

const priceCheckTotal = new client.Counter({
  name: 'markethub_price_checks_total',
  help: 'Total number of price checks performed',
  labelNames: ['platform'],
  registers: [register]
});

const initMetrics = (app) => {
  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });
};

const metricsMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
    
    httpRequestTotal
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .inc();
  });

  next();
};

module.exports = {
  initMetrics,
  metricsMiddleware,
  metrics: {
    activeProducts,
    priceCheckTotal
  }
};