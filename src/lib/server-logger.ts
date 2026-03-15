type ServerErrorContext = {
  action: string;
  metadata?: Record<string, unknown>;
  route: string;
};

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
    };
  }

  return {
    message: typeof error === 'string' ? error : 'Unknown error',
    name: 'UnknownError',
  };
}

export function logServerError(error: unknown, context: ServerErrorContext) {
  const payload = {
    context,
    error: serializeError(error),
    level: 'error',
    timestamp: new Date().toISOString(),
  };

  try {
    process.stderr.write(`[server-error] ${JSON.stringify(payload)}\n`);
  } catch {
    // Avoid surfacing logging failures to clients.
  }
}
