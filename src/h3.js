import {
  createH3,
  defineEventHandler,
  getCookie,
  getQuery,
  getRouterParam,
  handleCors,
  readBody,
  serve,
} from "h3";
import { Value } from "@sinclair/typebox/value";

import { onAuth } from "./common/auth.js";
import {
  QuerySchema,
  RequestBodySchema,
  ResponseBodySchema,
} from "./common/schema.js";

const app = createH3();

app.use(
  defineEventHandler(async (event) => {
    const corsRes = handleCors(event, {});
    if (corsRes) return corsRes;

    const auth = await onAuth(() => getCookie(event, "cookie"));
    event.context.auth = auth;
  }),
);

app.post(
  "/users/:userId",
  defineEventHandler(async (event) => {
    const rawQuery = getQuery(event);
    const rawBody = await readBody(event);
    const query = Value.Parse(QuerySchema, rawQuery);
    const body = Value.Parse(RequestBodySchema, rawBody);

    const userId = parseInt(getRouterParam(event, "userId"));
    const auth = event.context.auth;
    const { foo, bar, baz } = query;
    const response = {
      path: event.path,
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
    return Value.Parse(ResponseBodySchema, response);
  }),
);

serve(app, {
  port: parseInt(process.env.PORT || "3000"),
});
