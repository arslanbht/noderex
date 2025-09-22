import 'dotenv/config';

/**
 * Database configuration for NodeRex framework
 */
export const database = {
  default: process.env.DB_CONNECTION || 'sqlite',
  
  connections: {
    mysql: {
      type: 'mysql' as const,
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'noderex',
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
      entities: ['src/app/Models/**/*.ts'],
      migrations: ['src/database/migrations/**/*.ts'],
      subscribers: ['src/database/subscribers/**/*.ts'],
      cli: {
        entitiesDir: 'src/app/Models',
        migrationsDir: 'src/database/migrations',
        subscribersDir: 'src/database/subscribers'
      }
    },
    
    postgres: {
      type: 'postgres' as const,
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'noderex',
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
      entities: ['src/app/Models/**/*.ts'],
      migrations: ['src/database/migrations/**/*.ts'],
      subscribers: ['src/database/subscribers/**/*.ts'],
      cli: {
        entitiesDir: 'src/app/Models',
        migrationsDir: 'src/database/migrations',
        subscribersDir: 'src/database/subscribers'
      }
    },
    
    sqlite: {
      type: 'sqlite' as const,
      database: process.env.DB_DATABASE || 'database.sqlite',
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
      entities: ['src/app/Models/**/*.ts'],
      migrations: ['src/database/migrations/**/*.ts'],
      subscribers: ['src/database/subscribers/**/*.ts'],
      cli: {
        entitiesDir: 'src/app/Models',
        migrationsDir: 'src/database/migrations',
        subscribersDir: 'src/database/subscribers'
      }
    }
  }
};

export default database;
