import { test } from 'node:test'
import * as assert from 'node:assert'
import { build } from '../helper.js'

test('default root route', async (t) => {
  const app = await build(t)

  const res = await app.inject({
    url: '/'
  })

  assert.deepStrictEqual(
    res.body,
    '<!doctype html>\n' +
    '<html lang="en">\n' +
    '  <head>\n' +
    '    <title>Greeings</title>\n' +
    '  </head>\n' +
    '  <body>\n' +
    '    <h1>Hello world</h1>\n' +
    '  </body>\n' +
    '</html>\n'
  )
})
