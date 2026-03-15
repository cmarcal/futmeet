import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('teams', (table) => {
    table.uuid('id').primary();
    table.string('game_id', 21).notNullable().references('id').inTable('games').onDelete('CASCADE');
    table.string('name', 50).notNullable();
    table.integer('position').notNullable();

    table.index(['game_id'], 'idx_teams_game_id');
  });

  await knex.schema.createTable('team_players', (table) => {
    table.uuid('team_id').notNullable().references('id').inTable('teams').onDelete('CASCADE');
    table.uuid('game_player_id').notNullable().references('id').inTable('game_players');
    table.primary(['team_id', 'game_player_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('team_players');
  await knex.schema.dropTableIfExists('teams');
}
