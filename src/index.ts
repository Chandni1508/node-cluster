import cluster from 'cluster';
import { cpus } from 'os';
import http from 'http';
import { Worker } from 'worker_threads';
import path from 'path';

const numCPUs = cpus().length;
const PORT = 3000;

if (cluster.isPrimary) {
  console.log(`Master ${process.pid} is running, ${numCPUs}`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    console.log(`====${i}`)
    cluster.fork();
  }

  // Respawn worker on exit
  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  console.log(`Worker ${process.pid} started`);

  const server = http.createServer((req, res) => {
    if (req.url?.startsWith('/compute')) {
      const urlParams = new URL(req.url, `http://${req.headers.host}`);
      const num = parseInt(urlParams.searchParams.get('num') || '100000000');

      // Offload to Worker Thread
      const worker = new Worker(path.resolve(__dirname, 'workerTask.js'), {
        workerData: { num }
      });

      worker.on('message', (result) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(`Result: ${result[0]}, computed for ${result[1]} by worker thread on process ${process.pid}`);
      });

      worker.on('error', (err) => {
        res.writeHead(500);
        res.end('Worker thread error: ' + err.message);
      });
    } else {
      res.writeHead(200);
      res.end('Hello from Node.js Clustered Server');
    }
  });

  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT} on process ${process.pid}`);
  });
}
