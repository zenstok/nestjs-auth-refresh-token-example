import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { NodeEnv } from '../env/configuration';
dotenv.config();

const isDevEnv = process.env.NODE_ENV !== NodeEnv.Prod;
const dbHost = process.env.DB_HOST;
const dbUsername = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;

export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: dbUsername,
  password: dbPassword,
  database: dbName,
  entities: [isDevEnv ? 'src/**/entities/*.ts' : 'dist/**/entities/*.js'],
  migrations: [isDevEnv ? 'src/migrations/*.ts' : 'dist/migrations/*.js'],
});
