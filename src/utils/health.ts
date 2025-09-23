import { createServer } from 'http';

export class HealthCheck {
  private server: any;
  private port: number;

  constructor(port: number = 8000) {
    this.port = port;
  }

  start(): void {
    this.server = createServer((req, res) => {
      if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime()
        }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
      }
    });

    this.server.listen(this.port, () => {
      console.log(`✅ Health check server started on port ${this.port}`);
    });
  }

  stop(): void {
    if (this.server) {
      this.server.close();
    }
  }
}
