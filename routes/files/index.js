export default function (fastify, opts) {
  fastify.get('/:idPage/:idBlock', async (request, reply) => {
    const { idPage, idBlock } = request.params

    const [block] = await request.database('page_blocks')
      .where({
        idPage,
        'page_blocks.deleted': null,
        'page_blocks.idBlock': idBlock
      })
      .leftJoin('blocks', 'page_blocks.idBlock', 'blocks.idBlock')
      .limit(1)
      .then(blocks => request.transformRecordsWithJSON(blocks))
      .catch(err => {
        request.log.error(err, 'Error reading block from db')
        return []
      })

    const buffer = Buffer.from(block.payload, 'base64')

    reply.headers({ 'content-type': block.metadata.mimetype })
    return reply.send(buffer)
  })
}
