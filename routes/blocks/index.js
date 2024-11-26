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
          { enum: ['text', 'javascript', 'link'] }
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

    const metadata = JSON.stringify({
      type: type || block.metadata.type,
    })

    let payload
    if (type === 'link') {
      try {
        const response = await fetch(new URL(data), {
          method: 'GET'
        })

        let chunks = []
        for await (const chunk of response.body) {
          chunks.push(Buffer.from(chunk));
        }

        payload = {
          url: data,
          page: Buffer.concat(chunks).toString("utf-8"),
        }
      } catch (err) {
        payload = {
          url: data
        }
      } finally {
        payload = serialize(payload)
      }
    } else {
      payload = serialize(data)
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
