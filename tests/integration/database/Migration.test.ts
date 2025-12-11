import { DataSource } from 'typeorm';
import { Migration, Schema, Index } from '../../../src/database/migrations/Migration';

/**
 * Test Migration class
 */
class TestMigration extends Migration {
  public async up(queryRunner: any): Promise<void> {
    await this.createTable(queryRunner, new (require('typeorm').Table)({
      name: 'test_users',
      columns: [
        Schema.id(),
        Schema.string('name', 255, false),
        Schema.string('email', 255, false),
        Schema.integer('age', true),
        ...Schema.timestamps(),
      ],
      indices: [
        Index.unique('test_users_email_unique', ['email']),
      ],
    }));
  }

  public async down(queryRunner: any): Promise<void> {
    await this.dropTable(queryRunner, 'test_users');
  }
}

describe('Migration Database Compatibility', () => {
  let dataSource: DataSource;
  let queryRunner: any;

  beforeEach(async () => {
    // Create in-memory SQLite database for testing
    dataSource = new DataSource({
      type: 'sqlite',
      database: ':memory:',
      synchronize: false,
      logging: false,
    });

    await dataSource.initialize();
    queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
  });

  afterEach(async () => {
    if (queryRunner) {
      await queryRunner.release();
    }
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  describe('tableExists()', () => {
    it('should detect table existence in SQLite', async () => {
      const migration = new TestMigration();
      
      // Table should not exist initially
      const existsBefore = await migration['tableExists'](queryRunner, 'test_users');
      expect(existsBefore).toBe(false);

      // Create table
      await migration.up(queryRunner);

      // Table should exist now
      const existsAfter = await migration['tableExists'](queryRunner, 'test_users');
      expect(existsAfter).toBe(true);
    });
  });

  describe('columnExists()', () => {
    it('should detect column existence in SQLite', async () => {
      const migration = new TestMigration();
      await migration.up(queryRunner);

      // Check for existing column
      const emailExists = await migration['columnExists'](queryRunner, 'test_users', 'email');
      expect(emailExists).toBe(true);

      // Check for non-existing column
      const fakeExists = await migration['columnExists'](queryRunner, 'test_users', 'fake_column');
      expect(fakeExists).toBe(false);
    });
  });

  describe('indexExists()', () => {
    it('should detect index existence in SQLite', async () => {
      const migration = new TestMigration();
      await migration.up(queryRunner);

      // Check for existing index
      const indexExists = await migration['indexExists'](queryRunner, 'test_users', 'test_users_email_unique');
      expect(indexExists).toBe(true);

      // Check for non-existing index
      const fakeExists = await migration['indexExists'](queryRunner, 'test_users', 'fake_index');
      expect(fakeExists).toBe(false);
    });
  });

  describe('createTable() and dropTable()', () => {
    it('should create and drop table correctly', async () => {
      const migration = new TestMigration();

      // Create table
      await migration.up(queryRunner);
      const existsAfterCreate = await migration['tableExists'](queryRunner, 'test_users');
      expect(existsAfterCreate).toBe(true);

      // Drop table
      await migration.down(queryRunner);
      const existsAfterDrop = await migration['tableExists'](queryRunner, 'test_users');
      expect(existsAfterDrop).toBe(false);
    });
  });

  describe('insert() and update()', () => {
    it('should insert and update data correctly', async () => {
      const migration = new TestMigration();
      await migration.up(queryRunner);

      // Insert data
      await migration['insert'](queryRunner, 'test_users', [
        { name: 'John Doe', email: 'john@example.com', age: 30 },
        { name: 'Jane Doe', email: 'jane@example.com', age: 25 },
      ]);

      // Verify insertion
      const users = await queryRunner.query('SELECT * FROM test_users');
      expect(users).toHaveLength(2);
      expect(users[0].name).toBe('John Doe');
      expect(users[0].email).toBe('john@example.com');

      // Update data
      await migration['update'](queryRunner, 'test_users', { age: 31 }, { email: 'john@example.com' });

      // Verify update
      const updatedUsers = await queryRunner.query("SELECT * FROM test_users WHERE email = 'john@example.com'");
      expect(updatedUsers[0].age).toBe(31);
    });
  });

  describe('delete()', () => {
    it('should delete data correctly', async () => {
      const migration = new TestMigration();
      await migration.up(queryRunner);

      // Insert data
      await migration['insert'](queryRunner, 'test_users', [
        { name: 'John Doe', email: 'john@example.com', age: 30 },
        { name: 'Jane Doe', email: 'jane@example.com', age: 25 },
      ]);

      // Delete one record
      await migration['delete'](queryRunner, 'test_users', { email: 'john@example.com' });

      // Verify deletion
      const users = await queryRunner.query('SELECT * FROM test_users');
      expect(users).toHaveLength(1);
      expect(users[0].email).toBe('jane@example.com');
    });
  });

  describe('escapeIdentifier()', () => {
    it('should escape identifiers correctly for SQLite', async () => {
      const migration = new TestMigration();
      const escaped = migration['escapeIdentifier'](queryRunner, 'test_table');
      expect(escaped).toBe('"test_table"');
    });

    it('should reject invalid identifiers', () => {
      const migration = new TestMigration();
      expect(() => {
        migration['escapeIdentifier'](queryRunner, 'test-table');
      }).toThrow();
    });
  });
});
