import { DataSource } from 'typeorm';
import { Seeder } from '../../../src/database/seeders/Seeder';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * Test Entity
 */
@Entity('test_users')
class TestUser {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  email!: string;
}

/**
 * Test Seeder
 */
class TestSeeder extends Seeder {
  public async run(): Promise<void> {
    await this.create(TestUser, [
      { name: 'John Doe', email: 'john@example.com' },
      { name: 'Jane Doe', email: 'jane@example.com' },
    ]);
  }
}

describe('Seeder Database Compatibility', () => {
  let dataSource: DataSource;

  beforeEach(async () => {
    dataSource = new DataSource({
      type: 'sqlite',
      database: ':memory:',
      entities: [TestUser],
      synchronize: true,
      logging: false,
    });

    await dataSource.initialize();
    (global as any).dataSource = dataSource;
  });

  afterEach(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
    delete (global as any).dataSource;
  });

  describe('create() with entity class', () => {
    it('should create records using entity class', async () => {
      const seeder = new TestSeeder();
      await seeder.run();

      const repository = dataSource.getRepository(TestUser);
      const users = await repository.find();

      expect(users).toHaveLength(2);
      expect(users[0].name).toBe('John Doe');
      expect(users[0].email).toBe('john@example.com');
      expect(users[1].name).toBe('Jane Doe');
      expect(users[1].email).toBe('jane@example.com');
    });
  });

  describe('createRaw() with table name', () => {
    it('should create records using raw SQL', async () => {
      const seeder = new Seeder();
      await seeder['createRaw']('test_users', [
        { name: 'Raw User', email: 'raw@example.com' },
      ]);

      const repository = dataSource.getRepository(TestUser);
      const users = await repository.find();

      expect(users).toHaveLength(1);
      expect(users[0].name).toBe('Raw User');
      expect(users[0].email).toBe('raw@example.com');
    });
  });

  describe('query()', () => {
    it('should execute raw SQL queries', async () => {
      const seeder = new Seeder();
      
      // Insert via query
      await seeder['query']('INSERT INTO test_users (name, email) VALUES (?, ?)', ['Query User', 'query@example.com']);

      // Select via query
      const result = await seeder['query']('SELECT * FROM test_users WHERE email = ?', ['query@example.com']);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Query User');
      expect(result[0].email).toBe('query@example.com');
    });
  });

  describe('error handling', () => {
    it('should throw error when dataSource is not available', () => {
      const seeder = new Seeder();
      (seeder as any).dataSource = null;

      expect(async () => {
        await seeder['create'](TestUser, [{ name: 'Test', email: 'test@example.com' }]);
      }).rejects.toThrow('Database connection not available');
    });
  });
});
