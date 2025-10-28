export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public ctx?: unknown,
  ) {
    super(message)
    this.name = "AppError"
  }
}

export const logError = (e: unknown, code = "unknown", ctx?: unknown) => {
  console.error(`[${code}]`, e, ctx)
  return new AppError(code, e instanceof Error ? e.message : String(e), ctx)
}

