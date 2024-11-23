import serialize from 'serialize-javascript'

const routeUpdateSchema = {
  params: {
    $id: 'app:blocks:update:params',
    type: 'object',
    properties: {
      idBlock: {
        type: 'string',
        pattern: 'BLOCK_[0-7][0-9A-HJKMNP-TV-Z]{25}'
      },
    },
    required: ['idBlock']
  },
  body: {
    $id: 'app:blocks:update:body',
    type: 'object',
    properties: {
      idPage: {
        type: 'string',
        pattern: 'PAGE_[0-7][0-9A-HJKMNP-TV-Z]{25}'
      },
      type: {
        type: 'string',
        oneOf: [
          { enum: ['text', 'javascript'] }
        ]
      },
      data: {
        type: 'string'
      }
    },
    required: ['idPage', 'data', 'type']
  }
}

export default async function (fastify, opts) {
  /**
   * Update block
   */
  fastify.post('/:idBlock/update', {
    schema: routeUpdateSchema
  }, async function (request, reply) {
    const { idBlock } = request.params
    const { idPage, type, data } = request.body

    const [block] = await request.database('blocks').where({ idBlock, deleted: null })
      .then(blocks => request.transformRecordsWithJSON(blocks))
    if (!block) {
      throw new Error('Block not found')
    }

    // TODO we want to use a serializer for the data, then stick that in the payload, along with whatever else, but this is fine for now
    const metadata = JSON.stringify({
      type: type || block.metadata.type,
    })

    let payload
    if (type === 'text') {
      payload = JSON.stringify({ data })
    } else if (type === 'javascript') {
      payload = JSON.stringify({
        data: serialize(data)
      })
    }

    await request.database('blocks')
      .update({
        metadata,
        payload,
      })
      .where({ idBlock })

    return reply.redirect(`/pages/${idPage}`)
  })
}
