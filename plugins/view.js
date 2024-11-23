import fp from 'fastify-plugin'
import view from '@fastify/view'
import { Eta } from 'eta'

export default fp(async (fastify) => {
  fastify.register(view, {
    engine: {
      eta: new Eta()
    },
    templates: 'templates'
  })
})
