import { DataSource } from 'typeorm';

/**
 * Base Seeder class
 */
export abstract class Seeder {
    protected dataSource: DataSource;

    constructor(dataSource?: DataSource) {
        this.dataSource = dataSource || (global as any).dataSource;
    }

    /**
     * Run the seeder
     */
    public abstract run(): Promise<void>;

    /**
     * Create records in a table
     */
    protected async create(tableName: string, records: any[]): Promise<void> {
        if (!this.dataSource) {
            throw new Error('Database connection not available');
        }

        const repository = this.dataSource.getRepository(tableName);
        for (const record of records) {
            await repository.save(record);
        }
    }

    /**
     * Execute raw SQL query
     */
    protected async query(sql: string, parameters?: any[]): Promise<any> {
        if (!this.dataSource) {
            throw new Error('Database connection not available');
        }

        return await this.dataSource.query(sql, parameters);
    }
}
