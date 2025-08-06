"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
function computeSum(n) {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}
// Get the number from workerData
const result = computeSum(worker_threads_1.workerData.num);
// Send result back to main thread
worker_threads_1.parentPort?.postMessage([result, worker_threads_1.workerData.num]);
