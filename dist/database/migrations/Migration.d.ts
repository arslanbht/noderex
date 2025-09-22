import { MigrationInterface, QueryRunner, Table, TableColumn, TableIndex, TableForeignKey } from 'typeorm';
/**
 * Base Migration class for NodeRex framework
 */
export declare abstract class Migration implements MigrationInterface {
    abstract up(queryRunner: QueryRunner): Promise<void>;
    abstract down(queryRunner: QueryRunner): Promise<void>;
    /**
     * Create a new table
     */
    protected createTable(queryRunner: QueryRunner, table: Table): Promise<void>;
    /**
     * Drop a table
     */
    protected dropTable(queryRunner: QueryRunner, tableName: string): Promise<void>;
    /**
     * Add a column to an existing table
     */
    protected addColumn(queryRunner: QueryRunner, tableName: string, column: TableColumn): Promise<void>;
    /**
     * Drop a column from a table
     */
    protected dropColumn(queryRunner: QueryRunner, tableName: string, columnName: string): Promise<void>;
    /**
     * Add an index to a table
     */
    protected addIndex(queryRunner: QueryRunner, tableName: string, index: TableIndex): Promise<void>;
    /**
     * Drop an index from a table
     */
    protected dropIndex(queryRunner: QueryRunner, tableName: string, indexName: string): Promise<void>;
    /**
     * Add a foreign key constraint
     */
    protected addForeignKey(queryRunner: QueryRunner, tableName: string, foreignKey: TableForeignKey): Promise<void>;
    /**
     * Drop a foreign key constraint
     */
    protected dropForeignKey(queryRunner: QueryRunner, tableName: string, foreignKeyName: string): Promise<void>;
    /**
     * Execute raw SQL
     */
    protected execute(queryRunner: QueryRunner, sql: string, parameters?: any[]): Promise<any>;
    /**
     * Insert data into a table
     */
    protected insert(queryRunner: QueryRunner, tableName: string, data: Record<string, any>[]): Promise<void>;
    /**
     * Update data in a table
     */
    protected update(queryRunner: QueryRunner, tableName: string, data: Record<string, any>, where: Record<string, any>): Promise<void>;
    /**
     * Delete data from a table
     */
    protected delete(queryRunner: QueryRunner, tableName: string, where: Record<string, any>): Promise<void>;
    /**
     * Check if a table exists
     */
    protected tableExists(queryRunner: QueryRunner, tableName: string): Promise<boolean>;
    /**
     * Check if a column exists in a table
     */
    protected columnExists(queryRunner: QueryRunner, tableName: string, columnName: string): Promise<boolean>;
    /**
     * Check if an index exists
     */
    protected indexExists(queryRunner: QueryRunner, tableName: string, indexName: string): Promise<boolean>;
}
/**
 * Helper functions for creating common table columns
 */
export declare const Schema: {
    string: (name: string, length?: number, nullable?: boolean) => TableColumn;
    text: (name: string, nullable?: boolean) => TableColumn;
    longText: (name: string, nullable?: boolean) => TableColumn;
    integer: (name: string, nullable?: boolean) => TableColumn;
    bigInt: (name: string, nullable?: boolean) => TableColumn;
    decimal: (name: string, precision?: number, scale?: number, nullable?: boolean) => TableColumn;
    float: (name: string, nullable?: boolean) => TableColumn;
    double: (name: string, nullable?: boolean) => TableColumn;
    boolean: (name: string, nullable?: boolean) => TableColumn;
    timestamp: (name: string, nullable?: boolean) => TableColumn;
    date: (name: string, nullable?: boolean) => TableColumn;
    time: (name: string, nullable?: boolean) => TableColumn;
    datetime: (name: string, nullable?: boolean) => TableColumn;
    json: (name: string, nullable?: boolean) => TableColumn;
    id: () => TableColumn;
    timestamps: () => TableColumn[];
    foreignId: (name: string, nullable?: boolean) => TableColumn;
    softDeletes: () => TableColumn;
};
/**
 * Helper functions for creating common indexes
 */
export declare const Index: {
    primary: (columnNames: string[]) => TableIndex;
    unique: (name: string, columnNames: string[]) => TableIndex;
    index: (name: string, columnNames: string[]) => TableIndex;
    foreign: (name: string, columnNames: string[]) => TableIndex;
};
//# sourceMappingURL=Migration.d.ts.map