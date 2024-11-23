import fp from 'fastify-plugin'
import Knex from 'knex'
import knexfile from '../knexfile.js'

export default fp(async (fastify, opts) => {
  if (fastify.hasDecorator('database')) return

  const knex = Knex(knexfile[opts.knexConfig])

  // await knex.migrate.latest()

  fastify.decorate('database', () => knex)
  fastify.addHook('onClose', () => {
    knex.destroy()
  })
})
