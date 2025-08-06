import { parentPort, workerData } from 'worker_threads';

function computeSum(n: number): number {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

// Get the number from workerData
const result = computeSum(workerData.num);

// Send result back to main thread
parentPort?.postMessage([result, workerData.num]);
