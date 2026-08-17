/**
 * Manages the execution of asynchronous tasks with a specified maximum concurrency limit.
 * Tasks are executed in the order they are added (FIFO).
 * Task promise rejections are silently ignored to allow subsequent tasks to run.
 */
export class AsyncTaskQueue {
  private concurrency: number;
  private queueList: Array<() => Promise<any>> = [];
  private activeCount: number = 0;

  constructor(concurrency: number) {
    if (typeof concurrency !== 'number' || concurrency <= 0 || isNaN(concurrency)) {
      throw new Error('Concurrency limit must be a positive number');
    }
    this.concurrency = concurrency;
  }

  /**
   * Adds an asynchronous task to the queue.
   * @param task A function that returns a Promise.
   */
  queue(task: () => Promise<any>): void {
    if (typeof task !== 'function') {
      throw new Error('Task must be a function returning a Promise');
    }
    this.queueList.push(task);
    this.next();
  }

  /**
   * Processes the next task in the queue if concurrency limit has not been reached.
   */
  private next(): void {
    if (this.activeCount >= this.concurrency || this.queueList.length === 0) {
      return;
    }

    const task = this.queueList.shift();
    if (!task) return;

    this.activeCount++;

    // Ensure the task executes inside a try/catch or promise block
    // to guarantee activeCount is properly decremented even if task throws synchronously.
    Promise.resolve()
      .then(() => task())
      .then((val) => {
        if (val !== undefined) {
          console.log(val);
        }
      })
      .catch((err) => {
        // Silently ignore rejections as per requirement, but log the text if present
        if (err !== undefined) {
          console.log(err instanceof Error ? err.message : err);
        }
      })
      .finally(() => {
        this.activeCount--;
        this.next();
      });

    // Try starting other tasks if concurrency capacity is still available
    this.next();
  }
}
