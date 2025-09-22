"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Index = exports.Schema = exports.Migration = void 0;
const typeorm_1 = require("typeorm");
/**
 * Base Migration class for NodeRex framework
 */
class Migration {
    /**
     * Create a new table
     */
    createTable(queryRunner, table) {
        return queryRunner.createTable(table);
    }
    /**
     * Drop a table
     */
    dropTable(queryRunner, tableName) {
        return queryRunner.dropTable(tableName);
    }
    /**
     * Add a column to an existing table
     */
    addColumn(queryRunner, tableName, column) {
        return queryRunner.addColumn(tableName, column);
    }
    /**
     * Drop a column from a table
     */
    dropColumn(queryRunner, tableName, columnName) {
        return queryRunner.dropColumn(tableName, columnName);
    }
    /**
     * Add an index to a table
     */
    addIndex(queryRunner, tableName, index) {
        return queryRunner.createIndex(tableName, index);
    }
    /**
     * Drop an index from a table
     */
    dropIndex(queryRunner, tableName, indexName) {
        return queryRunner.dropIndex(tableName, indexName);
    }
    /**
     * Add a foreign key constraint
     */
    addForeignKey(queryRunner, tableName, foreignKey) {
        return queryRunner.createForeignKey(tableName, foreignKey);
    }
    /**
     * Drop a foreign key constraint
     */
    dropForeignKey(queryRunner, tableName, foreignKeyName) {
        return queryRunner.dropForeignKey(tableName, foreignKeyName);
    }
    /**
     * Execute raw SQL
     */
    execute(queryRunner, sql, parameters) {
        return queryRunner.query(sql, parameters);
    }
    /**
     * Insert data into a table
     */
    insert(queryRunner, tableName, data) {
        const columns = Object.keys(data[0] || {});
        const values = data.map(row => columns.map(col => row[col]));
        const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES ${values.map(() => `(${columns.map(() => '?').join(', ')})`).join(', ')}`;
        const flatValues = values.flat();
        return queryRunner.query(sql, flatValues);
    }
    /**
     * Update data in a table
     */
    update(queryRunner, tableName, data, where) {
        const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
        const sql = `UPDATE ${tableName} SET ${setClause} WHERE ${whereClause}`;
        const parameters = [...Object.values(data), ...Object.values(where)];
        return queryRunner.query(sql, parameters);
    }
    /**
     * Delete data from a table
     */
    delete(queryRunner, tableName, where) {
        const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
        const sql = `DELETE FROM ${tableName} WHERE ${whereClause}`;
        return queryRunner.query(sql, Object.values(where));
    }
    /**
     * Check if a table exists
     */
    async tableExists(queryRunner, tableName) {
        const result = await queryRunner.query(`SHOW TABLES LIKE '${tableName}'`);
        return result.length > 0;
    }
    /**
     * Check if a column exists in a table
     */
    async columnExists(queryRunner, tableName, columnName) {
        const result = await queryRunner.query(`SHOW COLUMNS FROM ${tableName} LIKE '${columnName}'`);
        return result.length > 0;
    }
    /**
     * Check if an index exists
     */
    async indexExists(queryRunner, tableName, indexName) {
        const result = await queryRunner.query(`SHOW INDEX FROM ${tableName} WHERE Key_name = '${indexName}'`);
        return result.length > 0;
    }
}
exports.Migration = Migration;
/**
 * Helper functions for creating common table columns
 */
exports.Schema = {
    // String columns
    string: (name, length = 255, nullable = true) => new typeorm_1.TableColumn({ name, type: `varchar(${length})`, isNullable: nullable }),
    text: (name, nullable = true) => new typeorm_1.TableColumn({ name, type: 'text', isNullable: nullable }),
    longText: (name, nullable = true) => new typeorm_1.TableColumn({ name, type: 'longtext', isNullable: nullable }),
    // Numeric columns
    integer: (name, nullable = true) => new typeorm_1.TableColumn({ name, type: 'int', isNullable: nullable }),
    bigInt: (name, nullable = true) => new typeorm_1.TableColumn({ name, type: 'bigint', isNullable: nullable }),
    decimal: (name, precision = 8, scale = 2, nullable = true) => new typeorm_1.TableColumn({ name, type: `decimal(${precision},${scale})`, isNullable: nullable }),
    float: (name, nullable = true) => new typeorm_1.TableColumn({ name, type: 'float', isNullable: nullable }),
    double: (name, nullable = true) => new typeorm_1.TableColumn({ name, type: 'double', isNullable: nullable }),
    // Boolean columns
    boolean: (name, nullable = true) => new typeorm_1.TableColumn({ name, type: 'boolean', isNullable: nullable }),
    // Date/Time columns
    timestamp: (name, nullable = true) => new typeorm_1.TableColumn({ name, type: 'timestamp', isNullable: nullable }),
    date: (name, nullable = true) => new typeorm_1.TableColumn({ name, type: 'date', isNullable: nullable }),
    time: (name, nullable = true) => new typeorm_1.TableColumn({ name, type: 'time', isNullable: nullable }),
    datetime: (name, nullable = true) => new typeorm_1.TableColumn({ name, type: 'datetime', isNullable: nullable }),
    // JSON columns
    json: (name, nullable = true) => new typeorm_1.TableColumn({ name, type: 'json', isNullable: nullable }),
    // Primary key
    id: () => new typeorm_1.TableColumn({ name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' }),
    // Timestamps
    timestamps: () => [
        new typeorm_1.TableColumn({ name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' }),
        new typeorm_1.TableColumn({ name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' })
    ],
    // Foreign key
    foreignId: (name, nullable = true) => new typeorm_1.TableColumn({ name: `${name}_id`, type: 'int', isNullable: nullable }),
    // Soft deletes
    softDeletes: () => new typeorm_1.TableColumn({ name: 'deleted_at', type: 'timestamp', isNullable: true })
};
/**
 * Helper functions for creating common indexes
 */
exports.Index = {
    primary: (columnNames) => new typeorm_1.TableIndex({ name: 'PRIMARY', columnNames, isUnique: true }),
    unique: (name, columnNames) => new typeorm_1.TableIndex({ name, columnNames, isUnique: true }),
    index: (name, columnNames) => new typeorm_1.TableIndex({ name, columnNames }),
    foreign: (name, columnNames) => new typeorm_1.TableIndex({ name, columnNames })
};
//# sourceMappingURL=Migration.js.map