// test/helpers/fake-step.ts
export function createFakeStep() {
  const memo = new Map<string, unknown>();
  return {
    run: async <T>(id: string, fn: () => Promise<T>): Promise<T> => {
      if (memo.has(id)) return memo.get(id) as T; // sudah sukses, pakai hasil lama
      const result = await fn(); // kalau melempar, tidak disimpan
      memo.set(id, result);
      return result;
    },
    sleepUntil: async () => {},
  };
}

// Meniru Inngest: kalau handler melempar error, jalankan ulang dengan memo yang sama
export async function runWithRetries(
  handler: (ctx: any) => Promise<unknown>,
  event: unknown,
  maxAttempts = 4
) {
  const step = createFakeStep();
  let lastError: unknown;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await handler({ event, step });
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
}
