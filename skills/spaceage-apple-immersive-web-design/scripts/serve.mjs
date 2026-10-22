#!/usr/bin/env node
/**
 * serve.mjs — zero-dependency static server for lab/.
 *
 *   node scripts/serve.mjs [port]      # default 4173
 *
 * ES module lab pages need a real origin (file:// blocks module imports), so
 * every script here serves rather than reading HTML off disk.
 */
import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, join, normalize, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'lab');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.md': 'text/markdown; charset=utf-8',
};

export function startServer(port = 4173) {
  const server = createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    let path = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
    if (path === '/' || path.endsWith('/')) path += 'index.html';
    const file = join(ROOT, path);

    if (!file.startsWith(ROOT)) {
      res.writeHead(403).end('forbidden');
      return;
    }
    try {
      const stat = statSync(file);
      if (!stat.isFile()) throw new Error('not a file');
      res.writeHead(200, {
        'content-type': TYPES[extname(file)] || 'application/octet-stream',
        'cache-control': 'no-store',
      });
      createReadStream(file).pipe(res);
    } catch {
      res.writeHead(404, { 'content-type': 'text/plain' }).end(`404 ${path}`);
    }
  });

  return new Promise((res) => server.listen(port, () => res({ server, port })));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.argv[2]) || 4173;
  await startServer(port);
  console.log(`lab served at http://localhost:${port}/  (ctrl-c to stop)`);
}
