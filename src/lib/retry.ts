// Retries a call a couple of times so a brief network hiccup doesn't blank the page.
export async function withRetry<T>(fn: () => Promise<T>, tries = 3): Promise<T> {
  let last: unknown;
  for (let i = 0; i < tries; i++) {
    try { return await fn(); } catch (e) {
      if (e != null && typeof e === "object" && ("isNotFound" in e || "isRedirect" in e)) throw e;
      last = e;
      await new Promise((r) => setTimeout(r, 400 * (i + 1)));
    }
  }
  throw last;
}
