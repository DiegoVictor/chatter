const database = `./src/database/${
  process.env.NODE_ENV ? 'test' : 'database'
}.sqlite`;

module.exports = {
  type: 'sqlite',
  database,
  entities: ['./src/entities/**.ts'],
  migrations: ['./src/database/migrations/**.ts'],
  cli: {
    migrationsDir: './src/database/migrations',
  },
};
