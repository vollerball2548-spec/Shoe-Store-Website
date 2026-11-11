import 'dotenv/config';
import { initDb } from '../server/db';
import { getDbStatus } from '../server/repository';

async function main() {
  const mode = await initDb();
  const status = await getDbStatus();

  console.log('');
  console.log('patsakorn. mix shop — database ready');
  console.log(`mode   : ${mode}`);
  console.log(`target : ${status.target}`);
  console.log('');
  for (const table of status.tables) {
    console.log(`  ${table.name.padEnd(24)} ${String(table.rowCount).padStart(5)} rows`);
  }
  console.log('');
  console.log('demo accounts');
  console.log('  admin    : admin@patsakorn.shop / admin1234');
  console.log('  customer : customer@patsakorn.shop / customer1234');
  console.log('');
  process.exit(0);
}

main().catch(error => {
  console.error('[db:init] failed:', error);
  process.exit(1);
});
