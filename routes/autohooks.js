export default function (fastify, opts) {
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
