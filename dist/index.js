"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cluster_1 = __importDefault(require("cluster"));
const os_1 = require("os");
const http_1 = __importDefault(require("http"));
const worker_threads_1 = require("worker_threads");
const path_1 = __importDefault(require("path"));
const numCPUs = (0, os_1.cpus)().length;
const PORT = 3000;
if (cluster_1.default.isPrimary) {
    console.log(`Master ${process.pid} is running, ${numCPUs}`);
    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
        console.log(`====${i}`);
        cluster_1.default.fork();
    }
    // Respawn worker on exit
    cluster_1.default.on('exit', (worker) => {
        console.log(`Worker ${worker.process.pid} died. Restarting...`);
        cluster_1.default.fork();
    });
}
else {
    console.log(`Worker ${process.pid} started`);
    const server = http_1.default.createServer((req, res) => {
        if (req.url?.startsWith('/compute')) {
            const urlParams = new URL(req.url, `http://${req.headers.host}`);
            const num = parseInt(urlParams.searchParams.get('num') || '100000000');
            // Offload to Worker Thread
            const worker = new worker_threads_1.Worker(path_1.default.resolve(__dirname, 'workerTask.js'), {
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
        }
        else {
            res.writeHead(200);
            res.end('Hello from Node.js Clustered Server');
        }
    });
    server.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT} on process ${process.pid}`);
    });
}
