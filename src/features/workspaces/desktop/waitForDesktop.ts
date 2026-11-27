// Mientras nginx/KasmVNC arrancan, el proxy responde con estos códigos.
const NOT_READY = new Set([502, 503, 504]);

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true }
    );
  });

/** Espera a que el proxy deje de devolver 502/503/504 para el escritorio. */
export async function waitForDesktop(
  workspaceId: string,
  {
    signal,
    timeoutMs = 60_000,
    intervalMs = 1_500,
  }: {
    signal?: AbortSignal;
    timeoutMs?: number;
    intervalMs?: number;
  } = {}
) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    try {
      const response = await fetch(`/workspace/${workspaceId}/`, { cache: 'no-store', signal });
      if (!NOT_READY.has(response.status)) return;
    } catch (reason) {
      if (signal?.aborted) throw reason;
    }
    if (Date.now() >= deadline) {
      throw new Error('El escritorio no respondió a tiempo. Intenta de nuevo en unos segundos.');
    }
    await sleep(intervalMs, signal);
  }
}
