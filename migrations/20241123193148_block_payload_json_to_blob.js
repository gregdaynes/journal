import serialize from 'serialize-javascript'

const tableName = 'blocks'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up (knex) {
  await knex.schema.alterTable(tableName, (table) => {
    table.blob('payload_blob').notNullable().defaultTo('{}')
  })

  const blocks = await knex('blocks')

  for (const block of blocks) {
    const { data } = JSON.parse(block.payload)

    if (data) {
      await knex(tableName).update({
        payload_blob: serialize(data)
      })
        .where({ idBlock: block.idBlock })
    }
  }

  await knex.schema.alterTable(tableName, (table) => {
    table.dropColumn('payload')
    table.renameColumn('payload_blob', 'payload')
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down (knex) {
  await knex.schema.alterTable(tableName, (table) => {
    table.string('payload_string').notNullable().defaultTo('{}')
  })

  const blocks = await knex('blocks')

  for (const block of blocks) {
    const { data } = eval(block.payload)

    if (data) {
      await knex(tableName).update({
        payload_string: JSON.stringify({ data })
      })
        .where({ idBlock: block.idBlock })
    }
  }

  await knex.schema.alterTable(tableName, (table) => {
    table.dropColumn('payload')
    table.renameColumn('payload_string', 'payload')
  })
}
