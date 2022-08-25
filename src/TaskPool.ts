/**
 * TaskPool
 *
 * allows concurency limited tasks to be executed in parallel
 *
 * example usage in TaskQueue.test.ts
 *
 */
export class TaskPool {
  options: QueueOptions;
  sequenceNumber = 0;
  tasks: Record<string, QueueTask<unknown>> = {};
  constructor(options: QueueOptions) {
    this.options = options;
  }
  enqueue<T>(
    task: () => Promise<T>,
    abort?: AbortController
  ): EnqueueResult<T> {
    const id = this.sequenceNumber++;
    return {
      id,
      promise: new Promise((resolve, reject) => {
        this.tasks[id] = {
          inProgress: false,
          f: task,
          abort: abort ?? new AbortController(),
          resolve: (value) => {
            resolve(value as T);
            this.dequeue(id);
          },
        };
        this.tasks[id].abort.signal.addEventListener("abort", () => {
          reject("dequeued");
        });
        this.update();
      }),
    };
  }
  dequeue(id: number): void {
    if (!this.tasks[String(id)]) {
      return;
    }
    this.tasks[String(id)].abort.abort();
    delete this.tasks[String(id)];
    this.update();
  }
  update(): void {
    if (this.inProgressCount() < this.options.concurrency) {
      const id = this.firstQueued();
      if (id) {
        const task = this.tasks[id];
        this.tasks[id].inProgress = true;
        task.f().then(task.resolve);
      }
    }
  }
  inProgressCount(): number {
    return Object.values(this.tasks).filter(isInProgress).length;
  }
  firstQueued(): string | undefined {
    return Object.entries(this.tasks)
      .filter(([, task]) => !isInProgress(task))
      .map(([id]) => String(id))[0];
  }
}

export interface QueueTask<T> {
  f: () => Promise<T>;
  abort: AbortController;
  resolve: (value: T) => void;
  inProgress: boolean;
}
export interface QueueOptions {
  concurrency: number;
}
export interface EnqueueResult<T> {
  id: number;
  promise: Promise<T>;
}

const isInProgress = (task: QueueTask<unknown>) => task.inProgress;
