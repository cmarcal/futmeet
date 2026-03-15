import type { Knex } from 'knex';

const ROOM_ID = 'seed_room_00000000001';
const GAME_ID = 'seed_game_00000000001';

const ROOM_PLAYERS = [
  { id: '00000000-0000-0000-0001-000000000001', name: 'João',    priority: true,  notes: 'Goleiro',  position: 0 },
  { id: '00000000-0000-0000-0001-000000000002', name: 'Carlos',  priority: false, notes: null,       position: 1 },
  { id: '00000000-0000-0000-0001-000000000003', name: 'Pedro',   priority: true,  notes: 'Atacante', position: 2 },
  { id: '00000000-0000-0000-0001-000000000004', name: 'Lucas',   priority: false, notes: null,       position: 3 },
  { id: '00000000-0000-0000-0001-000000000005', name: 'Rafael',  priority: false, notes: null,       position: 4 },
  { id: '00000000-0000-0000-0001-000000000006', name: 'Thiago',  priority: false, notes: null,       position: 5 },
  { id: '00000000-0000-0000-0001-000000000007', name: 'Mateus',  priority: false, notes: null,       position: 6 },
  { id: '00000000-0000-0000-0001-000000000008', name: 'Felipe',  priority: true,  notes: 'Zagueiro', position: 7 },
];

const GAME_PLAYERS = [
  { id: '00000000-0000-0000-0002-000000000001', name: 'João',   priority: true,  notes: 'Goleiro',  position: 0 },
  { id: '00000000-0000-0000-0002-000000000002', name: 'Carlos', priority: false, notes: null,       position: 1 },
  { id: '00000000-0000-0000-0002-000000000003', name: 'Pedro',  priority: true,  notes: 'Atacante', position: 2 },
  { id: '00000000-0000-0000-0002-000000000004', name: 'Lucas',  priority: false, notes: null,       position: 3 },
  { id: '00000000-0000-0000-0002-000000000005', name: 'Rafael', priority: false, notes: null,       position: 4 },
  { id: '00000000-0000-0000-0002-000000000006', name: 'Thiago', priority: false, notes: null,       position: 5 },
  { id: '00000000-0000-0000-0002-000000000007', name: 'Mateus', priority: false, notes: null,       position: 6 },
  { id: '00000000-0000-0000-0002-000000000008', name: 'Felipe', priority: true,  notes: 'Zagueiro', position: 7 },
];

const TEAM_A_ID = '00000000-0000-0000-0003-000000000001';
const TEAM_B_ID = '00000000-0000-0000-0003-000000000002';

const TEAMS = [
  { id: TEAM_A_ID, game_id: GAME_ID, name: 'Time 1', position: 1 },
  { id: TEAM_B_ID, game_id: GAME_ID, name: 'Time 2', position: 2 },
];

const TEAM_PLAYERS = [
  { team_id: TEAM_A_ID, game_player_id: '00000000-0000-0000-0002-000000000001' },
  { team_id: TEAM_A_ID, game_player_id: '00000000-0000-0000-0002-000000000003' },
  { team_id: TEAM_A_ID, game_player_id: '00000000-0000-0000-0002-000000000005' },
  { team_id: TEAM_A_ID, game_player_id: '00000000-0000-0000-0002-000000000007' },
  { team_id: TEAM_B_ID, game_player_id: '00000000-0000-0000-0002-000000000002' },
  { team_id: TEAM_B_ID, game_player_id: '00000000-0000-0000-0002-000000000004' },
  { team_id: TEAM_B_ID, game_player_id: '00000000-0000-0000-0002-000000000006' },
  { team_id: TEAM_B_ID, game_player_id: '00000000-0000-0000-0002-000000000008' },
];

export async function seed(knex: Knex): Promise<void> {
  await knex('team_players').del();
  await knex('teams').del();
  await knex('game_players').del();
  await knex('games').del();
  await knex('room_players').del();
  await knex('rooms').del();

  await knex('rooms').insert({ id: ROOM_ID });

  await knex('room_players').insert(
    ROOM_PLAYERS.map((p) => ({ ...p, room_id: ROOM_ID }))
  );

  await knex('games').insert({
    id: GAME_ID,
    room_id: ROOM_ID,
    team_count: 2,
    game_status: 'complete',
  });

  await knex('game_players').insert(
    GAME_PLAYERS.map((p) => ({ ...p, game_id: GAME_ID }))
  );

  await knex('teams').insert(TEAMS);
  await knex('team_players').insert(TEAM_PLAYERS);
}
