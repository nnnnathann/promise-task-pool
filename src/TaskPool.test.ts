import { test, expect } from "vitest";
import { TaskPool } from "./TaskPool.js";

test("queue new task", async () => {
  const queue = new TaskPool({ concurrency: 1 });
  const result = queue.enqueue(() => Promise.resolve("a"));
  expect(result.id).toEqual(0);
  expect(await result.promise).toEqual("a");
});

test("queue 2 tasks", async () => {
  let output = "";
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

const delayedTask =
  (ms: number) =>
  <T>(value: T) =>
  () =>
    new Promise<T>((resolve) => setTimeout(() => resolve(value), ms));
