import fp from 'fastify-plugin'
import Knex from 'knex'
import knexfile from '../knexfile.js'

export default fp(async (fastify, opts) => {
  if (fastify.hasDecorator('database')) return

  const knex = Knex(knexfile[opts.knexConfig])

  try {
    fastify.log.info('Running migrations')
    await knex.migrate.latest()
    fastify.log.info('Migrations complete')
  } catch (err) {
    fastify.log.error(err, 'Migrations failed')
    throw new Error(err)
  }

  fastify.decorate('database', () => knex)
  fastify.addHook('onClose', () => {
    knex.destroy()
  })
})
