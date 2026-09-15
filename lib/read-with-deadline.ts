/** Bound a read before using a fallback. This does not cancel the underlying
 * operation, so the database connection has its own timeout as well. */
export async function readWithDeadline<T>(read: PromiseLike<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.resolve(read),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("Read deadline exceeded")), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
