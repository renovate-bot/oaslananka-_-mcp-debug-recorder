import {
  createServer,
  type IncomingMessage,
  type Server as HttpServer,
  type ServerResponse
} from 'node:http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { log } from './logging.js';
import {
  closeRuntime,
  createDebugRecorderServer,
  createRuntime,
  type DebugRecorderRuntime
} from './mcp.js';
import { getVersion } from './version.js';

const port = Number(process.env.PORT ?? 3000);

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Uint8Array[] = [];

  for await (const chunk of request as AsyncIterable<Buffer | string>) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }

  if (chunks.length === 0) {
    return undefined;
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
}

function writeJson(
  response: ServerResponse,
  statusCode: number,
  payload: unknown
): void {
  response.statusCode = statusCode;
  response.setHeader('content-type', 'application/json');
  response.end(JSON.stringify(payload));
}

function closeHttpServer(server: HttpServer): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!server.listening) {
      resolve();
      return;
    }

    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

export async function startHttpServer(
  runtime?: DebugRecorderRuntime
): Promise<void> {
  const ownedRuntime = runtime ?? createRuntime();
  const mcpServer = createDebugRecorderServer(ownedRuntime);
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined
  });
  let shuttingDown = false;

  await mcpServer.connect(transport);

  const server = createServer((request, response) => {
    void (async () => {
      const url = new URL(
        request.url ?? '/',
        `http://${request.headers.host ?? 'localhost'}`
      );

      if (url.pathname === '/health') {
        writeJson(response, 200, { ok: true });
        return;
      }

      if (url.pathname === '/version') {
        writeJson(response, 200, {
          name: 'mcp-debug-recorder',
          version: getVersion()
        });
        return;
      }

      if (url.pathname !== '/mcp') {
        writeJson(response, 404, { error: 'Not found' });
        return;
      }

      try {
        const parsedBody =
          request.method === 'POST' ? await readJsonBody(request) : undefined;
        await transport.handleRequest(request, response, parsedBody);
      } catch (error) {
        log('error', 'HTTP transport request failed', {
          method: request.method,
          path: url.pathname,
          error: error instanceof Error ? error.message : String(error)
        });

        if (!response.headersSent) {
          writeJson(response, 500, { error: 'Internal server error' });
        }
      }
    })();
  });

  const shutdown = (reason: string, exitCode: number): void => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;

    void (async () => {
      log('info', 'Shutting down HTTP server', {
        reason,
        port
      });

      try {
        await closeHttpServer(server);
      } catch (error) {
        log('error', 'Failed to close HTTP server cleanly', {
          error: error instanceof Error ? error.message : String(error)
        });
      }

      try {
        closeRuntime(ownedRuntime);
      } finally {
        process.exit(exitCode);
      }
    })();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM', 0));
  process.on('SIGINT', () => shutdown('SIGINT', 0));
  process.on('uncaughtException', (error) => {
    log('error', 'Uncaught exception', {
      error: error instanceof Error ? error.message : String(error)
    });
    shutdown('uncaughtException', 1);
  });
  process.on('unhandledRejection', (reason) => {
    log('error', 'Unhandled rejection', {
      reason: reason instanceof Error ? reason.message : String(reason)
    });
    shutdown('unhandledRejection', 1);
  });

  try {
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(port, () => resolve());
    });
  } catch (error) {
    closeRuntime(ownedRuntime);
    throw error;
  }

  log('info', 'mcp-debug-recorder HTTP server started', { port });
}

if (process.argv[1]?.endsWith('server-http.js')) {
  startHttpServer().catch((error: unknown) => {
    log('error', 'Failed to start HTTP server', {
      error: error instanceof Error ? error.message : String(error)
    });
    process.exitCode = 1;
  });
}
