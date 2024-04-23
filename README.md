# Dexie Queue

Dexie Queue is a TypeScript library for managing a queue of asynchronous jobs using Dexie for persistence. It allows you to easily add jobs to a queue, pause and resume the queue, and receive notifications when jobs are completed, fail, or when progress is updated.

## Overview

Dexie Queue is designed to provide a simple yet powerful way to manage asynchronous jobs in your TypeScript projects. It leverages Dexie, a minimalistic IndexedDB wrapper, for persistent storage of jobs, ensuring that your queue remains intact even if your application is closed or refreshed.

## API

### `new DexieQueue(options: QueueOptions)`

Creates a new instance of the Dexie Queue with the specified options.

- `options`: An object containing options for configuring the queue.
  - `concurrency`: The maximum number of jobs to run concurrently.

### `addJob(fn: () => Promise<{ progress?: number }>, options?: JobOptions)`

Adds a new job to the queue.

- `fn`: A function that returns a promise representing the asynchronous job to be executed. The function can optionally return an object with a `progress` property to track job progress.
- `options`: An optional object containing additional options for the job.
  - `retries`: The number of times the job should be retried if it fails. Default is `0`.
  - `timeout`: The maximum time (in milliseconds) to wait for the job to complete before considering it failed. Default is `0` (no timeout).
  - `id`: The unique identifier for the job. If not provided, a unique ID will be generated.
  - `priority`: The priority of the job. Jobs with higher priority values will be executed first. Default is `0`.

### `pause()`

Pauses the execution of the queue.

### `resume()`

Resumes the execution of the queue.

### `obliterate()`

Removes all jobs from the queue.

### Events

You can listen to the following events by providing callback functions:

- `onDrained()`: Called when the queue is empty (no tasks are left).
- `onJobComplete(job: Job)`: Called when a job completes successfully.
- `onJobFailure(job: Job)`: Called when a job fails to complete.
- `onProgress(progress: number)`: Called when progress is updated for a job.

## Usage

```typescript
import DexieQueue from 'dexie-queue';

const queue = new DexieQueue({ concurrency: 3 });

queue.addJob(async () => {
  // Your asynchronous task
});

queue.onJobComplete((job) => {
  console.log(`Job ${job.id} completed successfully.`);
});

queue.onJobFailure((job) => {
  console.error(`Job ${job.id} failed.`);
});

queue.onDrained(() => {
  console.log('Queue is empty.');
});

queue.resume();
```

In this example, a queue is created with a concurrency of 3. A job is added to the queue, and event listeners are attached to handle job completion, failure, and queue drainage. Finally, the queue is resumed to start processing jobs.
