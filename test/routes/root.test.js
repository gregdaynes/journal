import { test } from 'node:test'
import assert from 'node:assert/strict'
import { build } from '../helper.js'

test('default root route', async (t) => {
  const app = await build(t)

  const res = await app.inject({
    url: '/'
  })

  assert.deepEqual(
    res.body,
    '<!doctype html>\n' +
    '<html lang="en">\n' +
    '  <head>\n' +
    '    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">\n' +
    '    <title>Greeings</title>\n' +
    '    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css">\n' +
    '  </head>\n' +
    '  <body>\n' +
    '    <header class="container-fluid">\n' +
    '  <nav>\n' +
    '    <ul>\n' +
    '      <li><strong>Journal</strong></li>\n' +
    '    </ul>\n' +
    '    <ul>\n' +
    '      <li>\n' +
    '        <details class="dropdown">\n' +
    '          <summary>\n' +
    '            Pages\n' +
    '          </summary>\n' +
    '          <ul dir="rtl">\n' +
    '            <li><a href="/pages">Pages</a></li>\n' +
    '            <li><a href="/pages/new">Create page</a></li>\n' +
    '          </ul>\n' +
    '        </details>\n' +
    '      </li>\n' +
    '    </ul>\n' +
    '  </nav>\n' +
    '</header>\n' +
    '\n' +
    '    <main class="container">\n' +
    '      <h1>Hello world</h1>\n' +
    '    </main>\n' +
    '  </body>\n' +
    '</html>\n'
  )
})
