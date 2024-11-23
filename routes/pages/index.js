export default async function (fastify, opts) {
  /**
   * Create page
   */
  fastify.post('/', {
    schema: {
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
  }, async function (request, reply) {
    const idPage = request.server.generateId('page')
    const { name } = request.body
    const metadata = { name }
    const payload = {}

    await request.database('pages').insert({
      idPage,
      metadata: JSON.stringify(metadata),
      payload: JSON.stringify(payload)
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
    const pages = await request.database('pages').select('*').where('deleted', null)

    for (const page of pages) {
      page.metadata = JSON.parse(page.metadata)
      page.payload = JSON.parse(page.payload)
    }

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
    schema: {
      params: {
        $id: 'app:pages:read:params',
        type: 'object',
        properties: {
          idPage: {
            type: 'string',
            pattern: 'PAGE_[0-7][0-9A-HJKMNP-TV-Z]{25}'
          }
        }
      }
    },
    onRequest: async (request) => {
      request.locals = {}
    }
  }, async function (request, reply) {
    const { idPage } = request.params

    const pages = await request.database('pages').select('*').where({ idPage, deleted: null })
    const blocks = await request.database('page_blocks').select('*').where({ idPage, 'page_blocks.deleted': null }).orderBy('order', 'asc')
      .leftJoin('blocks', 'page_blocks.idBlock', 'blocks.idBlock');

    for (const page of pages) {
      page.metadata = JSON.parse(page.metadata)
      page.payload = JSON.parse(page.payload)
    }

    for (const block of blocks) {
      block.metadata = JSON.parse(block.metadata)
      block.payload = JSON.parse(block.payload)
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
    schema: {
      params: {
        $id: 'app:pages:block:create:params',
        type: 'object',
        properties: {
          idPage: {
            type: 'string',
            pattern: 'PAGE_[0-7][0-9A-HJKMNP-TV-Z]{25}'
          }
        }
      },
      body: {
        $id: 'app:pages:block:create:body',
        type: 'object',
        properties: {
          type: {
            type: 'string',
            oneOf: [
              {"enum": ['text']}
            ]
          }
        }
      }
    }
  }, async (request, reply) => {
    const { idPage } = request.params
    const { type, data } = request.body

    // TODO we want to use a serializer for the data, then stick that in the payload, along with whatever else, but this is fine for now
    const metadata = JSON.stringify({
      type,
    })

    const payload = JSON.stringify({ data })

    const idBlock = request.generateId('block')
    await request.database('blocks').insert({
      idBlock,
      metadata,
      payload,
    })

    // associate block to the page
    //const [page] = await request.database('pages').select('*').where({ idPage, deleted: null })
    const existingBlocks = await request.database('page_blocks').select('*').where({ idPage, deleted: null }).orderBy('order', 'asc')

    const nextOrder = existingBlocks.reduce((acc, block) => block.order > acc && block.order, 0)

    await request.database('page_blocks').insert({
      idPage,
      idBlock,
      order: nextOrder,
    })

    return reply.redirect(`/pages/${idPage}`)
  })
}
