export default function (fastify, opts) {
  fastify.addHook('onRequest', async (request, reply) => {
    request.resource = 'Blocks'
    request.generateId = fastify.generateId

    const log = fastify.log.child({ name: request.resource })
    request.log = log
    reply.log = log
  })
}
