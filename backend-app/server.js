const http = require('http');
const promClient = require('prom-client');

const PORT = 3040;

// 1. Enable Auto Instrumentation (Default Node.js & System Metrics)
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics();

// 2. Create a custom metric: Counter for the success endpoint
const successCounter = new promClient.Counter({
    name: 'backend_success_requests_total',
    help: 'Total number of successful requests made to the /api/success endpoint'
});

const server = http.createServer(async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // 3. Expose the /metrics endpoint for Prometheus/Mimir to scrape
    if (req.url === '/metrics' && req.method === 'GET') {
        try {
            res.setHeader('Content-Type', promClient.register.contentType);
            const metrics = await promClient.register.metrics();
            res.writeHead(200);
            res.end(metrics);
        } catch (ex) {
            res.writeHead(500);
            res.end(ex.message);
        }
        return;
    }

    // Handle the Success Route
    if (req.url === '/api/success' && req.method === 'GET') {
        // Increment our custom metric!
        successCounter.inc();

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Success! Backend reached successfully.' }));
    } 
    // Handle non-existent routes (for the Failure button)
    else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Route not found.' }));
    }
});

server.listen(PORT, () => {
    console.log(`Backend API is running at http://localhost:${PORT}`);
});