import {
  createH3,
  defineEventHandler,
  getCookie,
  getQuery,
  getRouterParam,
  handleCors,
  readBody,
  serve,
} from 'h3';
import { Value } from '@sinclair/typebox/value';

import { onAuth } from './common/auth.js';
import { QuerySchema, RequestBodySchema, ResponseBodySchema } from './common/schema.js';

const h3 = createH3();

h3.use(
  defineEventHandler(async (event) => {
    const corsRes = handleCors(event, {});
    if (corsRes) return corsRes;
  }),
);

h3.use(
  defineEventHandler(async (event) => {
    const auth = await onAuth(() => getCookie(event, 'cookie'));
    event.context.auth = auth;
  }),
);

h3.post(
  '/users/:userId',
  defineEventHandler(async (event) => {
    const rawQuery = getQuery(event);
    const query = Value.Parse(QuerySchema, rawQuery);

    const rawBody = await readBody(event);
    const body = Value.Parse(RequestBodySchema, rawBody);

    const response = {
      path: event.path,
      userId: parseInt(getRouterParam(event, 'userId')),
      auth: event.context.auth,
      foo: query.foo,
      bar: query.bar,
      baz: query.baz,
      params: {
        a: body.nested.a,
        b: body.b.filter(Boolean),
        c: body.c,
      },
    };

    return Value.Parse(ResponseBodySchema, response);
  }),
);

serve(h3, {
  port: parseInt(process.env.PORT || '3000'),
});
