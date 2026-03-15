import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('game_players', (table) => {
    table.uuid('id').primary();
    table.string('game_id', 21).notNullable().references('id').inTable('games').onDelete('CASCADE');
    table.string('name', 50).notNullable();
    table.boolean('priority').notNullable().defaultTo(false);
    table.string('notes', 500).nullable();
    table.integer('position').notNullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index(['game_id'], 'idx_game_players_game_id');
    table.unique(['game_id', 'position'], { indexName: 'idx_game_players_position' });
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('game_players');
}
