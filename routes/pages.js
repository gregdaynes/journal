export default async function (fastify, opts) {
  fastify.get('/pages', async function (request, reply) {
    return reply.view('pages.html', {
      page: {
        title: 'Pages'
      }
    })
  })

  fastify.get('/pages/:idPage', {
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
    }
  }, async function (request, reply) {
    const { idPage } = request.params

    return reply.view('page.html', {
      page: {
        title: `Page ${idPage}`
      }
    })
  })
}
