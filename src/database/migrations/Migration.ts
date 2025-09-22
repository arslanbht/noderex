import { MigrationInterface, QueryRunner, Table, TableColumn, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Base Migration class for NodeRex framework
 */
export abstract class Migration implements MigrationInterface {
  public abstract up(queryRunner: QueryRunner): Promise<void>;
  public abstract down(queryRunner: QueryRunner): Promise<void>;

  /**
   * Create a new table
   */
  protected createTable(queryRunner: QueryRunner, table: Table): Promise<void> {
    return queryRunner.createTable(table);
  }

  /**
   * Drop a table
   */
  protected dropTable(queryRunner: QueryRunner, tableName: string): Promise<void> {
    return queryRunner.dropTable(tableName);
  }

  /**
   * Add a column to an existing table
   */
  protected addColumn(queryRunner: QueryRunner, tableName: string, column: TableColumn): Promise<void> {
    return queryRunner.addColumn(tableName, column);
  }

  /**
   * Drop a column from a table
   */
  protected dropColumn(queryRunner: QueryRunner, tableName: string, columnName: string): Promise<void> {
    return queryRunner.dropColumn(tableName, columnName);
  }

  /**
   * Add an index to a table
   */
  protected addIndex(queryRunner: QueryRunner, tableName: string, index: TableIndex): Promise<void> {
    return queryRunner.createIndex(tableName, index);
  }

  /**
   * Drop an index from a table
   */
  protected dropIndex(queryRunner: QueryRunner, tableName: string, indexName: string): Promise<void> {
    return queryRunner.dropIndex(tableName, indexName);
  }

  /**
   * Add a foreign key constraint
   */
  protected addForeignKey(queryRunner: QueryRunner, tableName: string, foreignKey: TableForeignKey): Promise<void> {
    return queryRunner.createForeignKey(tableName, foreignKey);
  }

  /**
   * Drop a foreign key constraint
   */
  protected dropForeignKey(queryRunner: QueryRunner, tableName: string, foreignKeyName: string): Promise<void> {
    return queryRunner.dropForeignKey(tableName, foreignKeyName);
  }

  /**
   * Execute raw SQL
   */
  protected execute(queryRunner: QueryRunner, sql: string, parameters?: any[]): Promise<any> {
    return queryRunner.query(sql, parameters);
  }

  /**
   * Insert data into a table
   */
  protected insert(queryRunner: QueryRunner, tableName: string, data: Record<string, any>[]): Promise<void> {
    const columns = Object.keys(data[0] || {});
    const values = data.map(row => columns.map(col => row[col]));
    
    const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES ${values.map(() => `(${columns.map(() => '?').join(', ')})`).join(', ')}`;
    const flatValues = values.flat();
    
    return queryRunner.query(sql, flatValues);
  }

  /**
   * Update data in a table
   */
  protected update(queryRunner: QueryRunner, tableName: string, data: Record<string, any>, where: Record<string, any>): Promise<void> {
    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
    
    const sql = `UPDATE ${tableName} SET ${setClause} WHERE ${whereClause}`;
    const parameters = [...Object.values(data), ...Object.values(where)];
    
    return queryRunner.query(sql, parameters);
  }

  /**
   * Delete data from a table
   */
  protected delete(queryRunner: QueryRunner, tableName: string, where: Record<string, any>): Promise<void> {
    const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
    const sql = `DELETE FROM ${tableName} WHERE ${whereClause}`;
    
    return queryRunner.query(sql, Object.values(where));
  }

  /**
   * Check if a table exists
   */
  protected async tableExists(queryRunner: QueryRunner, tableName: string): Promise<boolean> {
    const result = await queryRunner.query(`SHOW TABLES LIKE '${tableName}'`);
    return result.length > 0;
  }

  /**
   * Check if a column exists in a table
   */
  protected async columnExists(queryRunner: QueryRunner, tableName: string, columnName: string): Promise<boolean> {
    const result = await queryRunner.query(`SHOW COLUMNS FROM ${tableName} LIKE '${columnName}'`);
    return result.length > 0;
  }

  /**
   * Check if an index exists
   */
  protected async indexExists(queryRunner: QueryRunner, tableName: string, indexName: string): Promise<boolean> {
    const result = await queryRunner.query(`SHOW INDEX FROM ${tableName} WHERE Key_name = '${indexName}'`);
    return result.length > 0;
  }
}

/**
 * Helper functions for creating common table columns
 */
export const Schema = {
  // String columns
  string: (name: string, length: number = 255, nullable: boolean = true) => 
    new TableColumn({ name, type: `varchar(${length})`, isNullable: nullable }),
  
  text: (name: string, nullable: boolean = true) => 
    new TableColumn({ name, type: 'text', isNullable: nullable }),
  
  longText: (name: string, nullable: boolean = true) => 
    new TableColumn({ name, type: 'longtext', isNullable: nullable }),
  
  // Numeric columns
  integer: (name: string, nullable: boolean = true) => 
    new TableColumn({ name, type: 'int', isNullable: nullable }),
  
  bigInt: (name: string, nullable: boolean = true) => 
    new TableColumn({ name, type: 'bigint', isNullable: nullable }),
  
  decimal: (name: string, precision: number = 8, scale: number = 2, nullable: boolean = true) => 
    new TableColumn({ name, type: `decimal(${precision},${scale})`, isNullable: nullable }),
  
  float: (name: string, nullable: boolean = true) => 
    new TableColumn({ name, type: 'float', isNullable: nullable }),
  
  double: (name: string, nullable: boolean = true) => 
    new TableColumn({ name, type: 'double', isNullable: nullable }),
  
  // Boolean columns
  boolean: (name: string, nullable: boolean = true) => 
    new TableColumn({ name, type: 'boolean', isNullable: nullable }),
  
  // Date/Time columns
  timestamp: (name: string, nullable: boolean = true) => 
    new TableColumn({ name, type: 'timestamp', isNullable: nullable }),
  
  date: (name: string, nullable: boolean = true) => 
    new TableColumn({ name, type: 'date', isNullable: nullable }),
  
  time: (name: string, nullable: boolean = true) => 
    new TableColumn({ name, type: 'time', isNullable: nullable }),
  
  datetime: (name: string, nullable: boolean = true) => 
    new TableColumn({ name, type: 'datetime', isNullable: nullable }),
  
  // JSON columns
  json: (name: string, nullable: boolean = true) => 
    new TableColumn({ name, type: 'json', isNullable: nullable }),
  
  // Primary key
  id: () => 
    new TableColumn({ name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' }),
  
  // Timestamps
  timestamps: () => [
    new TableColumn({ name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' }),
    new TableColumn({ name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' })
  ],
  
  // Foreign key
  foreignId: (name: string, nullable: boolean = true) => 
    new TableColumn({ name: `${name}_id`, type: 'int', isNullable: nullable }),
  
  // Soft deletes
  softDeletes: () => 
    new TableColumn({ name: 'deleted_at', type: 'timestamp', isNullable: true })
};

/**
 * Helper functions for creating common indexes
 */
export const Index = {
  primary: (columnNames: string[]) => 
    new TableIndex({ name: 'PRIMARY', columnNames, isUnique: true }),
  
  unique: (name: string, columnNames: string[]) => 
    new TableIndex({ name, columnNames, isUnique: true }),
  
  index: (name: string, columnNames: string[]) => 
    new TableIndex({ name, columnNames }),
  
  foreign: (name: string, columnNames: string[]) => 
    new TableIndex({ name, columnNames })
};
