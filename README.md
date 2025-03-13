# Node.js HTTP Framework Benchmark

There are many popular HTTP frameworks for Node.js today, and I’ve used all of them to build composable HTTP server applications with their pre-built plugins.

Each framework makes its own performance claims, but these can be noisy due to various configurations and alternative runtime options like Deno and Bun.

Since my primary runtime at work is Node.js, I wanted to see if performance differences truly matter in real-world scenarios—where middleware and I/O-bound tasks are involved—rather than just benchmarking simple JSON echo responses in a zero-configuration setup.

Frameworks:

- [Express](https://expressjs.com/) v5
- [Fastify](https://fastify.dev/) v5
- [Hono](https://hono.dev/) w/ Node.js adapter
- [Elysia](https://elysiajs.com/) w/ Node.js adapter

Middleware & plugin configuration:

- Basic CORS headers
- Validation for query, request and response body
- Simulated IO job ([common/auth.js](src/common/auth.js))

The benchmarks use each framework’s official plugins, but for validation, all tests follow the same [TypeBox](https://github.com/sinclairzx81/typebox) schema ([common/schema.js](src/common/schema.js)).

Fastify reiles on its built-in [ajv](https://ajv.js.org/) compiler, while others use TypeBox's compiler.

## Impressions

I’m not sharing the specific benchmark stats here because I strongly recommend setting up your own benchmarking suite.

However, here are a few key takeaways:

- With recent versions of Node.js, the differences between these frameworks are not as significant as one might expect. The biggest bottlenecks often come from user code and misconfigurations rather than the framework itself.
- Additional adapters for Node.js are not as slow as I initially thought. In fact, Elysia performs quite well on Node.js.
- As concurrency increases, Fastify still seems to have an edge in reliability.
- I don't prefer Express anywhere. I prefer frameworks with better configuration options and a high-quality ecosystem, like Fastify.
- If you opt for a "micro" framework, don’t blame the framework for performance —blame yours.

## LICENSE

MIT
