import serialize from 'serialize-javascript'

const routeCreateSchema = {
  body: {
    $id: 'app:pages:create:body',
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 3
      }
    },
    required: ['name']
  }
}

const routeReadSchema = {
  params: {
    $id: 'app:pages:read:params',
    type: 'object',
    properties: {
      idPage: {
        type: 'string',
        pattern: 'PAGE_[0-7][0-9A-HJKMNP-TV-Z]{25}'
      }
    },
    required: ['idPage']
  }
}

const routeCreateBlockSchema = {
  params: {
    $id: 'app:pages:block:create:params',
    type: 'object',
    properties: {
      idPage: {
        type: 'string',
        pattern: 'PAGE_[0-7][0-9A-HJKMNP-TV-Z]{25}'
      }
    },
    required: ['idPage']
  },
  body: {
    $id: 'app:pages:block:create:body',
    type: 'object',
    properties: {
      type: {
        type: 'string',
        oneOf: [
          { enum: ['text', 'javascript', 'image', 'link'] }
        ]
      },
      data: {
        type: 'string'
      },
      file: {
        type: 'string'
      },
      order: {
        type: 'string'
      }
    },
    required: ['type']
  }
}

const routeDeleteBlockSchema = {
  params: {
    $id: 'app:pages:block:delete:params',
    type: 'object',
    properties: {
      idPage: {
        type: 'string',
        pattern: 'PAGE_[0-7][0-9A-HJKMNP-TV-Z]{25}'
      },
      idBlock: {
        type: 'string',
        pattern: 'BLOCK_[0-7][0-9A-HJKMNP-TV-Z]{25}'
      }
    },
    required: ['idPage', 'idBlock']
  }
}

const routeUpdateBlockStateSchema = {
  params: {
    $id: 'app:pages:block:update-state:params',
    type: 'object',
    properties: {
      idPage: {
        type: 'string',
        pattern: 'PAGE_[0-7][0-9A-HJKMNP-TV-Z]{25}'
      },
      idBlock: {
        type: 'string',
        pattern: 'BLOCK_[0-7][0-9A-HJKMNP-TV-Z]{25}'
      }
    },
    required: ['idPage', 'idBlock']
  },
  query: {
    $id: 'app:pages:block:update-state:query',
    type: 'object',
    properties: {
      open: {
        type: 'boolean',
      },
    },
    required: ['open']
  }
}

