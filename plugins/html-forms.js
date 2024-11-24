import fp from 'fastify-plugin'
import formBody from '@fastify/formbody'
import multipart from '@fastify/multipart'

export default fp(async (fastify, opts) => {
  fastify.register(formBody, Object.assign(opts, {}))
  fastify.register(multipart, Object.assign(opts, {}))
})
