import express from 'express';
import cors from 'cors';
import logger from 'pino-http';
import cookieParser from 'cookie-parser';
import { Value } from '@sinclair/typebox/value';
import { validateRequest } from 'typebox-express-middleware';

import { onAuth } from './common/auth.js';
import { QuerySchema, RequestBodySchema, ResponseBodySchema } from './common/schema.js';

const app = express();

if (process.env.DEBUG === 'true') {
  app.use(logger());
}

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(async (req, _res, next) => {
  const auth = await onAuth(() => req.cookies.cookie);
  req.auth = auth;
  next();
});

app.post(
  '/users/:userId',
  validateRequest({
    query: QuerySchema,
    body: RequestBodySchema,
  }),
  async (req, res) => {
    const response = {
      path: req.url,
      userId: parseInt(req.params.userId),
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
    res.json(
      Value.Parse(ResponseBodySchema, response),
    );
  },
);

app.listen(parseInt(process.env.PORT) || 3000);
