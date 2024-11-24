export default function (fastify, opts) {
  fastify.addHook('onRequest', async (request, reply) => {
    request.transformRecordsWithJSON = (recordArray) => {
      for (const record of recordArray) {
        record.metadata = JSON.parse(record.metadata)

        if (record.metadata) {
          try {
            if (record.metadata.type !== 'image') {
              record.payload = eval(record.payload)
            }
          } catch (err) {
            console.log(record.metadata)
          }
        }
      }

      return recordArray
    }
  })
}
