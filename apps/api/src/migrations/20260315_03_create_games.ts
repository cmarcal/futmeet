import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('games', (table) => {
    table.string('id', 21).primary();
    table.string('room_id', 21).nullable().references('id').inTable('rooms');
    table.integer('team_count').notNullable().defaultTo(2);
    table.string('game_status', 10).notNullable().defaultTo('setup');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.raw(`
    ALTER TABLE games
      ADD CONSTRAINT games_team_count_check CHECK (team_count BETWEEN 2 AND 10),
      ADD CONSTRAINT games_game_status_check CHECK (game_status IN ('setup', 'complete'))
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('games');
}
