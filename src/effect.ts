import { createServer } from 'node:http';
import {
  HttpApi,
  HttpApiGroup,
  HttpApiBuilder,
  HttpApiEndpoint,
  HttpApiSchema,
  HttpServerRequest,
  HttpApiMiddleware,
  HttpMiddleware,
  HttpServer,
} from '@effect/platform';
import { NodeHttpServer, NodeRuntime } from '@effect/platform-node';
import { Effect, Schema, Layer, Context } from 'effect';

import { onAuth } from './common/auth.js';

const QuerySchema = Schema.Struct({
  foo: Schema.String,
  bar: Schema.String,
  baz: Schema.optional(Schema.String),
});

const RequestBodySchema = Schema.Struct({
  nested: Schema.Struct({
    a: Schema.String,
  }),
  b: Schema.Array(Schema.NullOr(Schema.Boolean)),
  c: Schema.optional(Schema.Number),
});

const ResponseBodySchema = Schema.Struct({
  userId: Schema.Number,
  path: Schema.String,
  auth: Schema.String,
  foo: Schema.String,
  bar: Schema.String,
  baz: Schema.optional(Schema.String),
  params: Schema.Struct({
    a: Schema.String,
    b: Schema.Array(Schema.Boolean),
    c: Schema.optional(Schema.Number),
  }),
});

class AuthContext extends Context.Tag('Auth')<AuthContext, string>() { }

class Authorization extends HttpApiMiddleware.Tag<Authorization>()(
  'Authorization',
  {
    provides: AuthContext,
  },
) { };

const userIdParam = HttpApiSchema.param('userId', Schema.NumberFromString);

const api = HttpApi.make('api')
  .add(
    HttpApiGroup.make('service')
      .add(
        HttpApiEndpoint.post('post')`/users/${userIdParam}`
          .setUrlParams(QuerySchema)
          .setPayload(RequestBodySchema)
          .addSuccess(ResponseBodySchema)
      )
      .middleware(Authorization),
  );

const authorizationLive = Layer.effect(
  Authorization,
  Effect.gen(function*() {
    return Effect.gen(function*() {
      const req = yield* HttpServerRequest.HttpServerRequest;
      const auth = yield* Effect.promise(() => onAuth(() => req.cookies.cookie));
      return auth;
    });
  }),
);

const serviceLive = HttpApiBuilder.group(api, 'service', handlers =>
  handlers.handle('post', ({ path, urlParams, payload }) =>
    Effect.gen(function*() {
      const req = yield* HttpServerRequest.HttpServerRequest;
      const auth = yield* AuthContext;
      return {
        userId: path.userId,
        path: req.url,
        auth,
        foo: urlParams.foo,
        bar: urlParams.bar,
        baz: urlParams.baz,
        params: {
          a: payload.nested.a,
          b: payload.b.filter((x): x is NonNullable<typeof x> => Boolean(x)),
          c: payload.c,
        },
      };
    }),
  )
);

const httpServerLive = NodeHttpServer.layer(createServer, {
  port: parseInt(process.env.PORT!) || 3000,
}).pipe(
  HttpServer.withLogAddress,
);

HttpApiBuilder.serve(
  process.env.DEBUG === 'true'
    ? HttpMiddleware.logger
    : undefined
).pipe(
  Layer.provide(HttpApiBuilder.middlewareCors()),
  Layer.provide(HttpApiBuilder.api(api)),
  Layer.provide(serviceLive),
  Layer.provide(authorizationLive),
  Layer.provide(httpServerLive),
  Layer.launch,
  NodeRuntime.runMain,
);
