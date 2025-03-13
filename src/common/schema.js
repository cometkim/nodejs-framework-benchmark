import { Type as T } from '@sinclair/typebox';

const Nullable = type => T.Union([type, T.Null()]);

export const QuerySchema = T.Object({
  foo: T.String(),
  bar: T.String(),
  baz: T.Optional(T.String()),
});

export const RequestBodySchema = T.Object({
  nested: T.Object({
    a: T.String(),
  }),
  b: T.Array(Nullable(T.Boolean())),
  c: T.Optional(T.Number()),
});

export const ResponseBodySchema = T.Object({
  userId: T.Number(),
  path: T.String(),
  auth: T.String(),
  foo: T.String(),
  bar: T.String(),
  baz: T.Optional(T.String()),
  params: T.Object({
    a: T.String(),
    b: T.Array(T.Boolean()),
    c: T.Optional(T.Number()),
  }),
});
