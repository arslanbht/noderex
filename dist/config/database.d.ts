import 'dotenv/config';
/**
 * Database configuration for NodeRex framework
 */
export declare const database: {
    default: string;
    connections: {
        mysql: {
            type: "mysql";
            host: string;
            port: number;
            username: string;
            password: string;
            database: string;
            synchronize: boolean;
            logging: boolean;
            entities: string[];
            migrations: string[];
            subscribers: string[];
            cli: {
                entitiesDir: string;
                migrationsDir: string;
                subscribersDir: string;
            };
        };
        postgres: {
            type: "postgres";
            host: string;
            port: number;
            username: string;
            password: string;
            database: string;
            synchronize: boolean;
            logging: boolean;
            entities: string[];
            migrations: string[];
            subscribers: string[];
            cli: {
                entitiesDir: string;
                migrationsDir: string;
                subscribersDir: string;
            };
        };
        sqlite: {
            type: "sqlite";
            database: string;
            synchronize: boolean;
            logging: boolean;
            entities: string[];
            migrations: string[];
            subscribers: string[];
            cli: {
                entitiesDir: string;
                migrationsDir: string;
                subscribersDir: string;
            };
        };
    };
};
export default database;
//# sourceMappingURL=database.d.ts.map