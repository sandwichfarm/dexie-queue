import Dexie from 'dexie';

export interface Job {
  id: string;
  fnId: string; 
  retries: number;
  timeout: number;
  priority: number;
  jobData?: any;  
}

export interface QueueOptions {
  concurrency: number;
}

export type JobData = any;

export interface JobOptions {
  retries?: number;
  timeout?: number;
  id?: string;
  priority?: number;
}

export interface JobResult {
  progress?: any;
  result?: any;
  error?: JobError;
}

export type JobError = Error;

class DexieQueue {
  private db: Dexie;
  private queue: Job[] = [];
  private running: boolean = false;
  private concurrency: number;
  private workers: Map<string, (jobData?: any) => Promise<JobResult>> = new Map();

  constructor(options: QueueOptions) {
    this.db = new Dexie('queue');
    this.db.version(1).stores({ jobs: 'id,fnId,retries,timeout,priority' });
    this.concurrency = options.concurrency;
    // this.init().catch(e => { throw new Error(e) });
  }

  async init() {
    const savedJobs = await this.db.table<Job>('jobs').toArray();
    this.queue = savedJobs;
    this.run().catch(e => { throw new Error(e) });
  }

  private async run() {
    if (this.running || this.queue.length === 0) return;

    this.running = true;
    const runningJobs = this.queue.splice(0, this.concurrency);
    await Promise.all(runningJobs.map(job => this.processJob(job).catch(e => { throw new Error(e) })));
    this.running = false;

    if (this.queue.length > 0) {
      this.run().catch(e => { throw new Error(e) });
    }
  }

  private async processJob(job: Job) {
    try {
      const fn = this.workers.get(job.fnId);
      if (!fn) throw new Error("Function not found for job: " + job.fnId);
      const jobResult: JobResult = await fn(job.jobData); // Pass jobData to function
      if (jobResult.progress !== undefined && this.onProgressCallback) {
        this.onProgressCallback(jobResult.progress);
      }
      if (this.onJobCompleteCallback) {
        this.onJobCompleteCallback(job, jobResult);
      }
    } catch (error: any) {
      console.error('Job failed:', error);
      if (job.retries > 0) {
        job.retries--;
        this.queue.push(job);
        this.run().catch(e => { throw new Error(e) });
      } else if (this.onJobFailureCallback) {
        this.onJobFailureCallback(job, error);
      }
    } finally {
      await this.db.table('jobs').delete(job.id);
    }
  }

  addWorker(fnId: string, fn: (jobData?: any) => Promise<JobResult>) {
    this.workers.set(fnId, fn);
  }

  addJob(fnId: string, jobData: JobData, options: JobOptions = {}): Job {
    const id = options.id || Date.now().toString();
    const job: Job = {
      id,
      fnId,
      jobData,
      retries: options.retries || 0,
      timeout: options.timeout || 0,
      priority: options.priority || 0
    };

    this.db.table('jobs').put(job);
    this.queue.push(job);
    this.run().catch(e => { throw new Error(e) });
    return job;
  }

  pause() {
    this.running = false;
  }

  resume() {
    if (!this.running) {
      this.running = true;
      this.run().catch(e => { throw new Error(e) });
    }
  }

  obliterate() {
    this.queue = [];
    this.db.table('jobs').clear();
  }

  private onDrainedCallback?: () => void;
  private onJobCompleteCallback?: (job: Job, result: JobResult) => void;
  private onJobFailureCallback?: (job: Job, error: JobError) => void;
  private onProgressCallback?: (progress: any) => void;

  onDrained(callback: () => void) {
    this.onDrainedCallback = callback;
  }

  onJobComplete(callback: (job: Job, result: JobResult) => void) {
    this.onJobCompleteCallback = callback;
  }

  onJobFailure(callback: (job: Job, error: JobError) => void) {
    this.onJobFailureCallback = callback;
  }

  onProgress(callback: (progress: any) => void) {
    this.onProgressCallback = callback;
  }
}

export default DexieQueue;
