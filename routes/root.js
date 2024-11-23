export default async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    return reply.view('root.html', {
      message: 'Hello world',
      page: {
        title: 'Greeings'
      }
    })
  })
}
