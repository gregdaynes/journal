const tableName = 'page_blocks'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up (knex) {
  return await knex.schema.createTable(tableName, (table) => {
    table.increments()
    table.string('idPage', 31).notNullable()
    table.string('idBlock', 32).notNullable()
    table.integer('order').notNullable()
    table.timestamp('created').defaultTo(knex.fn.now())
    table.timestamp('updated').defaultTo(knex.fn.now())
    table.timestamp('deleted').nullable()
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down (knex) {
  return knex.schema.dropTable(tableName)
}
