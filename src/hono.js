import { serve } from '@hono/node-server';
import { tbValidator } from '@hono/typebox-validator';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { getCookie } from 'hono/cookie';
import { cors } from 'hono/cors';
import { Value } from '@sinclair/typebox/value';

import { onAuth } from './common/auth.js';
import { QuerySchema, RequestBodySchema, ResponseBodySchema } from './common/schema.js';

const hono = new Hono();

if (process.env.DEBUG === 'true') {
  hono.use(logger());
}

hono.use(
  cors(),
  async (c, next) => {
    const auth = await onAuth(() => getCookie(c, 'cookie'));
    c.set('auth', auth);
    await next();
  },
);

hono.post(
  '/users/:userId',
  tbValidator('query', QuerySchema),
  tbValidator('json', RequestBodySchema),
  async (c) => {
    const userId = parseInt(c.req.param('userId'));
    const auth = c.get('auth');
    const { foo, bar, baz } = c.req.query();
    const body = c.req.valid('json');
    const response = {
      path: c.req.path,
      userId,
      auth,
      foo,
      bar,
      baz,
      params: {
        a: body.nested.a,
        b: body.b.filter(Boolean),
        c: body.c,
      },
    };
    return c.json(
      Value.Parse(ResponseBodySchema, response),
    );
  },
);

if (typeof Bun === 'undefined') {
  serve({
    port: parseInt(process.env.PORT) || 3000,
    fetch: hono.fetch,
  });
}

export default hono;
