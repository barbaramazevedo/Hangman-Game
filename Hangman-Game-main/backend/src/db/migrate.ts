import migrate_001 from "./migrations/001_create_users";
import migrate_002 from "./migrations/002_create_categories";
import migrate_003 from "./migrations/003_create_words";
import migrate_004 from "./migrations/004_create_games";
import migrate_005 from "./migrations/005_create_game_players";
import migrate_006 from "./migrations/006_create_guess_attempts";

const migrations = [
  { name: "001_create_users",         fn: migrate_001 },
  { name: "002_create_categories",    fn: migrate_002 },
  { name: "003_create_words",         fn: migrate_003 },
  { name: "004_create_games",         fn: migrate_004 },
  { name: "005_create_game_players",  fn: migrate_005 },
  { name: "006_create_guess_attempts",fn: migrate_006 },
];

migrations.forEach(({ name, fn }) => {
  fn();
  console.log(`✓ ${name}`);
});

console.log("\nAll migrations ran successfully.");
