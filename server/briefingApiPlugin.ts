import type { Plugin, PreviewServer, ViteDevServer } from 'vite';
import {
  getBriefingByDate,
  getLatestBriefing,
  listBriefings,
} from './briefingStore';
import { saveBriefing, saveBriefingFromText } from './saveBriefing';
import { startAutoSync, stopAutoSync } from './autoSync';
import { syncBriefing } from './sync/syncBriefing';

type Env = Record<string, string>;

async function readJsonBody(req: import('http').IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve());
    req.on('error', reject);
  });
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString()) as unknown;
}

function attachBriefingApi(
  middlewares: ViteDevServer['middlewares'] | PreviewServer['middlewares'],
  env: Env,
) {
  middlewares.use(async (req, res, next) => {
    if (!req.url?.startsWith('/api/briefings')) {
      next();
      return;
    }

    try {
      const url = new URL(req.url, 'http://localhost');
      let response: Response | null = null;

      if (url.pathname === '/api/briefings/sync' && req.method === 'POST') {
        const body = (await readJsonBody(req)) as { force?: boolean; date?: string };
        const result = await syncBriefing(env, {
          force: body.force === true,
          date: typeof body.date === 'string' ? body.date : undefined,
        });
        response = Response.json({ ok: true, ...result });
      } else if (url.pathname === '/api/briefings/import' && req.method === 'POST') {
        const body = (await readJsonBody(req)) as {
          raw?: string;
          briefing?: unknown;
          force?: boolean;
        };
        const force = body.force === true;

        let saved;
        if (typeof body.raw === 'string' && body.raw.trim()) {
          saved = saveBriefingFromText(body.raw, force);
        } else if (body.briefing) {
          saved = saveBriefing(body.briefing, force);
        } else {
          response = Response.json({ error: 'raw 또는 briefing 필드가 필요합니다.' }, { status: 400 });
        }

        if (!response && saved) {
          response = Response.json({ ok: true, briefing: saved });
        }
      } else if (url.pathname === '/api/briefings' && req.method === 'GET') {
        response = Response.json(listBriefings());
      } else if (url.pathname === '/api/briefings/latest' && req.method === 'GET') {
        const briefing = getLatestBriefing();
        response = briefing
          ? Response.json(briefing)
          : Response.json({ error: '저장된 브리핑이 없습니다.' }, { status: 404 });
      } else {
        const dateMatch = url.pathname.match(/^\/api\/briefings\/(\d{4}-\d{2}-\d{2})$/);
        if (dateMatch && req.method === 'GET') {
          const briefing = getBriefingByDate(dateMatch[1]);
          response = briefing
            ? Response.json(briefing)
            : Response.json({ error: '해당 날짜의 브리핑이 없습니다.' }, { status: 404 });
        }
      }

      if (!response) {
        next();
        return;
      }

      const body = await response.text();
      res.statusCode = response.status;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(body);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.statusCode = error instanceof SyntaxError ? 400 : 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: message }));
    }
  });
}

export function briefingApiPlugin(env: Env): Plugin {
  return {
    name: 'briefing-api',
    configureServer(server) {
      attachBriefingApi(server.middlewares, env);
      startAutoSync(env);
    },
    configurePreviewServer(server) {
      attachBriefingApi(server.middlewares, env);
      startAutoSync(env);
    },
    buildEnd() {
      stopAutoSync();
    },
  };
}
