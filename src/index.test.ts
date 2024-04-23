// import "fake-indexeddb/auto";
// import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
// import DexieQueue from './index'; // Importing from the source file

// // Mock asynchronous function for testing
// const asyncFunction = async (jobData): Promise<{ progress?: number }> => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve({ progress: jobData.initialProgress });
//     }, 1000);
//   });
// };

// const progressFunction = async (jobData): Promise<{ progress: number }> => {
//   return new Promise((resolve) => {
//     let progress = jobData.startProgress;
//     const interval = setInterval(() => {
//       progress += jobData.increment;
//       if (progress >= jobData.maxProgress) {
//         clearInterval(interval);
//         resolve({ progress });
//       }
//     }, jobData.interval);
//   });
// };

// describe('DexieQueue', () => {
//   let queue: DexieQueue;

//   beforeEach(() => {
//     queue = new DexieQueue({ concurrency: 2 });
//     // Register workers
//     queue.addWorker('asyncFunction', asyncFunction);
//     queue.addWorker('progressFunction', progressFunction);
//   });

//   afterEach(() => {
//     queue.obliterate();
//   });

//   it('should add and process jobs', async () => {
//     const onCompleteSpy = vi.fn();
//     queue.onJobComplete(onCompleteSpy);
  
//     queue.addJob('asyncFunction', { jobData: { initialProgress: 100 } });
//     queue.addJob('asyncFunction', { jobData: { initialProgress: 100 } });
  
//     // Adjust the wait time or ensure jobs can complete in set time
//     await new Promise((resolve) => setTimeout(resolve, 3000)); // Increase timeout to ensure jobs complete
  
//     expect(onCompleteSpy).toHaveBeenCalledTimes(2);
//   });
  

//   it('should call onJobComplete callback when a job completes', async () => {
//     const jobCompleteCallback = vi.fn();
//     queue.onJobComplete(jobCompleteCallback);

//     queue.addJob('asyncFunction', { jobData: { initialProgress: 100 } });

//     // Wait for job to complete
//     await new Promise((resolve) => setTimeout(resolve, 1500));

//     expect(jobCompleteCallback).toHaveBeenCalled();
//   });

//   it('should call onJobFailure callback when a job fails', async () => {
//     const failingFunction = async (jobData) => {
//       throw new Error('Job failed');
//     };

//     queue.addWorker('failingFunction', failingFunction);

//     const jobFailureCallback = vi.fn();
//     queue.onJobFailure(jobFailureCallback);

//     queue.addJob('failingFunction');

//     // Wait for job to fail
//     await new Promise((resolve) => setTimeout(resolve, 1500));

//     expect(jobFailureCallback).toHaveBeenCalled();
//   });

//   it('should call onDrained callback when queue is empty', async () => {
//     const drainedCallback = vi.fn();
//     queue.onDrained(drainedCallback);
  
//     queue.addJob('asyncFunction', { jobData: { initialProgress: 100 } });
//     await new Promise((resolve) => setTimeout(resolve, 2000)); // Ensure job completes
  
//     expect(drainedCallback).toHaveBeenCalled();
//   });

//   it('should call onProgress callback when job progress is updated', async () => {
//     const progressCallback = vi.fn();
//     queue.onProgress(progressCallback);
  
//     queue.addJob('progressFunction', { jobData: { startProgress: 0, increment: 25, maxProgress: 100, interval: 250 } });
  
//     // Ensure there's enough time for all progress updates to occur
//     await new Promise((resolve) => setTimeout(resolve, 3000));
  
//     expect(progressCallback).toHaveBeenCalledTimes(4); // Validate the expected number of calls
//   });
  
//   it('should handle concurrency correctly', async () => {
//     const jobFunction = async (jobData) => new Promise(resolve => setTimeout(() => resolve({ result: 'done' }), jobData.delay));
//     queue.addWorker('jobFunction', jobFunction);

//     const completeSpy = vi.fn();
//     queue.onJobComplete(completeSpy);
  
//     for (let i = 0; i < 4; i++) { // Add 4 jobs
//       queue.addJob('jobFunction', { jobData: { delay: 500 } });
//     }
  
//     await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for two rounds
  
//     expect(completeSpy).toHaveBeenCalledTimes(4);
//   });
  
// });
