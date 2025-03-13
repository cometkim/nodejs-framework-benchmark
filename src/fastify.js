import Fastify from 'fastify';
import FastifyCookie from '@fastify/cookie';
import FastifyCors from '@fastify/cors';
// import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'

import { onAuth } from './common/auth.js';
import { QuerySchema, RequestBodySchema, ResponseBodySchema } from './common/schema.js';

const fastify = Fastify({
  logger: process.env.DEBUG === 'true',
})
// .withTypeProvider<TypeBoxTypeProvider>();

await fastify.register(FastifyCors, {});
await fastify.register(FastifyCookie, {});

fastify.route({
  method: 'POST',
  url: '/users/:userId',
  schema: {
    querystring: QuerySchema,
    body: RequestBodySchema,
    response: {
      200: ResponseBodySchema,
    },
  },
  async preHandler(req) {
    req.auth = await onAuth(() => req.cookies.cookie);
  },
  async handler(req, reply) {
    const response = {
      userId: parseInt(req.params.userId),
      path: req.url, // is already parsed
      auth: req.auth,
      foo: req.query.foo,
      bar: req.query.bar,
      baz: req.query.baz,
      params: {
        a: req.body.nested.a,
        b: req.body.b.filter(Boolean),
        c: req.body.c,
      },
    };
    reply.send(response);
  },
});

await fastify.listen({
  port: parseInt(process.env.PORT) || 3000,
});
