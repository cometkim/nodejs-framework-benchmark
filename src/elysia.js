import { Elysia } from 'elysia';
import { node } from '@elysiajs/node';
import { cors } from '@elysiajs/cors';
import { cookie } from '@elysiajs/cookie';
import { logger } from '@bogeychan/elysia-logger';

import { onAuth } from './common/auth.js';
import { QuerySchema, RequestBodySchema, ResponseBodySchema } from './common/schema.js';

new Elysia({
  adapter: typeof Bun === 'undefined'
    ? node()
    : undefined,
})
  .use(logger({ enabled: process.env.DEBUG === 'true' }))
  .use(cors())
  .use(cookie())
  .derive(async ({ cookie }) => {
    const auth = await onAuth(() => cookie.cookie.value);
    return { auth };
  })
  .post('/users/:userId', ({ path, params, query, body, auth }) => {
    const response = {
      path,
      userId: parseInt(params.userId),
      auth,
      foo: query.foo,
      bar: query.bar,
      baz: query.baz,
      params: {
        a: body.nested.a,
        b: body.b.filter(Boolean),
        c: body.c,
      },
    };
    return response;
  }, {
    query: QuerySchema,
    body: RequestBodySchema,
    response: ResponseBodySchema,
  })
  .listen(parseInt(process.env.PORT) || 3000)
