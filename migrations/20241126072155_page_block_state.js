const tableName = 'page_blocks'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up (knex) {
  return await knex.schema.alterTable(tableName, (table) => {
    table.boolean('open').notNullable().defaultTo(true)
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down (knex) {
  return knex.schema.alterTable(tableName, (table) => {
    table.dropColumn('open')
  })
}
