import { createServer } from 'node:http';

const port = Number(process.env.PORT || 3000);

const server = createServer((request, response) => {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (request.method === 'GET' && request.url === '/api/health') {
    response.writeHead(200);
    response.end(JSON.stringify({ status: 'ok', service: 'imoka-pos-api' }));
    return;
  }

  response.writeHead(404);
  response.end(JSON.stringify({ error: 'Route not found' }));
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Imoka POS API listening on port ${port}`);
});
