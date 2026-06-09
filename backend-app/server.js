const http = require('http');

const PORT = 3040;

const server = http.createServer((req, res) => {
    // 1. Set CORS headers so the frontend can make requests to this backend
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    // 2. Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // 3. Handle the Success Route
    if (req.url === '/api/success' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Success! Backend reached successfully.' }));
    } 
    // 4. Handle non-existent routes (for the Failure button)
    else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Route not found.' }));
    }
});

server.listen(PORT, () => {
    console.log(`Backend API is running at http://localhost:${PORT}`);
});