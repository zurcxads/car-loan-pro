type ServerErrorContext = {
  action: string;
  metadata?: Record<string, unknown>;
  route: string;
};

type ServerLogMetadata = Record<string, unknown>;

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

function writeServerLog(level: 'error' | 'warn', message: string, metadata?: ServerLogMetadata) {
  const payload = {
    level,
    message,
    metadata,
    timestamp: new Date().toISOString(),
  };

  try {
    process.stderr.write(`[server-${level}] ${JSON.stringify(payload)}\n`);
  } catch {
    // Avoid surfacing logging failures to clients.
  }
}

export const serverLogger = {
  error(message: string, metadata?: ServerLogMetadata) {
    writeServerLog('error', message, metadata);
  },
  warn(message: string, metadata?: ServerLogMetadata) {
    writeServerLog('warn', message, metadata);
  },
};

export function logServerError(error: unknown, context: ServerErrorContext) {
  serverLogger.error('Server route error', {
    context,
    error: serializeError(error),
  });
}
