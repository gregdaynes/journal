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

    for (const page of pages) {
      page.metadata = JSON.parse(page.metadata)
      page.payload = JSON.parse(page.payload)
    }

    return reply.view('pages-read.html', {
      pages,
      page: {
        title: `Page ${idPage}`
      }
    })
  })
}
