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
     * Note: This method expects an entity class, not a table name string
     */
    protected async create<T>(entityClass: new () => T, records: Partial<T>[]): Promise<void> {
        if (!this.dataSource) {
            throw new Error('Database connection not available');
        }

        const repository = this.dataSource.getRepository(entityClass);
        for (const record of records) {
            await repository.save(record);
        }
    }

    /**
     * Create records using raw SQL insert
     * Use this when you need to insert into a table by name
     */
    protected async createRaw(tableName: string, records: Record<string, any>[]): Promise<void> {
        if (!this.dataSource) {
            throw new Error('Database connection not available');
        }

        if (!records || records.length === 0) {
            return;
        }

        const columns = Object.keys(records[0]);
        const values = records.map(record => columns.map(col => record[col]));
        const placeholders = values.map(() => `(${columns.map(() => '?').join(', ')})`).join(', ');
        
        const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES ${placeholders}`;
        const flatValues = values.flat();
        
        await this.dataSource.query(sql, flatValues);
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
