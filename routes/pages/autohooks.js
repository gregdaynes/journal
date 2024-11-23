export default function (fastify, opts) {
  fastify.addHook('onRequest', async (request, reply) => {
    request.resource = 'Pages'
    request.database = fastify.database()
    request.generateId = fastify.generateId

    const log = fastify.log.child({ name: request.resource })
    request.log = log
    reply.log = log
  })

  fastify.addHook('onRequest', async (request, reply) => {
    request.transformRecordsWithJSON = (recordArray) => {
      for (const record of recordArray) {
        record.metadata = JSON.parse(record.metadata)
        record.payload = JSON.parse(record.payload)
      }

      return recordArray
    }
  })
}
