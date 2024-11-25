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

    let output
    if (block.metadata.type === 'image') {
      output = Buffer.from(block.payload, 'base64')
    }

    if (block.metadata.type === 'link') {
      output = JSON.parse(block.payload).page
      output = output.replace('</head>', `<style>:root{color-scheme:dark light}</style></head>`)
    }

    reply.headers({ 'content-type': block.metadata.mimetype })
    return reply.send(output)
  })
}
