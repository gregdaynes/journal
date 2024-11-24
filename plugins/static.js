import Path from 'node:path'
import fp from 'fastify-plugin'
import fastifyStatic from '@fastify/static'

export default fp(async function (fastify, opts) {
  // prevent logging with assets
  fastify.addHook('onRoute', function (opts) {
    if (opts.path === '/assets/*') {
      opts.logLevel = 'silent'
    }
  })

  fastify.register(fastifyStatic, {
    root: Path.join(import.meta.dirname, '..', 'public'),
    prefix: '/assets/',
  })
})