export default async function (fastify, opts) {
  /**
   * Create page
   */
  fastify.post('/', {
    schema: routeCreateSchema
  }, async function (request, reply) {
    const idPage = request.server.generateId('page')
    const { name } = request.body
    const metadata = { name }
    const payload = {}

    await request.database('pages').insert({
      idPage,
      metadata: JSON.stringify(metadata),
      payload: serialize(payload)
    })

    return reply.redirect(`/pages/${idPage}`)
  })

  /*
   * List pages
   */
  fastify.get('/', {
    onRequest: async (request) => {
      request.locals = {
        page: {
          title: 'Pages'
        }
      }
    }
  }, async function (request, reply) {
    const pages = await request.database('pages').where({ deleted: null })
      .then(pages => request.transformRecordsWithJSON(pages))

    request.locals.pages = pages

    return reply.view('pages.html', request.locals)
  })

  /**
   * New Page
   */
  fastify.get('/new', {
    onRequest: async (request) => {
      request.locals = {
        page: {
          title: 'Create page'
        }
      }
    }
  }, async function (request, reply) {
    return reply.view('pages-new.html', request.locals)
  })

  /**
   * Read Page
   */
  fastify.get('/:idPage', {
    schema: routeReadSchema,
    onRequest: async (request) => {
      request.locals = {}
    }
  }, async function (request, reply) {
    const { idPage } = request.params

    const pages = await request.database('pages')
      .where({ idPage, deleted: null })
      .then(pages => request.transformRecordsWithJSON(pages))

    const blocks = await request.database('page_blocks')
      .where({ 'page_blocks.idPage': idPage, 'page_blocks.deleted': null })
      .leftJoin('blocks', 'page_blocks.idBlock', 'blocks.idBlock')
      .orderBy('order', 'asc')
      .then(blocks => request.transformRecordsWithJSON(blocks))
      .catch(err => {
        request.log.error(err, 'Error reading blocks from db')
        return []
      })

    for (const block of blocks) {
      if (block.metadata.type === 'text') {
        block.output = block.payload
      } else if (block.metadata.type === 'javascript') {
        try {
          block.output = eval('(' + block.payload + ')')
        } catch (err) {
          block.output = err.toString()
          request.log.error(err, 'Error rendering payload')
        }
      } else if (block.metadata.type === 'image') {
        block.output = `/files/${idPage}/${block.idBlock}`
      } else if (block.metadata.type === 'link') {
        const payload = JSON.parse(block.payload)

        block.output = {
          url: payload.url,
          cachedUrl: `/files/${idPage}/${block.idBlock}`
        }
      }
    }

    return reply.view('pages-read.html', {
      pages,
      blocks,
      page: {
        title: `Page ${idPage}`
      }
    })
  })

  /**
   * Create block on page
   */
  fastify.post('/:idPage/block', {
    schema: routeCreateBlockSchema,
  }, async (request, reply) => {
    const { idPage } = request.params
    let { type, data, order } = request.body

    // TODO this is a prime candidate for a strategy pattern implementation
    let payload
    if (type === 'image') {
      payload = await request.file()
    } else if (type === 'link') {
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

    const metadata = JSON.stringify({
      type,
    })

    const idBlock = request.generateId('block')
    await request.database('blocks').insert({
      idBlock,
      metadata,
      payload,
    })

    // associate block to the page
    const existingBlocks = await request.database('page_blocks')
      .where({ idPage, deleted: null })
      .orderBy('order', 'asc')

    if (order) {
      order = Number.parseInt(order)
      const blocksToReorder = existingBlocks.filter(block => block.order > order)

      for (const block of blocksToReorder) {
        await request.database('page_blocks')
          .where({ idPage, idBlock: block.idBlock })
          .update('order', Number.parseInt(block.order) + 1)
      }

    } else {
      order = existingBlocks.reduce((acc, block) => {
        return block.order >= acc && block.order
      }, 0)
    }

    await request.database('page_blocks').insert({
      idPage,
      idBlock,
      order: order + 1,
    })

    return reply.redirect(`/pages/${idPage}`)
  })

  /**
   * Create file block on page
   */
  fastify.post('/:idPage/block-file', {
    // schema: routeCreateFileBlockSchema,
  }, async (request, reply) => {
    const { idPage } = request.params

    const fileData = await request.file()

    const metadata = JSON.stringify({
      type: 'image',
      filename: fileData.filename,
      mimetype: fileData.mimetype
    })

    const data = await fileData.toBuffer()

    const payload = data.toString('base64')
    const idBlock = request.generateId('block')
    await request.database('blocks').insert({
      idBlock,
      metadata,
      payload,
    })

    // associate block to the page
    const existingBlocks = await request.database('page_blocks')
      .where({ idPage, deleted: null })
      .orderBy('order', 'asc')

    const nextOrder = existingBlocks.reduce((acc, block) => {
      return block.order > acc && block.order
    }, 0)

    await request.database('page_blocks').insert({
      idPage,
      idBlock,
      order: nextOrder,
    })

    return reply.redirect(`/pages/${idPage}`)
  })

  /**
   * Delete file block on page
   */
  fastify.get('/:idPage/block/:idBlock/delete', {
     schema: routeDeleteBlockSchema,
  }, async (request, reply) => {
    const { idPage, idBlock } = request.params

    await request.database('page_blocks')
      .where({
        idPage,
        idBlock,
      })
      .update({
        deleted: new Date()
      })

    return reply.redirect(`/pages/${idPage}`)
  })

  /**
   * Set block open state
   */
  fastify.get('/:idPage/block/:idBlock/state', {
     schema: routeUpdateBlockStateSchema,
  }, async (request, reply) => {
    const { idPage, idBlock } = request.params
    const { open } = request.query

    await request.database('page_blocks')
      .where({
        idPage,
        idBlock,
      })
      .update({
        updated: new Date(),
        open
      })

    return reply.redirect(`/pages/${idPage}`)
  })
}
