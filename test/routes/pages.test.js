import { test } from 'node:test'
import assert from 'node:assert/strict'
import { build } from '../helper.js'

test('routes: pages', async (t) => {
  const app = await build(t)

  await t.test('/pages/new', async () => {
    const res = await app.inject({
      url: '/pages/new'
    })

    assert.deepEqual(
      res.body,
      '<!doctype html>\n' +
      '<html lang="en">\n' +
      '  <head>\n' +
      '    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">\n' +
      '    <title>Create page</title>\n' +
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
      '      <form id="pages-new" method="post" action="/pages">\n' +
      '  <label for="name">Name</label>\n' +
      '  <input type="text" id="name" name="name">\n' +
      '\n' +
      '  <button type="submit">Create page</button>\n' +
      '</form>\n' +
      '    </main>\n' +
      '  </body>\n' +
      '</html>\n'
    )
  })

  await t.test('/pages/create', async () => {
    const res = await app.inject({
      url: '/pages',
      method: 'post',
      body: {
        name: 'Test'
      }
    })

    assert.equal(res.statusCode, 302)
    assert.match(res.headers.location, /\/pages\/PAGE_[0-7][0-9A-HJKMNP-TV-Z]{25}/)
  })

  await t.test('/pages', async () => {
    const [page] = await app.database()('pages').where({ deleted: null })

    const res = await app.inject({
      url: '/pages',
    })

    assert.deepEqual(
      res.body,
      '<!doctype html>\n' +
      '<html lang="en">\n' +
      '  <head>\n' +
      '    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">\n' +
      '    <title>Pages</title>\n' +
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
      '        <article>\n' +
      `    <h2><a href="/pages/${page.idPage}">Test</a></h2>\n` +
      '  </article>\n' +
      '    </main>\n' +
      '  </body>\n' +
      '</html>\n'
    )
  })

  await t.test('/pages/:idPage', async () => {
    const [page] = await app.database()('pages').where({ deleted: null })
    page.metadata = JSON.parse(page.metadata)

    const res = await app.inject({
      url: `/pages/${page.idPage}`,
    })

    assert.deepEqual(
      res.body,
      '<!doctype html>\n' +
      '<html lang="en">\n' +
      '  <head>\n' +
      '    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">\n' +
      `    <title>Page ${page.idPage}</title>\n` +
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
      '      \n' +
      '  <article>\n' +
      `    <h2>${page.metadata.name}</h2>\n` +
      '\n' +
      '    \n' +
      `    <form id="block-create" method="post" action="/pages/${page.idPage}/block">\n` +
      '      <select name="type">\n' +
      '        <option value="text">Text</option>\n' +
      '        <option value="javascript">Javascript</option>\n' +
      '      </select>\n' +
      '\n' +
      '      <textarea name="data"></textarea>\n' +
      '\n' +
      '      <button type="submit">Add Block</button>\n' +
      '    </form>\n' +
      '  </article>\n' +
      '    </main>\n' +
      '  </body>\n' +
      '</html>\n'
    )
  })
})
