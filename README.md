# Node.js Web framework benchmark

There are many popular HTTP frameworks for Node.js today. And I used all of them for building composable HTTP server application, with their pre-built plugins.

They have their own claims about perf. But it a bit noisy because of variety of configurations and alternative runtime options like Deno and Bun.

Since my primary runtime at work is Node.js. I was wondering if it really makes a difference when I have real middleware and IO-bound tasks rather than just JSON echo-ing in a zero configuration.

Here are frameworks I tested:

- [Express](https://expressjs.com/) v5
- [Fastify](https://fastify.dev/) v5
- [Hono](https://hono.dev/) w/ Node.js adapter
- [Elysia](https://elysiajs.com/) w/ Node.js adapter

And middlewares/plugins configuration:

- Basic CORS headers
- Validation for query, request and response body
- Simulated IO job ([common/auth.js](src/common/auth.js))

Benchmark use frameworks' official plugins, but for validation all tests use the same schema with [TypeBox](https://github.com/sinclairzx81/typebox). ([common/schema.js](src/common/schema.js))

Fastify uses the built-in [ajv](https://ajv.js.org/) compiler internally, others use TypeBox compiler.

## Impressions

I intentionally don't share the stats here. I strongly recommend to set your own benchmark suite.

But just leave a few impressions for the record.

In the recent versions of Node.js, they are much different. Most bottlenecks come from user code and misconfigurations, not from the web framework itself.

Additional adapter for Node.js are not as slow as I expected, in fact Elysia is actually faster on Node.js too.

However, as the number of concurrent requests increases, Fastify still seems to have the advantage in reilability.

I definitely don't prefer Express at all. I would prefer a framework that has a more convenient configuration and a high-quality implementation ecosystem like Fastify.

As you choose "micro" framework, blame your own configuration, not framework.
