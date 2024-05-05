import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: `./src/database/${process.env.NODE_ENV}.sqlite`,
  entities: ['./src/entities/**.ts'],
  migrations: ['./src/database/migrations/**.ts'],
});

AppDataSource.initialize();

export { AppDataSource };
