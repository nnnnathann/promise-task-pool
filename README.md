Task Pool
======

Sit by the pool and relax knowing that your tasks won't go over the limit!

```
pnpm i -S promise-task-pool
```

```ts
// API
export interface QueueOptions {
    concurrency: number;
}
export interface EnqueueResult<T> {
    id: number;
    promise: Promise<T>;
}
export declare class TaskPool {
    constructor(options: QueueOptions);
    enqueue<T>(task: () => Promise<T>): EnqueueResult<T>;
    dequeue(id: number): void;
    update(): void;
    inProgressCount(): number;
}
```

```ts
test("queue some tasks to spell nice", async () => {
  let output = "";
  // only 2 at a time
  const queue = new TaskPool({ concurrency: 2 });
  const resultA = queue.enqueue(delayedTask(10)("n"));
  const resultB = queue.enqueue(delayedTask(120)("e"));
  const resultC = queue.enqueue(delayedTask(20)("i"));
  const resultD = queue.enqueue(delayedTask(80)("c"));
  const outputappend = (value: string) => (output += value);
  resultA.promise.then(outputappend);
  resultB.promise.then(outputappend);
  resultC.promise.then(outputappend);
  resultD.promise.then(outputappend);
  expect(await resultA.promise).toEqual("n");
  expect(await resultB.promise).toEqual("e");
  expect(await resultC.promise).toEqual("i");
  expect(await resultD.promise).toEqual("c");
  expect(output).toEqual("nice");
});

```