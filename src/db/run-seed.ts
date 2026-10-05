import { seedDatabase } from './seed';

seedDatabase()
  .then(() => {
    console.log('Seed process finished.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seed process failed:', err);
    process.exit(1);
  });
