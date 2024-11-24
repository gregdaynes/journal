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
          { enum: ['text', 'javascript', 'image'] }
        ]
      },
      data: {
        type: 'string'
      },
      file: {
        type: 'string'
      }
    },
    required: ['type']
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

  /**
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
        block.output = eval('(' + block.payload + ')')
      } else if (block.metadata.type === 'image') {
        block.output = `/files/${idPage}/${block.idBlock}`
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
    let { type, data } = request.body

    let payload
    if (type === 'image') {
      payload = await request.file()
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
   * Create file block on page
   */
  fastify.post('/:idPage/block-file', {
    //schema: routeCreateFileBlockSchema,
  }, async (request, reply) => {
    const { idPage } = request.params

    const fileData = await request.file()

    //fileData.file // stream
    //fileData.fields // other parsed parts
    //fileData.fieldname
    //fileData.filename
    //fileData.encoding
    //fileData.mimetype

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
}
