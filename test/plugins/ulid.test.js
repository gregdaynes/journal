import { test } from 'node:test'
import * as assert from 'node:assert'
import Fastify from 'fastify'
import Ulid from '../../plugins/ulid.js'

test('generates a prefixed ulid id', async () => {
  const fastify = Fastify()
  fastify.register(Ulid)

  await fastify.ready()
  assert.match(fastify.generateId('test'), /TEST_[0-7][0-9A-HJKMNP-TV-Z]{25}/)
})

test('generates a ulid id', async () => {
  const fastify = Fastify()
  fastify.register(Ulid)

  await fastify.ready()
  assert.match(fastify.generateId(), /[0-7][0-9A-HJKMNP-TV-Z]{25}/)
})
