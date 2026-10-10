import knex from 'knex';
import { knexConfig } from './knexConfig.js';

const [command, ...args] = process.argv.slice(2);
const db = knex(knexConfig);

try {
  if (command === 'migrate:latest') {
    const [, log] = await db.migrate.latest();
    console.log(log.length ? `Ran: ${log.join(', ')}` : 'Already up to date');
  } else if (command === 'migrate:rollback') {
    const all = args.includes('--all');
    const [, log] = await db.migrate.rollback(undefined, all);
    console.log(log.length ? `Rolled back: ${log.join(', ')}` : 'Nothing to rollback');
  } else if (command === 'migrate:status') {
    const [completed, pending] = await db.migrate.list();
    console.log('Completed:', completed.map((m: { name: string }) => m.name));
    console.log('Pending:', pending.map((m: { file: string }) => m.file));
  } else if (command === 'seed:run') {
    await db.seed.run();
    console.log('Seeds ran successfully');
  } else {
    console.error(`Unknown command: ${command}`);
    process.exitCode = 1;
  }
} finally {
  await db.destroy();
}
