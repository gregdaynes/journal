import fp from 'fastify-plugin'
import { ulid } from 'ulidx'

export default fp(async (fastify, _opts) => {
  fastify.decorate('generateId', (prefix) => {
    const id = ulid()

    if (!prefix) return id

    return prefix.toUpperCase() + '_' + id
  })
})
