const tableName = 'pages'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up (knex) {
  return await knex.schema.createTable(tableName, (table) => {
    table.increments()
    table.string('idPage', 31).notNullable()
    table.text('metadata').notNullable().defaultTo('{}')
    table.text('payload').notNullable().defaultTo('{}')
    table.timestamp('created').defaultTo(knex.fn.now())
    table.timestamp('updated').defaultTo(knex.fn.now())
    table.timestamp('deleted').defaultTo(knex.fn.now())
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down (knex) {
  return knex.schema.dropTable(tableName)
}
