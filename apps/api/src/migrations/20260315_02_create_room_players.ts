import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('room_players', (table) => {
    table.uuid('id').primary();
    table.string('room_id', 21).notNullable().references('id').inTable('rooms').onDelete('CASCADE');
    table.string('name', 50).notNullable();
    table.boolean('priority').notNullable().defaultTo(false);
    table.string('notes', 500).nullable();
    table.integer('position').notNullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index(['room_id'], 'idx_room_players_room_id');
    table.unique(['room_id', 'position'], { indexName: 'idx_room_players_position' });
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('room_players');
}
