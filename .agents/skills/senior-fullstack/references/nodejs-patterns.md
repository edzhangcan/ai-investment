# Production Node.js Server Architecture Patterns

Production-grade backend guidelines for building resilient Node.js services.

## 🟢 1. Non-Blocking I/O & Streams

### Stream Pipeline Handling
Always use `stream.pipeline` or `pipeline` from `node:stream/promises` for file uploads or processing large data payloads to prevent memory exhaustion:

```typescript
import { pipeline } from "node:stream/promises";
import { createReadStream, createWriteStream } from "node:file";
import { createGzip } from "node:zlib";

async function compressFile(source: string, destination: string) {
  await pipeline(
    createReadStream(source),
    createGzip(),
    createWriteStream(destination)
  );
}
```

---

## 🛡️ 2. Production Graceful Shutdown & Environment Validation

### Graceful Signal Trapping (`SIGTERM` / `SIGINT`)
```typescript
import http from "node:http";

const server = http.createServer(app);

function shutdown(signal: string) {
  console.log(`Received ${signal}. Closing server gracefully...`);
  server.close(err => {
    if (err) {
      console.error("Error during server shutdown:", err);
      process.exit(1);
    }
    // Close database connection pools, Redis clients, etc.
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
```

### Environment Variable Schema Validation (Zod)
```typescript
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
```
