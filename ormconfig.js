let database = './src/database/database.sqlite';
if (process.env.NODE_ENV === 'test') {
  database = ':memory:';
}

module.exports = {
  type: 'sqlite',
  database,
  entities: ['./src/entities/**.ts'],
  migrations: ['./src/database/migrations/**.ts'],
  cli: {
    migrationsDir: './src/database/migrations',
  },
};
